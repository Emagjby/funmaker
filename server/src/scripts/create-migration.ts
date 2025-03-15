#!/usr/bin/env node

import 'dotenv/config';
import { migrationManager } from '../db/migrations';
import { logger } from '../utils/logger';

async function main() {
  try {
    // Get the migration name from command line arguments
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      console.error('Please provide a migration name');
      console.error('Usage: npm run create-migration -- "migration name"');
      process.exit(1);
    }
    
    const migrationName = args[0];
    
    // Create the migration file
    const filePath = await migrationManager.createMigration(migrationName);
    
    logger.info(`Migration file created at: ${filePath}`);
    logger.info('Edit this file with your SQL statements, then run the server to apply it.');
    
    process.exit(0);
  } catch (error) {
    logger.error('Error creating migration:', error);
    process.exit(1);
  }
}

// Run the script
main(); 