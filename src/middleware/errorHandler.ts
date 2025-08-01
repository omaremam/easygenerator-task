import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error in all environments
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    statusCode,
    url: req.url,
    method: req.method,
  });

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env['NODE_ENV'] === 'development' && { stack: err.stack }),
    },
  });
}; 