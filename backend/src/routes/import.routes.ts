import { Router } from "express";
import {
  uploadAndPreviewSheet,
  commitImport,
  getImportBatches,
  getImportBatchDetails,
  downloadTemplate,
  getImportErrorsExport,
} from "../controllers/import.controller.js";
import { uploadLeadSheet } from "../middleware/upload.middleware.js";
import {
  authenticateUser,
  requireRole,
} from "../middleware/auth.middleware.js";
import { importLimiter } from "../middleware/rateLimiter.middleware.js";
import { UserRole } from "../types/index.js";

const importRouter = Router();

// All import endpoints require authenticated Team Leader or Admin
importRouter.use(authenticateUser);
importRouter.use(requireRole(UserRole.TEAM_LEADER, UserRole.ADMIN));

// Template download endpoint (accessible to authenticated users or preview)
importRouter.get("/template", downloadTemplate);

// Preview & Extract lead data from uploaded Excel/CSV sheet
importRouter.post(
  "/upload",
  importLimiter,
  uploadLeadSheet.single("file"),
  uploadAndPreviewSheet,
);

importRouter.post(
  "/preview",
  importLimiter,
  uploadLeadSheet.single("file"),
  uploadAndPreviewSheet,
);

// Fallback direct POST to /api/imports
importRouter.post(
  "/",
  importLimiter,
  uploadLeadSheet.single("file"),
  uploadAndPreviewSheet,
);

// Commit staged leads into CRM Database (Protected: Team Leader & Admin)
importRouter.post(
  "/commit",
  importLimiter,
  commitImport,
);

// Get past import batches (Protected: Team Leader & Admin)
importRouter.get(
  "/batches",
  getImportBatches,
);

// Get specific batch details with errors (Protected: Team Leader & Admin)
importRouter.get(
  "/batches/:id",
  getImportBatchDetails,
);

// Get import errors
importRouter.get(
  "/batches/:id/errors/export",
  getImportErrorsExport,
);

export default importRouter;
