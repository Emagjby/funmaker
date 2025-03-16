import dotenv from 'dotenv';
import path from 'path';

// Load .env file based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.development';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

export const env = {
  // Server configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  
  // Supabase configuration
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
  
  // Redis configuration
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // Application configuration
  INITIAL_POINTS: parseInt(process.env.INITIAL_POINTS || '1000', 10),
  
  // Validate required environment variables
  validate: () => {
    const requiredEnvVars = [
      'SUPABASE_URL',
      'SUPABASE_SERVICE_KEY',
    ];
    
    if (process.env.NODE_ENV === 'production') {
      const missingVars = requiredEnvVars.filter(
        (envVar) => !process.env[envVar]
      );
      
      if (missingVars.length > 0) {
        throw new Error(
          `Missing required environment variables: ${missingVars.join(', ')}`
        );
      }
    }
  },
}; 