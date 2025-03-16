import { createClient } from '@supabase/supabase-js';
import { User, AuthResponse } from '@supabase/supabase-js';

// Environment variables are automatically exposed to the browser with the NEXT_PUBLIC_ prefix
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to get currently authenticated user
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Helper function to check if the user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}

// Login with email and password
export async function signInWithEmail(email: string, password: string): Promise<AuthResponse> {
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

// Register a new user
export async function signUpWithEmail(email: string, password: string, username: string): Promise<AuthResponse> {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  });
}

// Sign out the current user
export async function signOut(): Promise<{ error: Error | null }> {
  return supabase.auth.signOut();
}

// Reset password
export async function resetPassword(email: string) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
}

// Update password
export async function updatePassword(newPassword: string) {
  return supabase.auth.updateUser({
    password: newPassword,
  });
}

// Get the session
export async function getSession() {
  return supabase.auth.getSession();
}

// Set up auth state change listener
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback);
} 