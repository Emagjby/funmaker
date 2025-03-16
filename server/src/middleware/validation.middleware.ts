import { Request, Response, NextFunction } from 'express';

/**
 * Validates user registration input
 */
export const validateRegisterInput = (req: Request, res: Response, next: NextFunction) => {
  const { email, password, username } = req.body;

  // Check required fields
  if (!email || !password || !username) {
    return res.status(400).json({ error: 'Email, password, and username are required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Validate password length
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }

  // Validate username length
  if (username.length < 3 || username.length > 30) {
    return res.status(400).json({ error: 'Username must be between 3 and 30 characters' });
  }

  // Validate username characters
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
  }

  next();
};

/**
 * Validates user login input
 */
export const validateLoginInput = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  // Check required fields
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  next();
};

/**
 * Validates user profile update input
 */
export const validateProfileUpdateInput = (req: Request, res: Response, next: NextFunction) => {
  const { username, profile_image_url } = req.body;

  // Check if at least one field is provided
  if (!username && !profile_image_url) {
    return res.status(400).json({ error: 'At least one field must be provided for update' });
  }

  // Validate username if provided
  if (username) {
    // Validate username length
    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({ error: 'Username must be between 3 and 30 characters' });
    }

    // Validate username characters
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
    }
  }

  // Validate profile image URL if provided
  if (profile_image_url) {
    try {
      new URL(profile_image_url);
    } catch (error) {
      return res.status(400).json({ error: 'Profile image URL must be a valid URL' });
    }
  }

  next();
}; 