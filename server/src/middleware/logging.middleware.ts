import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;
  
  // Log when request is received
  logger.info(`${method} ${originalUrl} - ${ip}`);
  
  // Once response is finished, log completion details
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    const level = statusCode < 400 ? 'info' : 'error';
    logger[level](`${method} ${originalUrl} ${statusCode} - ${duration}ms`);
  });
  
  next();
}; 