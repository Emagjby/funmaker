import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';
import { logger } from '../utils/logger';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a Supabase client with admin privileges for database operations
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Initialize the database with the schema
 * This is run on server startup
 */
export async function initializeDatabase() {
  try {
    logger.info('Initializing database...');
    
    // Verify database connection by checking if we can access the users table
    const { error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      logger.error('Database connection error', error);
      throw error;
    }
    
    logger.info('Database connection successful');
    return true;
  } catch (error) {
    logger.error('Failed to initialize database', error);
    throw error;
  }
}

export { supabase }; 