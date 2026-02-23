// ==========================================
// ERROR HANDLER MIDDLEWARE
// ==========================================

import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  const timestamp = new Date().toISOString();

  if (err instanceof AppError) {
    // Operational errors — log at warn level for 4xx, error for 5xx
    if (err.statusCode >= 500) {
      console.error(`[${timestamp}] ${req.method} ${req.path} — ${err.statusCode}: ${err.message}`);
    } else {
      console.warn(`[${timestamp}] ${req.method} ${req.path} — ${err.statusCode}: ${err.message}`);
    }
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    console.error(`[${timestamp}] Prisma error on ${req.method} ${req.path}:`, err);
    return res.status(400).json({
      success: false,
      error: 'Database operation failed',
    });
  }

  // Prisma connection errors
  if (err.name === 'PrismaClientInitializationError') {
    console.error(`[${timestamp}] CRITICAL: Database connection failed:`, err.message);
    return res.status(503).json({
      success: false,
      error: 'Database unavailable',
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    console.warn(`[${timestamp}] Validation error on ${req.method} ${req.path}: ${err.message}`);
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  // Unexpected errors — always log full stack
  console.error(`[${timestamp}] Unhandled error on ${req.method} ${req.path}:`, err);
  return res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
  });
};
