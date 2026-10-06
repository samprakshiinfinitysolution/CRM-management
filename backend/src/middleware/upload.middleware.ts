import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";
import { AppError } from "./errorHandler.js";
import crypto from "crypto";

const uploadDir = path.resolve("tmp/uploads");

fs.mkdirSync(uploadDir, {
  recursive: true,
});

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },

  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    cb(
      null,
      `${crypto.randomUUID()}${ext}`,
    );
  },
});

const allowedFileTypes = {
  ".xlsx": [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],

  ".xls": [
    "application/vnd.ms-excel",
  ],

  ".csv": [
    "text/csv",
    "application/csv",
  ],
} as const;

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const ext = path.extname(file.originalname).toLowerCase();

  const allowedMimeTypes =
    allowedFileTypes[ext as keyof typeof allowedFileTypes];

  if (!allowedMimeTypes) {
    return cb(
      new AppError(
        `Unsupported file extension "${ext || "unknown"}". Please upload an Excel (.xlsx, .xls) or CSV file.`,
        400,
        "INVALID_FILE_TYPE",
      ),
    );
  }

  if (!allowedMimeTypes.includes(file.mimetype as never)) {
    return cb(
      new AppError(
        `Invalid MIME type "${file.mimetype}" for "${ext}" file.`,
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
    fileSize: 15 * 1024 * 1024,
    files: 1,
  },

  fileFilter,
});