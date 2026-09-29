import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { AppError } from './errorHandler.js';

// Configure in-memory storage for uploaded files
const storage = multer.memoryStorage();

// Allowed file extensions and mimetypes for lead imports
const allowedExtensions = ['.xlsx', '.xls', '.csv'];
const allowedMimeTypes = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
  'application/csv',
  'text/plain',
  'application/octet-stream', // often sent by some browsers for csv/xlsx
];

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext) || allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `Unsupported file format (${ext || file.mimetype}). Please upload an Excel (.xlsx, .xls) or CSV file.`,
        400,
        'INVALID_FILE_TYPE'
      )
    );
  }
};

export const uploadLeadSheet = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB maximum file size
    files: 1,
  },
  fileFilter,
});
