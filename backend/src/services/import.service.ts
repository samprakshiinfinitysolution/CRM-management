import prisma from "../config/db.js";
import {
  parseExcelBuffer,
  createLeadExcelTemplateBuffer,
} from "../utils/excelParser.js";
import {
  StagedLeadRow,
  ImportPreviewResult,
  CommitImportResult,
  LeadStatus,
  PriorityLevel,
} from "../types/index.js";
import { AppError } from "../middleware/errorHandler.js";
import AuditService from "./audit.service.js";

export class ImportService {
  /**
   * Parses uploaded Excel/CSV file, extracts and validates lead rows,
   * and cross-checks with the database for duplicates.
   */
  public async previewAndExtractSheet(
    fileBuffer: Buffer,
    fileName: string,
  ): Promise<ImportPreviewResult> {
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new AppError("Uploaded file buffer is empty", 400, "EMPTY_FILE");
    }

    // 1. Parse sheet into normalized staged rows
    const { headersDetected, stagedRows } = parseExcelBuffer(
      fileBuffer,
      fileName,
    );

    if (stagedRows.length === 0) {
      return {
        fileName,
        totalRows: 0,
        validCount: 0,
        duplicateCount: 0,
        invalidCount: 0,
        headersDetected,
        rows: [],
      };
    }

    // 2. Collect unique non-empty mobile numbers and email addresses for DB lookup
    const mobilesToCheck = Array.from(
      new Set(
        stagedRows
          .map((r) => r.mobile)
          .filter((m) => m && m !== "N/A" && m.replace(/\D/g, "").length >= 10),
      ),
    );

    const emailsToCheck = Array.from(
      new Set(
        stagedRows
          .map((r) => r.email)
          .filter((e): e is string => Boolean(e && e.length > 0)),
      ),
    );

    // 3. Query existing non-deleted leads from the database
    const existingLeads = await prisma.lead.findMany({
      where: {
        isDeleted: false,
        OR: [
          ...(mobilesToCheck.length > 0
            ? [{ mobile: { in: mobilesToCheck } }]
            : []),
          ...(emailsToCheck.length > 0
            ? [{ email: { in: emailsToCheck } }]
            : []),
        ],
      },
      select: {
        id: true,
        leadCode: true,
        customerName: true,
        mobile: true,
        email: true,
      },
    });

    const existingByMobile = new Map<
      string,
      { leadCode: string; customerName: string }
    >();
    const existingByEmail = new Map<
      string,
      { leadCode: string; customerName: string }
    >();

    existingLeads.forEach((lead) => {
      if (lead.mobile) {
        existingByMobile.set(lead.mobile, {
          leadCode: lead.leadCode,
          customerName: lead.customerName,
        });
      }
      if (lead.email) {
        existingByEmail.set(lead.email.toLowerCase(), {
          leadCode: lead.leadCode,
          customerName: lead.customerName,
        });
      }
    });

    // 4. Update status and notes for rows matching DB duplicates
    let validCount = 0;
    let duplicateCount = 0;
    let invalidCount = 0;

    const enrichedRows = stagedRows.map((row) => {
      // If already marked INVALID due to schema validation failure, retain it
      if (row.status === "INVALID") {
        invalidCount++;
        return row;
      }

      // If already marked DUPLICATE due to in-file collision, retain it
      if (row.status === "DUPLICATE") {
        duplicateCount++;
        return row;
      }

      // Check DB mobile duplicate
      const dbMobileMatch = row.mobile
        ? existingByMobile.get(row.mobile)
        : null;
      if (dbMobileMatch) {
        duplicateCount++;
        return {
          ...row,
          status: "DUPLICATE" as const,
          duplicateWithLeadCode: dbMobileMatch.leadCode,
          validationNote: `Mobile matches existing CRM Lead (${dbMobileMatch.leadCode} - ${dbMobileMatch.customerName})`,
        };
      }

      // Check DB email duplicate
      const dbEmailMatch = row.email
        ? existingByEmail.get(row.email.toLowerCase())
        : null;
      if (dbEmailMatch) {
        duplicateCount++;
        return {
          ...row,
          status: "DUPLICATE" as const,
          duplicateWithLeadCode: dbEmailMatch.leadCode,
          validationNote: `Email matches existing CRM Lead (${dbEmailMatch.leadCode} - ${dbEmailMatch.customerName})`,
        };
      }

      // Clean & valid row
      validCount++;
      return row;
    });

