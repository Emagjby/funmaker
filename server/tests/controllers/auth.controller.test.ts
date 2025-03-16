import { mockRequest, mockResponse } from '../helpers/request.helper';
import { mockSupabase, resetSupabaseMocks } from '../mocks/supabase.mock';
import { jest } from '@jest/globals';

// Mock the supabase module
jest.mock('../../src/db/supabase', () => ({
  supabase: mockSupabase
}));

// Import controllers after mocking dependencies
import { register, login, getProfile } from '../../src/controllers/auth.controller';

// Create a version of the login function for testing to avoid complex mocking issues
// NOTE: This function is kept for reference but currently not used in tests
/* 
const loginForTest = async (req, res) => {
  try {
    // Basic validation - same as original
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if this is the test user credentials
    if (email === 'test@example.com' && password === 'Password123!') {
      // Simplified happy path for testing
      return res.status(200).json({
        message: 'Login successful',
        user: {
          id: 'db-user-123',
          email: 'test@example.com',
          username: 'testuser',
          points_balance: 1000,
          profile_image_url: null,
          is_active: true,
        },
        session: { access_token: 'token-123' }
      });
    }
    
    // For any other credentials, return 401
    return res.status(401).json({ error: 'Invalid email or password' });
  } catch (error) {
    console.error('Login test error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
};
*/

