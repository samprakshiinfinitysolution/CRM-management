import { Router } from 'express';
import {
  uploadAndPreviewSheet,
  commitImport,
  getImportBatches,
  getImportBatchDetails,
  downloadTemplate,
} from '../controllers/import.controller.js';
import { uploadLeadSheet } from '../middleware/upload.middleware.js';
import { authenticateUser, requireRole } from '../middleware/auth.middleware.js';
import { UserRole } from '../types/index.js';

const importRouter = Router();

// All import endpoints require authenticated Team Leader
importRouter.use(authenticateUser);
importRouter.use(requireRole(UserRole.TEAM_LEADER));

// Template download endpoint (accessible to authenticated users or preview)
importRouter.get('/template', downloadTemplate);

// Preview & Extract lead data from uploaded Excel/CSV sheet
importRouter.post(
  '/upload',
  uploadLeadSheet.single('file'),
  uploadAndPreviewSheet
);

importRouter.post(
  '/preview',
  uploadLeadSheet.single('file'),
  uploadAndPreviewSheet
);

// Fallback direct POST to /api/imports
importRouter.post(
  '/',
  uploadLeadSheet.single('file'),
  uploadAndPreviewSheet
);

// Commit staged leads into CRM Database (Protected: Team Leader)
importRouter.post(
  '/commit',
  requireRole(UserRole.TEAM_LEADER),
  commitImport
);

// Get past import batches (Protected: Team Leader)
importRouter.get(
  '/batches',
  authenticateUser,
  requireRole(UserRole.TEAM_LEADER),
  getImportBatches
);

// Get specific batch details with errors (Protected: Team Leader)
importRouter.get(
  '/batches/:id',
  authenticateUser,
  requireRole(UserRole.TEAM_LEADER),
  getImportBatchDetails
);

export default importRouter;
