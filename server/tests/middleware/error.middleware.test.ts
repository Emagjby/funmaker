import { mockRequest, mockResponse } from '../helpers/request.helper';
import { jest } from '@jest/globals';
import { errorHandler } from '../../src/middleware/error.middleware';

describe('Error Middleware', () => {
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = jest.fn();
  });

  it('should handle standard Error objects', () => {
    // Arrange
    const error = new Error('Test error');

    // Act
    errorHandler(error, req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ 
      error: 'Internal Server Error', 
      message: 'Test error' 
    });
  });

  it('should handle errors with status codes', () => {
    // Arrange
    const error = new Error('Not Found') as any;
    error.statusCode = 404;

    // Act
    errorHandler(error, req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ 
      error: 'Not Found' 
    });
  });

  it('should handle ValidationError types', () => {
    // Arrange
    const error = new Error('Validation failed') as any;
    error.name = 'ValidationError';

    // Act
    errorHandler(error, req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ 
      error: 'Validation Error', 
      message: 'Validation failed' 
    });
  });

  it('should sanitize error messages in production', () => {
    // Arrange
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    const error = new Error('Sensitive database error: password123');

    // Act
    errorHandler(error, req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ 
      error: 'Internal Server Error'
      // The detailed message should not be included in production
    });

    // Cleanup
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should handle custom error objects with code property', () => {
    // Arrange
    const error = {
      code: 'CUSTOM_ERROR',
      message: 'Custom error occurred'
    } as any;

    // Act
    errorHandler(error, req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ 
      error: 'CUSTOM_ERROR', 
      message: 'Custom error occurred' 
    });
  });

  it('should log the error but not expose it in production', () => {
    // Arrange
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    // Spy on console.error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const error = new Error('Database connection error with credentials');

    // Act
    errorHandler(error, req, res, next);

    // Assert
    expect(consoleSpy).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ 
      error: 'Internal Server Error'
    });

    // Cleanup
    consoleSpy.mockRestore();
    process.env.NODE_ENV = originalNodeEnv;
  });
}); 