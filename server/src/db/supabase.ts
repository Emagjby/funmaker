import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';
import { logger } from '../utils/logger';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  logger.error('SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables must be set');
  process.exit(1);
}

// Create Supabase client with service key
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

// Helper function to execute raw SQL queries
supabase.query = async (sql: string) => {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    return { data, error };
  } catch (err) {
    // If the RPC doesn't exist, create it first
    if (err instanceof Error && err.message.includes('function "exec_sql" does not exist')) {
      try {
        // Create the SQL execution function in Supabase
        const createFnResult = await supabase.rpc('create_sql_function');
        
        if (createFnResult.error) {
          // If that fails too, create it directly via SQL
          await supabase.from('_rpc').select('*').then(async () => {
            await supabase.rpc('exec_sql', { sql: `
              CREATE OR REPLACE FUNCTION exec_sql(sql text)
              RETURNS JSONB AS $$
              DECLARE
                result JSONB;
              BEGIN
                EXECUTE sql;
                result := '{"success": true}'::JSONB;
                RETURN result;
              EXCEPTION WHEN OTHERS THEN
                result := jsonb_build_object(
                  'success', false,
                  'error', SQLERRM,
                  'detail', SQLSTATE
                );
                RETURN result;
              END;
              $$ LANGUAGE plpgsql SECURITY DEFINER;
              
              CREATE OR REPLACE FUNCTION create_migrations_table_if_not_exists()
              RETURNS JSONB AS $$
              BEGIN
                CREATE TABLE IF NOT EXISTS migrations (
                  id SERIAL PRIMARY KEY,
                  name TEXT NOT NULL UNIQUE,
                  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                );
                RETURN '{"success": true}'::JSONB;
              EXCEPTION WHEN OTHERS THEN
                RETURN jsonb_build_object(
                  'success', false,
                  'error', SQLERRM,
                  'detail', SQLSTATE
                );
              END;
              $$ LANGUAGE plpgsql SECURITY DEFINER;
              
              CREATE OR REPLACE FUNCTION create_sql_function()
              RETURNS JSONB AS $$
              BEGIN
                -- This is just a placeholder used to check if functions exist
                RETURN '{"success": true}'::JSONB;
              END;
              $$ LANGUAGE plpgsql SECURITY DEFINER;
            ` });
          });
        }
        
        // Now try the original query again
        return await supabase.rpc('exec_sql', { sql });
      } catch (setupErr) {
        logger.error('Error setting up SQL execution function:', setupErr);
        return { data: null, error: setupErr instanceof Error ? setupErr : new Error(String(setupErr)) };
      }
    }
    
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}; 