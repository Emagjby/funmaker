import { mockRequest, mockResponse } from '../helpers/request.helper';
import { jest } from '@jest/globals';
import { 
  validateRegisterInput, 
  validateLoginInput, 
  validateProfileUpdateInput 
} from '../../src/middleware/validation.middleware';

describe('Validation Middleware', () => {
  let next: jest.Mock;

  beforeEach(() => {
    next = jest.fn();
  });

  describe('validateRegisterInput', () => {
    it('should call next() when valid registration data is provided', () => {
      // Arrange
      const req = mockRequest({
        body: {
          email: 'test@example.com',
          password: 'Password123!',
          username: 'testuser'
        }
      });
      const res = mockResponse();

      // Act
      validateRegisterInput(req as any, res as any, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should return 400 when email is missing', () => {
      // Arrange
      const req = mockRequest({
        body: {
          password: 'Password123!',
          username: 'testuser'
        }
      });
      const res = mockResponse();

      // Act
      validateRegisterInput(req as any, res as any, next);

      // Assert
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Email, password, and username are required' 
      });
    });

    it('should return 400 when password is missing', () => {
      // Arrange
      const req = mockRequest({
        body: {
          email: 'test@example.com',
          username: 'testuser'
        }
      });
      const res = mockResponse();

      // Act
      validateRegisterInput(req as any, res as any, next);

      // Assert
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Email, password, and username are required' 
      });
    });

    it('should return 400 when username is missing', () => {
      // Arrange
      const req = mockRequest({
        body: {
          email: 'test@example.com',
          password: 'Password123!'
        }
      });
      const res = mockResponse();

      // Act
      validateRegisterInput(req as any, res as any, next);

      // Assert
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Email, password, and username are required' 
      });
    });

    it('should return 400 when email format is invalid', () => {
      // Arrange
      const req = mockRequest({
        body: {
          email: 'invalid-email',
          password: 'Password123!',
          username: 'testuser'
        }
      });
      const res = mockResponse();

      // Act
      validateRegisterInput(req as any, res as any, next);

      // Assert
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Invalid email format' 
      });
    });

    it('should return 400 when password is too short', () => {
      // Arrange
      const req = mockRequest({
        body: {
          email: 'test@example.com',
          password: 'short',  // Less than 8 characters
          username: 'testuser'
        }
      });
      const res = mockResponse();

      // Act
      validateRegisterInput(req as any, res as any, next);

      // Assert
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Password must be at least 8 characters long' 
      });
    });

    it('should return 400 when username is too short', () => {
      // Arrange
      const req = mockRequest({
        body: {
          email: 'test@example.com',
          password: 'Password123!',
          username: 'a'  // Too short
        }
      });
      const res = mockResponse();

      // Act
      validateRegisterInput(req as any, res as any, next);

      // Assert
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Username must be between 3 and 30 characters' 
      });
    });

    it('should return 400 when username is too long', () => {
      // Arrange
      const req = mockRequest({
        body: {
          email: 'test@example.com',
          password: 'Password123!',
          username: 'a'.repeat(31)  // Too long (31 characters)
        }
      });
      const res = mockResponse();

      // Act
      validateRegisterInput(req as any, res as any, next);

      // Assert
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Username must be between 3 and 30 characters' 
      });
    });

    it('should return 400 when username contains invalid characters', () => {
      // Arrange
      const req = mockRequest({
        body: {
          email: 'test@example.com',
          password: 'Password123!',
          username: 'test user!'  // Contains spaces and special characters
        }
      });
      const res = mockResponse();

      // Act
      validateRegisterInput(req as any, res as any, next);

      // Assert
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Username can only contain letters, numbers, and underscores' 
      });
    });
  });

  describe('validateLoginInput', () => {
    it('should call next() when valid login data is provided', () => {
      // Arrange
      const req = mockRequest({
        body: {
          email: 'test@example.com',
          password: 'Password123!'
        }
      });
      const res = mockResponse();

      // Act
      validateLoginInput(req as any, res as any, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should return 400 when email is missing', () => {
      // Arrange
      const req = mockRequest({
        body: {
          password: 'Password123!'
        }
      });
      const res = mockResponse();

      // Act
      validateLoginInput(req as any, res as any, next);

      // Assert
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Email and password are required' 
      });
    });

    it('should return 400 when password is missing', () => {
      // Arrange
      const req = mockRequest({
        body: {
          email: 'test@example.com'
        }
      });
      const res = mockResponse();

      // Act
      validateLoginInput(req as any, res as any, next);

      // Assert
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Email and password are required' 
      });
    });

    it('should return 400 when email format is invalid', () => {
      // Arrange
      const req = mockRequest({
        body: {
          email: 'invalid-email',
          password: 'Password123!'
        }
      });
      const res = mockResponse();

      // Act
      validateLoginInput(req as any, res as any, next);

      // Assert
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Invalid email format' 
      });
    });
  });

  describe('validateProfileUpdateInput', () => {
    it('should call next() when valid profile update data is provided', () => {
      // Arrange
      const req = mockRequest({
        body: {
          username: 'newusername',
          profile_image_url: 'https://example.com/image.jpg'
        }
      });
      const res = mockResponse();

      // Act
      validateProfileUpdateInput(req as any, res as any, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should call next() when only username is provided', () => {
      // Arrange
      const req = mockRequest({
        body: {
          username: 'newusername'
        }
      });
      const res = mockResponse();

      // Act
      validateProfileUpdateInput(req as any, res as any, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should call next() when only profile_image_url is provided', () => {
      // Arrange
      const req = mockRequest({
        body: {
          profile_image_url: 'https://example.com/image.jpg'
        }
      });
      const res = mockResponse();

      // Act
      validateProfileUpdateInput(req as any, res as any, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should return 400 when no fields are provided for update', () => {
      // Arrange
      const req = mockRequest({
        body: {}
      });
      const res = mockResponse();

      // Act
      validateProfileUpdateInput(req as any, res as any, next);

      // Assert
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'At least one field must be provided for update' 
      });
    });

    it('should return 400 when username is too short', () => {
      // Arrange
      const req = mockRequest({
        body: {
          username: 'a'  // Too short
        }
      });
      const res = mockResponse();

      // Act
      validateProfileUpdateInput(req as any, res as any, next);

      // Assert
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Username must be between 3 and 30 characters' 
      });
    });

    it('should return 400 when username is too long', () => {
      // Arrange
      const req = mockRequest({
        body: {
          username: 'a'.repeat(31)  // Too long (31 characters)
        }
      });
      const res = mockResponse();

      // Act
      validateProfileUpdateInput(req as any, res as any, next);

      // Assert
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Username must be between 3 and 30 characters' 
      });
    });

    it('should return 400 when username contains invalid characters', () => {
      // Arrange
      const req = mockRequest({
        body: {
          username: 'test user!'  // Contains spaces and special characters
        }
      });
      const res = mockResponse();

      // Act
      validateProfileUpdateInput(req as any, res as any, next);

      // Assert
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Username can only contain letters, numbers, and underscores' 
      });
    });

    it('should return 400 when profile_image_url has invalid format', () => {
      // Arrange
      const req = mockRequest({
        body: {
          profile_image_url: 'invalid-url'  // Not a valid URL
        }
      });
      const res = mockResponse();

      // Act
      validateProfileUpdateInput(req as any, res as any, next);

      // Assert
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Profile image URL must be a valid URL' 
      });
    });
  });
}); 