import { mockSupabase, resetSupabaseMocks } from '../mocks/supabase.mock';
import { jest } from '@jest/globals';

// Mock the supabase module
jest.mock('../../src/db/supabase', () => ({
  supabase: mockSupabase
}));

// Import service after mocking dependencies
import {
  createUser,
  getUserById,
  getUserByEmail,
  getUserByUsername,
  updateUser
} from '../../src/services/user.service';

describe('User Service', () => {
  beforeEach(() => {
    resetSupabaseMocks();
  });

  describe('createUser', () => {
    it('should successfully create a user', async () => {
      // Arrange
      const userData = {
        auth_id: 'auth-123',
        email: 'test@example.com',
        username: 'testuser',
        points_balance: 0,
        is_active: true
      };

      // Mock the RPC function response
      mockSupabase.rpc.mockResolvedValue({
        data: { id: 'db-user-123', ...userData },
        error: null
      });

      // Act
      const result = await createUser(userData);

      // Assert
      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'insert_user',
        {
          p_auth_id: userData.auth_id,
          p_email: userData.email,
          p_username: userData.username,
          p_points_balance: userData.points_balance,
          p_is_active: userData.is_active
        }
      );
      expect(result).toEqual(
        expect.objectContaining({
          id: 'db-user-123',
          email: 'test@example.com',
          username: 'testuser'
        })
      );
    });

    it('should throw an error when RPC call fails', async () => {
      // Arrange
      const userData = {
        auth_id: 'auth-123',
        email: 'test@example.com',
        username: 'testuser',
        points_balance: 0,
        is_active: true
      };

      // Mock the RPC function to return an error
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      // Act & Assert
      await expect(createUser(userData)).rejects.toThrow('Failed to create user: Database error');
      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'insert_user',
        {
          p_auth_id: userData.auth_id,
          p_email: userData.email,
          p_username: userData.username,
          p_points_balance: userData.points_balance,
          p_is_active: userData.is_active
        }
      );
    });

    it('should handle network errors', async () => {
      // Arrange
      const userData = {
        auth_id: 'auth-123',
        email: 'test@example.com',
        username: 'testuser',
        points_balance: 0,
        is_active: true
      };

      // Mock the RPC function to throw an error
      mockSupabase.rpc.mockRejectedValue(new Error('Network error'));

      // Act & Assert
      await expect(createUser(userData)).rejects.toThrow('Failed to create user: Network error');
    });
  });

  describe('getUserById', () => {
    it('should return a user when found by ID', async () => {
      // Arrange
      const userId = 'user-123';
      const userData = {
        id: userId,
        auth_id: 'auth-123',
        email: 'test@example.com',
        username: 'testuser',
        points_balance: 100,
        is_active: true,
        created_at: '2023-01-01T00:00:00Z'
      };

      // Mock the Supabase response
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.single.mockResolvedValue({
        data: userData,
        error: null
      });

      // Act
      const result = await getUserById(userId);

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('users');
      expect(mockSupabase.select).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', userId);
      expect(mockSupabase.single).toHaveBeenCalled();
      expect(result).toEqual(userData);
    });

    it('should return null when user is not found', async () => {
      // Arrange
      const userId = 'nonexistent-user';

      // Mock the Supabase response for "not found"
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows returned' }
      });

      // Act
      const result = await getUserById(userId);

      // Assert
      expect(result).toBeNull();
    });

    it('should throw an error on database errors', async () => {
      // Arrange
      const userId = 'user-123';

      // Mock the Supabase response for database error
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Database connection error' }
      });

      // Act & Assert
      await expect(getUserById(userId)).rejects.toThrow(
        'Failed to get user by ID: Database connection error'
      );
    });
  });

  describe('getUserByEmail', () => {
    it('should return a user when found by email', async () => {
      // Arrange
      const email = 'test@example.com';
      const userData = {
        id: 'user-123',
        auth_id: 'auth-123',
        email: email,
        username: 'testuser',
        points_balance: 100,
        is_active: true
      };

      // Mock the Supabase response
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.single.mockResolvedValue({
        data: userData,
        error: null
      });

      // Act
      const result = await getUserByEmail(email);

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('users');
      expect(mockSupabase.select).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('email', email);
      expect(mockSupabase.single).toHaveBeenCalled();
      expect(result).toEqual(userData);
    });

    it('should return null when email is not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com';

      // Mock the Supabase response for "not found"
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows returned' }
      });

      // Act
      const result = await getUserByEmail(email);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getUserByUsername', () => {
    it('should return a user when found by username', async () => {
      // Arrange
      const username = 'testuser';
      const userData = {
        id: 'user-123',
        auth_id: 'auth-123',
        email: 'test@example.com',
        username: username,
        points_balance: 100,
        is_active: true
      };

      // Mock the Supabase response
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.single.mockResolvedValue({
        data: userData,
        error: null
      });

      // Act
      const result = await getUserByUsername(username);

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('users');
      expect(mockSupabase.select).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('username', username);
      expect(mockSupabase.single).toHaveBeenCalled();
      expect(result).toEqual(userData);
    });

    it('should return null when username is not found', async () => {
      // Arrange
      const username = 'nonexistent';

      // Mock the Supabase response for "not found"
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows returned' }
      });

      // Act
      const result = await getUserByUsername(username);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should successfully update a user', async () => {
      // Arrange
      const userId = 'user-123';
      const updateData = {
        username: 'newusername',
        profile_image_url: 'https://example.com/image.jpg'
      };
      const updatedUser = {
        id: userId,
        auth_id: 'auth-123',
        email: 'test@example.com',
        username: 'newusername',
        profile_image_url: 'https://example.com/image.jpg',
        points_balance: 100,
        is_active: true
      };

      // Mock the Supabase update response
      mockSupabase.from.mockReturnThis();
      mockSupabase.update.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.select.mockResolvedValue({
        data: [updatedUser],
        error: null
      });

      // Act
      const result = await updateUser(userId, updateData);

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('users');
      expect(mockSupabase.update).toHaveBeenCalledWith(updateData);
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', userId);
      expect(mockSupabase.select).toHaveBeenCalled();
      expect(result).toEqual(updatedUser);
    });

    it('should throw an error when update fails', async () => {
      // Arrange
      const userId = 'user-123';
      const updateData = { username: 'newusername' };

      // Mock the Supabase update to return an error
      mockSupabase.from.mockReturnThis();
      mockSupabase.update.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.select.mockResolvedValue({
        data: null,
        error: { message: 'Update failed' }
      });

      // Act & Assert
      await expect(updateUser(userId, updateData)).rejects.toThrow(
        'Failed to update user: Update failed'
      );
    });

    it('should throw an error when user is not found after update', async () => {
      // Arrange
      const userId = 'user-123';
      const updateData = { username: 'newusername' };

      // Mock the Supabase update to return empty data
      mockSupabase.from.mockReturnThis();
      mockSupabase.update.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.select.mockResolvedValue({
        data: [],
        error: null
      });

      // Act & Assert
      await expect(updateUser(userId, updateData)).rejects.toThrow(
        'User not found after update'
      );
    });
  });
}); 