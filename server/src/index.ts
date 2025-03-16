import path from 'path';
import { config } from 'dotenv';

// Try to load the .env file from the root directory
config({ path: path.resolve(process.cwd(), '.env') });

import app from './app';
import { logger } from './utils/logger';
import { initializeDatabase } from './db';

const PORT = process.env.PORT || 5000;

// Start the server asynchronously to initialize the database first
async function startServer() {
  try {
    // Initialize the database
    logger.info('Initializing database...');
    await initializeDatabase();
    logger.info('Database initialization completed successfully');

    // Start the Express server
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });

    return server;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

export default startServer; 