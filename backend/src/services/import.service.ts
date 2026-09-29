import prisma from '../config/db.js';
import {
  parseExcelBuffer,
  createLeadExcelTemplateBuffer,
} from '../utils/excelParser.js';
import {
  StagedLeadRow,
  ImportPreviewResult,
  CommitImportResult,
  LeadStatus,
  PriorityLevel,
} from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';

export class ImportService {
  /**
   * Parses uploaded Excel/CSV file, extracts and validates lead rows,
   * and cross-checks with the database for duplicates.
   */
  public async previewAndExtractSheet(
    fileBuffer: Buffer,
    fileName: string
  ): Promise<ImportPreviewResult> {
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new AppError('Uploaded file buffer is empty', 400, 'EMPTY_FILE');
    }

    // 1. Parse sheet into normalized staged rows
    const { headersDetected, stagedRows } = parseExcelBuffer(
      fileBuffer,
      fileName
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
          .filter((m) => m && m !== 'N/A' && m.replace(/\D/g, '').length >= 10)
      )
    );

    const emailsToCheck = Array.from(
      new Set(
        stagedRows
          .map((r) => r.email)
          .filter((e): e is string => Boolean(e && e.length > 0))
      )
    );

    // 3. Query existing non-deleted leads from the database
    const existingLeads = await prisma.lead.findMany({
      where: {
        isDeleted: false,
        OR: [
          ...(mobilesToCheck.length > 0 ? [{ mobile: { in: mobilesToCheck } }] : []),
          ...(emailsToCheck.length > 0 ? [{ email: { in: emailsToCheck } }] : []),
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

    const existingByMobile = new Map<string, { leadCode: string; customerName: string }>();
    const existingByEmail = new Map<string, { leadCode: string; customerName: string }>();

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
      if (row.status === 'INVALID') {
        invalidCount++;
        return row;
      }

      // If already marked DUPLICATE due to in-file collision, retain it
      if (row.status === 'DUPLICATE') {
        duplicateCount++;
        return row;
      }

      // Check DB mobile duplicate
      const dbMobileMatch = row.mobile ? existingByMobile.get(row.mobile) : null;
      if (dbMobileMatch) {
        duplicateCount++;
        return {
          ...row,
          status: 'DUPLICATE' as const,
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
          status: 'DUPLICATE' as const,
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
    skipDuplicates: boolean = true
  ): Promise<CommitImportResult> {
    if (!rows || rows.length === 0) {
      throw new AppError('No rows provided for import commitment', 400, 'NO_ROWS');
    }

    // Filter rows to be ingested
    const rowsToIngest = rows.filter((row) => {
      if (row.status === 'VALID') return true;
      if (!skipDuplicates && row.status === 'DUPLICATE') return true;
      return false;
    });

    const failedOrSkippedRows = rows.filter((r) => !rowsToIngest.includes(r));

    // Execute atomic transaction
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch current highest CRM-XXXXXX leadCode sequence to prevent duplicate key collisions
      const highestLead = await tx.lead.findFirst({
        where: {
          leadCode: {
            startsWith: 'CRM-',
          },
        },
        orderBy: {
          leadCode: 'desc',
        },
        select: {
          leadCode: true,
        },
      });

      let nextSequence = 1;
      if (highestLead && highestLead.leadCode) {
        const match = highestLead.leadCode.match(/CRM-(\d+)/);
        if (match && match[1]) {
          nextSequence = parseInt(match[1], 10) + 1;
        }
      }

      const importedLeadCodes: string[] = [];
      let duplicateCount = 0;
      let failedCount = 0;

      // 2. Create ImportBatch record
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

      // 3. Ingest each permitted lead record
      for (const row of rowsToIngest) {
        const leadCode = `CRM-${String(nextSequence).padStart(6, '0')}`;
        nextSequence++;

        const createdLead = await tx.lead.create({
          data: {
            leadCode,
            customerName: row.customerName,
            mobile: row.mobile,
            alternateMobile: row.alternateMobile || null,
            email: row.email || null,
            companyName: row.companyName || null,
            city: row.city || null,
            state: row.state || null,
            requirement: row.requirement || 'Imported requirement',
            productService: row.productService || null,
            budget: row.budget !== null && row.budget !== undefined ? row.budget : null,
            leadSource: row.leadSource || 'EXCEL_IMPORT',
            priority: row.priority || PriorityLevel.MEDIUM,
            status: LeadStatus.NEW,
            assignedToUserId: null,
            assignedByUserId: null,
          },
        });

        importedLeadCodes.push(leadCode);

        // Append to immutable LeadActivity
        await tx.leadActivity.create({
          data: {
            leadId: createdLead.id,
            actorUserId: userId,
            actionType: 'IMPORT',
            description: `Lead created via Excel Import batch "${fileName}" (${batch.id})`,
            metadata: {
              batchId: batch.id,
              rowNumber: row.rowNumber,
              leadSource: row.leadSource,
            },
          },
        });

        // Add note if remarks are present
        if (row.remarks && row.remarks.trim()) {
          await tx.leadNote.create({
            data: {
              leadId: createdLead.id,
              authorUserId: userId,
              content: `Initial Import Note: ${row.remarks.trim()}`,
            },
          });
        }
      }

      // 4. Log errors and skipped rows in ImportError table
      for (const row of failedOrSkippedRows) {
        if (row.status === 'DUPLICATE') {
          duplicateCount++;
        } else {
          failedCount++;
        }

        await tx.importError.create({
          data: {
            batchId: batch.id,
            rowNumber: row.rowNumber,
            columnName: row.status === 'INVALID' ? 'Validation' : 'Duplicate',
            errorMessage: row.validationNote,
            rawRowData: row.rawRowData || (row as any),
          },
        });
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
      await tx.auditLog.create({
        data: {
          actorUserId: userId,
          action: 'IMPORT',
          entityType: 'ImportBatch',
          entityId: batch.id,
          newValue: {
            fileName,
            importedCount: importedLeadCodes.length,
            duplicateCount,
            failedCount,
            totalRows: rows.length,
          },
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
        orderBy: { createdAt: 'desc' },
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
          orderBy: { rowNumber: 'asc' },
        },
      },
    });

    if (!batch) {
      throw new AppError(`Import batch with ID ${batchId} not found`, 404, 'NOT_FOUND');
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