    return {
      fileName,
      totalRows: enrichedRows.length,
      validCount,
      duplicateCount,
      invalidCount,
      headersDetected,
      rows: enrichedRows,
    };
  }

  /**
   * Commits staged leads into the PostgreSQL database inside an atomic ACID transaction.
   */
  public async commitImportBatch(
    userId: string,
    fileName: string,
    rows: StagedLeadRow[],
    skipDuplicates: boolean = true,
  ): Promise<CommitImportResult> {
    if (!rows || rows.length === 0) {
      throw new AppError(
        "No rows provided for import commitment",
        400,
        "NO_ROWS",
      );
    }

    // Filter rows to be ingested
    const rowsToIngest = rows.filter((row) => {
      if (row.status === "VALID") return true;
      if (!skipDuplicates && row.status === "DUPLICATE") return true;
      return false;
    });

    const failedOrSkippedRows = rows.filter((r) => !rowsToIngest.includes(r));

    // Execute atomic transaction
    return await prisma.$transaction(async (tx) => {
      const importedLeadCodes: string[] = [];
      let duplicateCount = 0;
      let failedCount = 0;

      // 1. Create ImportBatch record
      const batch = await tx.importBatch.create({
        data: {
          fileName,
          uploadedByUserId: userId,
          totalRows: rows.length,
          importedCount: 0, // updated after insertion
          duplicateCount: 0,
          failedCount: 0,
        },
      });

      // 2. Batch ingest lead records
      if (rowsToIngest.length > 0) {
        const leadDataToInsert = rowsToIngest.map((row) => ({
          customerName: row.customerName,
          mobile: row.mobile,
          alternateMobile: row.alternateMobile || null,
          email: row.email || null,
          companyName: row.companyName || null,
          city: row.city || null,
          state: row.state || null,
          requirement: row.requirement || "Imported requirement",
          productService: row.productService || null,
          budget:
            row.budget !== null && row.budget !== undefined ? row.budget : null,
          leadSource: row.leadSource || "EXCEL_IMPORT",
          priority: row.priority || PriorityLevel.MEDIUM,
          status: LeadStatus.NEW,
          assignedToUserId: null,
          assignedByUserId: null,
        }));

        const createdLeads = await tx.lead.createManyAndReturn({
          data: leadDataToInsert,
          select: { id: true, leadCode: true },
        });

        createdLeads.forEach((lead: { id: string; leadCode: string }) => {
          importedLeadCodes.push(lead.leadCode);
        });

        // Batch insert immutable LeadActivity logs (1 query)
        const activities = rowsToIngest.map((row, idx) => {
          const lead = createdLeads[idx];
          return {
            leadId: lead.id,
            actorUserId: userId,
            actionType: "IMPORT",
            description: `Lead created via Excel Import batch "${fileName}" (${batch.id})`,
            metadata: {
              batchId: batch.id,
              leadCode: lead.leadCode,
              rowNumber: row.rowNumber,
              leadSource: row.leadSource,
            },
          };
        });

        await tx.leadActivity.createMany({ data: activities });

        // Batch insert initial import notes (1 query)
        const notesToInsert = rowsToIngest
          .map((row, idx) => {
            if (!row.remarks || !row.remarks.trim()) return null;
            const lead = createdLeads[idx];
            return {
              leadId: lead.id,
              authorUserId: userId,
              content: `Initial Import Note: ${row.remarks.trim()}`,
            };
          })
          .filter((n): n is NonNullable<typeof n> => n !== null);

        if (notesToInsert.length > 0) {
          await tx.leadNote.createMany({ data: notesToInsert });
        }
      }

      // 3. Batch log errors and skipped rows in ImportError table (1 query)
      if (failedOrSkippedRows.length > 0) {
        const errorRecords = failedOrSkippedRows.map((row) => {
          if (row.status === "DUPLICATE") {
            duplicateCount++;
          } else {
            failedCount++;
          }

          return {
            batchId: batch.id,
            rowNumber: row.rowNumber,
            columnName: row.status === "INVALID" ? "Validation" : "Duplicate",
            errorMessage: row.validationNote,
            rawRowData: row.rawRowData || (row as any),
          };
        });

        await tx.importError.createMany({ data: errorRecords });
      }

      // 5. Update final batch statistics
      await tx.importBatch.update({
        where: { id: batch.id },
        data: {
          importedCount: importedLeadCodes.length,
          duplicateCount,
          failedCount,
        },
      });

      // 6. Append to system AuditLog
      await AuditService.log({
        tx,
        actorUserId: userId,
        action: "IMPORT",
        entityType: "ImportBatch",
        entityId: batch.id,
        newValue: {
          fileName,
          importedCount: importedLeadCodes.length,
          duplicateCount,
          failedCount,
          totalRows: rows.length,
        },
      });

      return {
        batchId: batch.id,
        fileName,
        totalRows: rows.length,
        importedCount: importedLeadCodes.length,
        duplicateCount,
        failedCount,
        importedLeadCodes,
      };
    });
  }

  /**
   * Retrieves paginated import batch history
   */
  public async getImportBatches(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [total, batches] = await Promise.all([
      prisma.importBatch.count(),
      prisma.importBatch.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          _count: {
            select: { errors: true },
          },
        },
      }),
    ]);

    return {
      batches,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Retrieves specific batch details with errors
   */
  public async getImportBatchById(batchId: string) {
    const batch = await prisma.importBatch.findUnique({
      where: { id: batchId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        errors: {
          orderBy: { rowNumber: "asc" },
        },
      },
    });

    if (!batch) {
      throw new AppError(
        `Import batch with ID ${batchId} not found`,
        404,
        "NOT_FOUND",
      );
    }

    return batch;
  }

  /**
   * Generates downloadable lead template buffer
   */
  public getTemplateBuffer(includeSampleData: boolean = true): Buffer {
    return createLeadExcelTemplateBuffer(includeSampleData);
  }
}

export const importService = new ImportService();
export default importService;
