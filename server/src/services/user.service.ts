import { supabase } from '../db/supabase';

// Types
export interface UserCreateData {
  auth_id: string;
  email: string;
  username: string;
  points_balance?: number;
  is_active?: boolean;
}

export interface UserUpdateData {
  username?: string;
  profile_image_url?: string;
}

/**
 * Create a new user in the database
 */
export const createUser = async (userData: UserCreateData) => {
  try {
    // Ensure default values
    const user = {
      ...userData,
      points_balance: userData.points_balance || 0,
      is_active: userData.is_active !== undefined ? userData.is_active : true
    };

    // Call the RPC function to insert_user
    const { data, error } = await supabase.rpc('insert_user', {
      p_auth_id: user.auth_id,
      p_email: user.email,
      p_username: user.username,
      p_points_balance: user.points_balance,
      p_is_active: user.is_active
    });

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return data;
  } catch (error: any) {
    throw new Error(`Failed to create user: ${error.message}`);
  }
};

/**
 * Get a user by their ID
 */
export const getUserById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      // Special case for "no rows returned"
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get user by ID: ${error.message}`);
    }

    return data;
  } catch (error: any) {
    throw new Error(`Failed to get user by ID: ${error.message}`);
  }
};

/**
 * Get a user by their auth ID
 */
export const getUserByAuthId = async (authId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authId)
      .single();

    if (error) {
      // Special case for "no rows returned"
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get user by auth ID: ${error.message}`);
    }

    return data;
  } catch (error: any) {
    throw new Error(`Failed to get user by auth ID: ${error.message}`);
  }
};

/**
 * Get a user by their email
 */
export const getUserByEmail = async (email: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      // Special case for "no rows returned"
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get user by email: ${error.message}`);
    }

    return data;
  } catch (error: any) {
    throw new Error(`Failed to get user by email: ${error.message}`);
  }
};

/**
 * Get a user by their username
 */
export const getUserByUsername = async (username: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      // Special case for "no rows returned"
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get user by username: ${error.message}`);
    }

    return data;
  } catch (error: any) {
    throw new Error(`Failed to get user by username: ${error.message}`);
  }
};

/**
 * Update a user's profile
 */
export const updateUser = async (userId: string, updateData: UserUpdateData) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select();

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error('User not found after update');
    }

    return data[0];
  } catch (error: any) {
    throw new Error(`Failed to update user: ${error.message}`);
  }
}; 