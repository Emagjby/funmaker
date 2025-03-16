import { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  username: string;
  points_balance: number;
  profile_image_url?: string;
  last_login_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile extends User {
  // Additional profile information can be added here
  bio?: string;
  location?: string;
  social_links?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
}

export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  identifier: string; // Can be either email or username
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  username: string;
}

export interface ResetPasswordParams {
  email: string;
}

export interface UpdatePasswordParams {
  password: string;
}

// Map a Supabase user to our app User type
export function mapSupabaseUser(supabaseUser: SupabaseUser, userData?: Partial<User>): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    username: supabaseUser.user_metadata?.username || '',
    points_balance: userData?.points_balance || 0,
    profile_image_url: userData?.profile_image_url,
    last_login_at: userData?.last_login_at,
    is_active: userData?.is_active || true,
    created_at: userData?.created_at || supabaseUser.created_at || new Date().toISOString(),
    updated_at: userData?.updated_at || new Date().toISOString(),
  };
} 