import { createClient } from '@supabase/supabase-js';

// Environment variables are automatically exposed to the browser with the NEXT_PUBLIC_ prefix
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to get currently authenticated user
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Helper function to check if the user is authenticated
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
} 