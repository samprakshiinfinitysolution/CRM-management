import multer from "multer";
import path from "path";
import { Request } from "express";
import { AppError } from "./errorHandler.js";

// Use memory storage for direct buffer processing and cloud container safety
const storage = multer.memoryStorage();

const allowedFileTypes: Record<string, string[]> = {
  ".xlsx": [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/octet-stream",
    "application/x-zip-compressed",
    "application/zip",
  ],
  ".xls": [
    "application/vnd.ms-excel",
    "application/msexcel",
    "application/x-msexcel",
    "application/x-ms-excel",
    "application/x-excel",
    "application/x-dos_ms_excel",
    "application/xls",
    "application/x-xls",
    "application/octet-stream",
  ],
  ".csv": [
    "text/csv",
    "application/csv",
    "text/plain",
    "text/x-csv",
    "application/vnd.ms-excel",
    "text/comma-separated-values",
    "application/octet-stream",
  ],
};

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMimeTypes = allowedFileTypes[ext];

  if (!allowedMimeTypes) {
    return cb(
      new AppError(
        `Unsupported file extension "${ext || "unknown"}". Please upload an Excel (.xlsx, .xls) or CSV file.`,
        400,
        "INVALID_FILE_TYPE",
      ),
    );
  }

  // If MIME type is present, ensure it matches common expected types or generic binary
  if (file.mimetype && !allowedMimeTypes.includes(file.mimetype) && file.mimetype !== "application/octet-stream") {
    return cb(
      new AppError(
        `Invalid MIME type "${file.mimetype}" for "${ext}" file. Please ensure you upload a valid Excel or CSV file.`,
        400,
        "INVALID_FILE_TYPE",
      ),
    );
  }

  cb(null, true);
};

export const uploadLeadSheet = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15 MB
    files: 1,
  },
  fileFilter,
});