// Load environment variables for testing
import 'dotenv/config';
import { jest } from '@jest/globals';

// Set the test timeout higher for integration tests
jest.setTimeout(30000);

// Mock the logger to prevent console output during tests
jest.mock('../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }
}));

// Global cleanup after all tests
afterAll(async () => {
  // Add any cleanup here if needed
}); 