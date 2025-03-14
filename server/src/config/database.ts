import { logger } from '../utils/logger';

// Environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

// Create Supabase client
export const supabase = createClient(supabaseUrl!, supabaseKey!);

// Test the connection
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('users').select('count', { count: 'exact' }).limit(1);
    
    if (error) {
      logger.error('Database connection failed:', error.message);
      return false;
    }
    
    logger.info('Database connection successful');
    return true;
  } catch (error) {
    logger.error('Database connection error:', error);
    return false;
  }
}; 
import { createClient } from '@supabase/supabase-js';
 