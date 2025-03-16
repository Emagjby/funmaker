import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { supabase } from '../db/supabase';

// Add a user property to Express Request type using module augmentation
declare module 'express' {
  interface Request {
    user?: {
      id: string;
      email: string;
      role?: string;
    };
  }
}

/**
 * Authentication middleware to verify JWT tokens from Supabase Auth
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Get the token from the Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'Authentication token is required' });
  }

  try {
    // Use Supabase's built-in method to verify the token and get the user
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Add the user information to the request object
    req.user = {
      id: user.id,
      email: user.email || '',
      role: user.app_metadata?.role || 'user',
    };
    
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Alias for authMiddleware to match test function naming
 * This function is primarily for test compatibility
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  // Get the token from the Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  // Check token format
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Invalid token format' });
  }
  
  const token = parts[1];
  
  // Empty token check
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Use Supabase's built-in method to verify the token and get the user
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Add the user information to the request object
    req.user = {
      id: data.user.id,
      email: data.user.email || '',
      role: data.user.app_metadata?.role || 'user',
    };
    
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication server error' });
  }
};

/**
 * Admin role check middleware
 */
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin privileges required' });
  }

  next();
}; 