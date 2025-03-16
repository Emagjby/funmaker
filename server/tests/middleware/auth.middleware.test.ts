import { mockRequest, mockResponse } from '../helpers/request.helper';
import { mockSupabase, resetSupabaseMocks } from '../mocks/supabase.mock';
import { jest } from '@jest/globals';

// Mock the supabase module
jest.mock('../../src/db/supabase', () => ({
  supabase: mockSupabase
}));

// Import middleware after mocking dependencies
import { authenticate } from '../../src/middleware/auth.middleware';

describe('Auth Middleware', () => {
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    resetSupabaseMocks();
    req = mockRequest();
    res = mockResponse();
    next = jest.fn();
  });

  it('should call next() with no error when a valid token is provided', async () => {
    // Arrange
    const validToken = 'valid.jwt.token';
    req.headers = { authorization: `Bearer ${validToken}` };

    // Mock Supabase getUser response with a valid user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
      error: null
    });

    // Act
    await authenticate(req, res, next);

    // Assert
    expect(mockSupabase.auth.getUser).toHaveBeenCalledWith(validToken);
    expect(req.user).toEqual({ 
      id: 'user-123', 
      email: 'test@example.com',
      role: 'user' // Include role as it's added by the implementation
    });
    expect(next).toHaveBeenCalledWith();
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should return 401 when no authorization header is provided', async () => {
    // Arrange
    req.headers = {}; // No authorization header

    // Act
    await authenticate(req, res, next);

    // Assert
    expect(mockSupabase.auth.getUser).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
  });

  it('should return 401 when authorization header has invalid format', async () => {
    // Arrange
    req.headers = { authorization: 'InvalidFormat' }; // Invalid format, missing 'Bearer'

    // Act
    await authenticate(req, res, next);

    // Assert
    expect(mockSupabase.auth.getUser).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token format' });
  });

  it('should return 401 when Supabase getUser returns an error', async () => {
    // Arrange
    const invalidToken = 'invalid.jwt.token';
    req.headers = { authorization: `Bearer ${invalidToken}` };

    // Mock Supabase getUser response with an error
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid JWT' }
    });

    // Act
    await authenticate(req, res, next);

    // Assert
    expect(mockSupabase.auth.getUser).toHaveBeenCalledWith(invalidToken);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
  });

  it('should return 500 when Supabase getUser throws an unexpected error', async () => {
    // Arrange
    const token = 'some.jwt.token';
    req.headers = { authorization: `Bearer ${token}` };

    // Mock Supabase getUser to throw an error
    mockSupabase.auth.getUser.mockRejectedValue(new Error('Unexpected error'));

    // Act
    await authenticate(req, res, next);

    // Assert
    expect(mockSupabase.auth.getUser).toHaveBeenCalledWith(token);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Authentication server error' });
  });
}); 