describe('Auth Controller', () => {
  beforeEach(() => {
    resetSupabaseMocks();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      // Arrange
      const req = mockRequest({
        body: {
          email: 'test@example.com',
          password: 'Password123!',
          username: 'testuser'
        }
      });
      const res = mockResponse();

      // Mock the supabase responses
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.limit.mockResolvedValue({ data: [], error: null });
      mockSupabase.auth.admin.listUsers.mockResolvedValue({ data: { users: [] }, error: null });

      // Mock successful auth
      mockSupabase.auth.signUp.mockResolvedValue({
        data: {
          user: { id: 'auth-123' },
          session: { access_token: 'token-123' }
        },
        error: null
      });

      // Mock successful RPC call
      mockSupabase.rpc.mockResolvedValue({
        data: {
          id: 'db-user-123',
          email: 'test@example.com',
          username: 'testuser',
          points_balance: 1000
        },
        error: null
      });

      // Act
      await register(req as any, res as any);

      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User registered successfully',
          user: expect.objectContaining({
            email: 'test@example.com',
            username: 'testuser'
          })
        })
      );
    });

    it('should return 400 when required fields are missing', async () => {
      // Arrange
      const req = mockRequest({
        body: {
          email: 'test@example.com',
          // Missing password and username
        }
      });
      const res = mockResponse();

      // Act
      await register(req as any, res as any);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Username is required')
        })
      );
    });

    it('should return 400 when username is already taken', async () => {
      // Arrange
      const req = mockRequest({
        body: {
          email: 'test@example.com',
          password: 'Password123!',
          username: 'existinguser'
        }
      });
      const res = mockResponse();

      // Mock the supabase response to indicate username exists
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.limit.mockResolvedValue({ 
        data: [{ username: 'existinguser' }], 
        error: null 
      });

      // Act
      await register(req as any, res as any);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Username already taken'
        })
      );
    });

    it('should handle Supabase auth error during registration', async () => {
      // Arrange
      const req = mockRequest({
        body: {
          email: 'test@example.com',
          password: 'Password123!',
          username: 'testuser'
        }
      });
      const res = mockResponse();

      // Mock username check to pass
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.limit.mockResolvedValue({ data: [], error: null });
      mockSupabase.auth.admin.listUsers.mockResolvedValue({ data: { users: [] }, error: null });
      mockSupabase.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'Auth error' }
      });

      // Act
      await register(req as any, res as any);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Auth error'
        })
      );
    });

    it('should handle database error during user record creation', async () => {
      // Arrange
      const req = mockRequest({
        body: {
          email: 'test@example.com',
          password: 'Password123!',
          username: 'testuser'
        }
      });
      const res = mockResponse();

      // Mock username check to pass
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.limit.mockResolvedValue({ data: [], error: null });
      mockSupabase.auth.admin.listUsers.mockResolvedValue({ data: { users: [] }, error: null });

      // Mock auth to succeed
      mockSupabase.auth.signUp.mockResolvedValue({
        data: {
          user: { id: 'auth-123' }
        },
        error: null
      });

      // Mock RPC error
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      // Act
      await register(req as any, res as any);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Failed to create user record'
        })
      );
      // Should attempt to delete the auth user
      expect(mockSupabase.auth.admin.deleteUser).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should successfully log in a user with email', async () => {
      // Arrange
      const req = mockRequest({
        body: {
          identifier: 'test@example.com',
          password: 'Password123!'
        }
      });
      const res = mockResponse();

      // Mock Supabase auth response
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: { id: 'auth-user-123' },
          session: { access_token: 'token-123' }
        },
        error: null
      });

      // Mock user data retrieval
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.single.mockResolvedValue({
        data: {
          id: 'db-user-123',
          auth_id: 'auth-user-123',
          email: 'test@example.com',
          username: 'testuser',
          points_balance: 1000,
          profile_image_url: null,
          is_active: true
        },
        error: null
      });

      // Mock update call
      mockSupabase.update.mockReturnThis();

      // Act
      await login(req as any, res as any);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Login successful',
          user: expect.objectContaining({
            email: 'test@example.com',
            username: 'testuser'
          })
        })
      );
      // Should call signInWithPassword with email directly
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!'
      });
    });

    it('should successfully log in a user with username', async () => {
      // Arrange
      const req = mockRequest({
        body: {
          identifier: 'testuser',
          password: 'Password123!'
        }
      });
      const res = mockResponse();

      // Mock username lookup
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.single.mockResolvedValueOnce({
        data: { email: 'test@example.com' },
        error: null
      });

      // Mock Supabase auth response
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: { id: 'auth-user-123' },
          session: { access_token: 'token-123' }
        },
        error: null
      });

      // Mock user data retrieval
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'db-user-123',
          auth_id: 'auth-user-123',
          email: 'test@example.com',
          username: 'testuser',
          points_balance: 1000,
          profile_image_url: null,
          is_active: true
        },
        error: null
      });

      // Act
      await login(req as any, res as any);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Login successful',
          user: expect.objectContaining({
            email: 'test@example.com',
            username: 'testuser'
          })
        })
      );
      // Should first look up the email by username
      expect(mockSupabase.eq).toHaveBeenCalledWith('username', 'testuser');
      // Then call signInWithPassword with the resolved email
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!'
      });
    });

    it('should return 401 when username lookup fails', async () => {
      // Arrange
      const req = mockRequest({
        body: {
          identifier: 'nonexistentuser',
          password: 'Password123!'
        }
      });
      const res = mockResponse();

      // Mock username lookup to fail
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'User not found' }
      });

      // Act
      await login(req as any, res as any);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid email/username or password'
        })
      );
      // Should not call signInWithPassword
      expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
    });

    it('should return 400 when identifier is missing', async () => {
      // Arrange
      const req = mockRequest({
        body: {
          // Missing identifier
          password: 'Password123!'
        }
      });
      const res = mockResponse();

      // Act
      await login(req as any, res as any);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Email or username is required')
        })
      );
    });

    it('should return 401 on invalid credentials', async () => {
      // Arrange
      const req = mockRequest({
        body: {
          identifier: 'test@example.com',
          password: 'wrongpassword'
        }
      });
      const res = mockResponse();

      // Mock auth failure
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' }
      });

      // Act
      await login(req as any, res as any);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid email/username or password'
        })
      );
    });
  });

  describe('getProfile', () => {
    it('should return the user profile for authenticated user', async () => {
      // Arrange
      const req = mockRequest({
        user: { id: 'user-123' }
      });
      const res = mockResponse();

      // Mock successful user data retrieval
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.single.mockResolvedValue({ 
        data: { 
          id: 'db-user-123',
          auth_id: 'user-123',
          email: 'test@example.com',
          username: 'testuser',
          points_balance: 1000,
          profile_image_url: null,
          is_active: true,
          created_at: new Date().toISOString(),
          last_login_at: new Date().toISOString()
        }, 
        error: null 
      });

      // Act
      await getProfile(req as any, res as any);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({
            email: 'test@example.com',
            username: 'testuser'
          })
        })
      );
    });

    it('should return 401 when not authenticated', async () => {
      // Arrange
      const req = mockRequest({
        user: null // No user object = not authenticated
      });
      const res = mockResponse();

      // Act
      await getProfile(req as any, res as any);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Not authenticated'
        })
      );
    });
  });
}); 