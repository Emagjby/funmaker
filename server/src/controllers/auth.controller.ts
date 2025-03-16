import { Request, Response } from 'express';
import { supabase } from '../db/supabase';
import { logger } from '../utils/logger';
import { ValidationError } from '../errors/ValidationError';

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
// Username validation regex (alphanumeric + underscore, 3-30 chars)
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;
// Password requirements: 8+ chars, uppercase, lowercase, number, special char
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/;

/**
 * Validates email format
 */
const validateEmail = (email: string): string | null => {
  if (!email) return 'Email is required';
  if (email.length > 100) return 'Email is too long (max 100 characters)';
  if (!EMAIL_REGEX.test(email)) return 'Email format is invalid';
  return null;
};

/**
 * Validates username format
 */
const validateUsername = (username: string): string | null => {
  if (!username) return 'Username is required';
  if (username.length < 3) return 'Username must be at least 3 characters';
  if (username.length > 30) return 'Username must be less than 30 characters';
  if (!USERNAME_REGEX.test(username)) {
    return 'Username can only contain letters, numbers, and underscores';
  }
  return null;
};

/**
 * Validates password strength
 */
const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!PASSWORD_REGEX.test(password)) {
    return 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character';
  }
  return null;
};

/**
 * User registration
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body;

    // Validate input
    const validationErrors = [];
    
    const emailError = validateEmail(email);
    if (emailError) validationErrors.push(emailError);
    
    const usernameError = validateUsername(username);
    if (usernameError) validationErrors.push(usernameError);
    
    const passwordError = validatePassword(password);
    if (passwordError) validationErrors.push(passwordError);
    
    if (validationErrors.length > 0) {
      throw new ValidationError(validationErrors.join('. '));
    }

    // Sanitize inputs
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedUsername = username.trim();

    // Check if username already exists
    const { data: existingUsers, error: queryError } = await supabase
      .from('users')
      .select('username')
      .eq('username', sanitizedUsername)
      .limit(1);

    if (queryError) {
      logger.error('Error checking existing username:', queryError);
      return res.status(500).json({ error: 'Failed to check username availability' });
    }

    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Check if email already exists (in Supabase Auth)
    const { data: existingUserData, error: existingUserError } = await supabase.auth.admin.listUsers();
    
    if (existingUserError) {
      logger.error('Error checking existing email:', existingUserError);
      return res.status(500).json({ error: 'Failed to check email availability' });
    }
    
    if (existingUserData?.users.some(user => user.email?.toLowerCase() === sanitizedEmail)) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: sanitizedEmail,
      password,
      options: {
        data: {
          username: sanitizedUsername,
        },
      },
    });

    if (authError) {
      logger.error('Registration error:', authError);
      return res.status(400).json({ error: authError.message });
    }

    if (!authData.user) {
      return res.status(500).json({ error: 'Failed to create user' });
    }

    // Use a raw SQL query to insert the user, bypassing RLS
    const { data: userData, error: userError } = await supabase.rpc('insert_user', {
      p_auth_id: authData.user.id, 
      p_email: sanitizedEmail,
      p_username: sanitizedUsername,
      p_points_balance: 1000,
      p_is_active: true
    });

    if (userError) {
      logger.error('Error creating user record:', userError);
      
      // Try to clean up the auth user if database insert failed
      await supabase.auth.admin.deleteUser(authData.user.id);
      
      return res.status(500).json({ error: 'Failed to create user record' });
    }

    // Return success response with user data and Supabase's session token
    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        points_balance: userData.points_balance
      },
      session: authData.session
    });
  } catch (error) {
    logger.error('Registration error:', error);
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Registration failed. Please try again later.' });
  }
};

/**
 * User login
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    const validationErrors = [];
    
    const emailError = validateEmail(email);
    if (emailError) validationErrors.push(emailError);
    
    if (!password) {
      validationErrors.push('Password is required');
    } else if (password.length < 8) {
      validationErrors.push('Password must be at least 8 characters');
    }
    
    if (validationErrors.length > 0) {
      throw new ValidationError(validationErrors.join('. '));
    }

    // Sanitize input
    const sanitizedEmail = email.trim().toLowerCase();

    // Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: sanitizedEmail,
      password,
    });

    if (authError) {
      logger.error('Login error:', authError);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!authData.user) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    // Get user data from our database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authData.user.id)
      .single();

    if (userError || !userData) {
      logger.error('Error fetching user data:', userError);
      return res.status(500).json({ error: 'Failed to fetch user data' });
    }

    // Update last login timestamp
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('auth_id', authData.user.id);

    // Return success response with user data and Supabase's session token
    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        points_balance: userData.points_balance,
        profile_image_url: userData.profile_image_url,
        is_active: userData.is_active,
      },
      // Include the session from Supabase
      session: authData.session,
    });
  } catch (error) {
    logger.error('Login exception:', error);
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Login failed. Please try again later.' });
  }
};

/**
 * Get user profile
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get user data from our database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', req.user.id)
      .single();

    if (userError || !userData) {
      logger.error('Error fetching user profile:', userError);
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }

    // Return user profile
    return res.status(200).json({
      user: {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        points_balance: userData.points_balance,
        profile_image_url: userData.profile_image_url,
        last_login_at: userData.last_login_at,
        is_active: userData.is_active,
        created_at: userData.created_at,
      },
    });
  } catch (error) {
    logger.error('Get profile exception:', error);
    return res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { username, profile_image_url } = req.body;
    const updateData: any = {};

    // Only include fields that are being updated
    if (username !== undefined) updateData.username = username;
    if (profile_image_url !== undefined) updateData.profile_image_url = profile_image_url;

    // If nothing to update, return early
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No update data provided' });
    }

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    // Check username uniqueness if being updated
    if (username) {
      const { data: existingUsers, error: queryError } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .neq('auth_id', req.user.id)
        .limit(1);

      if (queryError) {
        logger.error('Error checking username availability:', queryError);
        return res.status(500).json({ error: 'Failed to check username availability' });
      }

      if (existingUsers && existingUsers.length > 0) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    // Update user profile
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('auth_id', req.user.id)
      .select()
      .single();

    if (updateError) {
      logger.error('Error updating user profile:', updateError);
      return res.status(500).json({ error: 'Failed to update user profile' });
    }

    // Return updated user data
    return res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        points_balance: updatedUser.points_balance,
        profile_image_url: updatedUser.profile_image_url,
        is_active: updatedUser.is_active,
        updated_at: updatedUser.updated_at,
      },
    });
  } catch (error) {
    logger.error('Update profile exception:', error);
    return res.status(500).json({ error: 'Failed to update user profile' });
  }
};

/**
 * Logout user
 */
export const logout = async (req: Request, res: Response) => {
  // Since we're using JWT, we don't need to do anything server-side 
  // The client should delete the token
  return res.status(200).json({ message: 'Logged out successfully' });
}; 