/**
 * Custom error class for validation errors
 * Used to differentiate validation errors from other server errors
 * and provide appropriate status codes and error messages
 */
export class ValidationError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400; // Bad Request
    this.status = 'error';
    this.isOperational = true; // This is an expected error that is handled
    
    // This ensures the ValidationError is recognized as an instance of Error
    // when transpiled to ES5 or older versions
    Object.setPrototypeOf(this, ValidationError.prototype);
    
    // Capture the stack trace
    Error.captureStackTrace(this, this.constructor);
  }
} 