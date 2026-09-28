import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiResponse } from '../types/index.js';
import { normalizePrismaError } from '../utils/prismaError.js';

export class AppError extends Error {
  public statusCode: number;
  public errorCode?: string;

  constructor(message: string, statusCode: number = 500, errorCode?: string) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 1. Prisma Error Normalization
  const prismaNormalized = normalizePrismaError(err);
  if (prismaNormalized) {
    const response: ApiResponse = {
      success: false,
      message: prismaNormalized.message,
      error: {
        code: prismaNormalized.errorCode,
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      },
    };

    res.status(prismaNormalized.statusCode).json(response);
    return;
  }

  // 2. Zod Validation Error Normalization
  if (err instanceof ZodError) {
    const firstIssue = err.issues[0]?.message || 'Validation failed';
    const response: ApiResponse = {
      success: false,
      message: firstIssue,
      error: {
        code: 'VALIDATION_ERROR',
        details: err.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        })),
      },
    };

    res.status(400).json(response);
    return;
  }

  // 3. Application Domain Errors (AppError) or Generic Errors
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const response: ApiResponse = {
    success: false,
    message,
    error: {
      code: err.errorCode || 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  };

  res.status(statusCode).json(response);
};

export default errorHandler;
