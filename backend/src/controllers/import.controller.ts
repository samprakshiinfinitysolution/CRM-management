import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index.js';
import importService from '../services/import.service.js';
import { AppError } from '../middleware/errorHandler.js';
import prisma from '../config/db.js';

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

    // Get current authenticated user or fallback to first active Team Leader in system
    let userId = req.user?.id;
    if (!userId) {
      const defaultTL = await prisma.user.findFirst({
        where: { role: 'TEAM_LEADER', isActive: true },
        select: { id: true },
      });
      if (defaultTL) {
        userId = defaultTL.id;
      } else {
        const anyUser = await prisma.user.findFirst({ select: { id: true } });
        if (!anyUser) {
          throw new AppError(
            'No user account exists in system to associate import with.',
            400,
            'NO_USER_FOUND'
          );
        }
        userId = anyUser.id;
      }
    }

    const commitResult = await importService.commitImportBatch(
      userId || "",
      fileName,
      rows,
      Boolean(skipDuplicates)
    );

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
