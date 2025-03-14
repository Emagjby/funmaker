import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

interface AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

export const errorMiddleware = (
  err: AppError,
  req: Request,
  res: Response,
  // We need to include next in the parameters for Express to recognize this as an error middleware
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  logger.error(`${statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  logger.error(err.stack);

  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production' && !err.isOperational
    ? 'Something went wrong'
    : err.message;

  res.status(statusCode).json({
    status,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
}; 