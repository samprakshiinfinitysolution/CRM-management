import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index.js';
import { ExportService } from '../services/export.service.js';
import { getAuthUser } from '../utils/auth.helper.js';

/**
 * Controller endpoint: POST /api/exports/leads
 * Exports filtered or selected leads into an Excel (.xlsx) file.
 */
export const exportLeads = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = getAuthUser(req);
    const filterInput = req.body || {};

    const { buffer, contentType, fileName } = await ExportService.exportLeadsToExcel(
      filterInput,
      { id: user.id, role: user.role }
    );

    res.setHeader(
      'Content-Type',
      contentType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileName || 'leads.xlsx'}"`
    );
    res.setHeader('Content-Length', buffer.length);

    res.status(200).send(buffer);
  } catch (error) {
    next(error);
  }
};
