import { Response, NextFunction } from 'express';
import * as XLSX from 'xlsx';
import { AuthRequest } from '../types/index.js';
import importService from '../services/import.service.js';
import { NotificationService } from '../services/notification.service.js';
import { AppError } from '../middleware/errorHandler.js';
import prisma from '../config/db.js';
import AuditService from '../services/audit.service.js';
import { getAuthUser } from '../utils/auth.helper.js';

/**
 * Upload and extract Lead Excel/CSV sheet
 * Returns staged rows, validation results, duplicate detection, and summary statistics.
 */
export const uploadAndPreviewSheet = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let fileBuffer: Buffer | undefined;
    let fileName: string = 'uploaded_leads.xlsx';

    if (req.file) {
      fileBuffer = req.file.buffer;
      fileName = req.file.originalname || fileName;
    } else if (req.body.base64Data) {
      // Support base64 payload
      const base64String = req.body.base64Data.replace(/^data:.*;base64,/, '');
      fileBuffer = Buffer.from(base64String, 'base64');
      if (req.body.fileName) fileName = req.body.fileName;
    } else {
      throw new AppError(
        'Please upload an Excel/CSV file (using multipart/form-data with field name "file")',
        400,
        'NO_FILE_PROVIDED'
      );
    }

    const previewResult = await importService.previewAndExtractSheet(
      fileBuffer,
      fileName
    );

    await AuditService.log({
      action: 'IMPORT_PREVIEW',
      entityType: 'ImportBatch',
      actorUserId: req.user?.id,
      ipAddress: req.ip || req.socket?.remoteAddress,
      newValue: {
        fileName,
        totalRows: previewResult.totalRows,
        validCount: previewResult.validCount,
        duplicateCount: previewResult.duplicateCount,
        invalidCount: previewResult.invalidCount,
      },
    });

    res.status(200).json({
      success: true,
      message: `Extracted ${previewResult.totalRows} lead records (${previewResult.validCount} valid, ${previewResult.duplicateCount} duplicates, ${previewResult.invalidCount} invalid)`,
      data: previewResult,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Commits verified staged leads into CRM Database inside an ACID transaction
 */
export const commitImport = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { fileName = 'manual_import.xlsx', rows, skipDuplicates = true } = req.body;

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      throw new AppError('No rows provided in payload to commit', 400, 'EMPTY_PAYLOAD');
    }

    // Get verified authenticated user
    const user = getAuthUser(req);
    const userId = user.id;

    const commitResult = await importService.commitImportBatch(
      userId,
      fileName,
      rows,
      Boolean(skipDuplicates)
    );

    // Non-blocking notification dispatch with actor attribution
    NotificationService.notifyLeadsImported({
      count: commitResult.importedCount,
      fileName,
      actorUserId: userId || "",
      actorName: req.user?.name,
      actorRole: req.user?.role,
    }).catch((err) => {
      console.error('Non-fatal notification error in commitImport:', err);
    });

    res.status(201).json({
      success: true,
      message: `Successfully imported ${commitResult.importedCount} leads into the unassigned pool.`,
      data: commitResult,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lists past import batches with pagination
 */
export const getImportBatches = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;

    const result = await importService.getImportBatches(page, limit);

    res.status(200).json({
      success: true,
      data: result.batches,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Gets details of a specific import batch including row-level error logs
 */
export const getImportBatchDetails = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const batch = await importService.getImportBatchById(id);

    res.status(200).json({
      success: true,
      data: batch,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Downloads official pre-formatted Excel template for lead data
 */
export const downloadTemplate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const includeSample = req.query.sample !== 'false';
    const buffer = importService.getTemplateBuffer(includeSample);

    res.setHeader(

      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="CRM_Leads_Template.xlsx"'
    );

    res.send(buffer);
  } catch (error) {
    next(error);
  }
};


/**
 * Exports row-level import errors to a downloadable Excel file.
 * Supports filtering by batch ID and error status (valid, invalid, duplicate).
 */
export const getImportErrorsExport = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const batchId = req.params.id || (typeof req.query.batchId === 'string' ? req.query.batchId : undefined);

    if (!batchId) {
      throw new AppError('Valid batchId is required', 400, 'BAD_REQUEST');
    }

    const batch = await importService.getImportBatchById(batchId);

    const errorData = batch.errors.map((err) => ({
      'Row Number': err.rowNumber,
      'Column': err.columnName || 'N/A',
      'Error Message': err.errorMessage,
      'Raw Row Data': typeof err.rawRowData === 'object' ? JSON.stringify(err.rawRowData) : String(err.rawRowData || ''),
    }));

    const worksheet = XLSX.utils.json_to_sheet(errorData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Import Errors');

    const excelBuffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="import-errors-${batch.fileName || batch.id}.xlsx"`
    );

    res.send(excelBuffer);
  } catch (error) {
    next(error);
  }
};
