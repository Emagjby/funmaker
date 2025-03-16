import { jest } from '@jest/globals';

// Create mock Supabase client
export const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  neq: jest.fn().mockReturnThis(),
  gt: jest.fn().mockReturnThis(),
  lt: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  like: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  is: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  contains: jest.fn().mockReturnThis(),
  containedBy: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  overlaps: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  maybeSingle: jest.fn().mockReturnThis(),
  csv: jest.fn().mockReturnThis(),
  rpc: jest.fn().mockImplementation((funcName, params) => {
    // Mock for insert_user RPC function
    if (funcName === 'insert_user') {
      return Promise.resolve({
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          auth_id: params.p_auth_id,
          email: params.p_email,
          username: params.p_username,
          points_balance: params.p_points_balance,
          is_active: params.p_is_active
        },
        error: null
      });
    }
    return Promise.resolve({ data: null, error: null });
  }),
  
  // Auth methods
  auth: {
    signUp: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        data: {
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'test@example.com',
          },
          session: {
            access_token: 'mock-token',
            refresh_token: 'mock-refresh-token',
            expires_at: Date.now() + 3600000
          }
        },
        error: null
      });
    }),
    signInWithPassword: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        data: {
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'test@example.com',
          },
          session: {
            access_token: 'mock-token',
            refresh_token: 'mock-refresh-token',
            expires_at: Date.now() + 3600000
          }
        },
        error: null
      });
    }),
    getUser: jest.fn().mockImplementation((token) => {
      if (token === 'valid.jwt.token') {
        return Promise.resolve({
          data: { 
            user: { 
              id: '123e4567-e89b-12d3-a456-426614174000', 
              email: 'test@example.com' 
            } 
          },
          error: null
        });
      }
      return Promise.resolve({
        data: { user: null },
        error: { message: 'Invalid JWT' }
      });
    }),
    admin: {
      deleteUser: jest.fn().mockImplementation(() => {
        return Promise.resolve({ data: { success: true }, error: null });
      }),
      listUsers: jest.fn().mockImplementation(() => {
        return Promise.resolve({ 
          data: { 
            users: [
              { id: 'existing-user-1', email: 'existing1@example.com' },
              { id: 'existing-user-2', email: 'existing2@example.com' }
            ] 
          }, 
          error: null 
        });
      })
    }
  }
};

// Mock for general Supabase module
export const mockedSupabase = {
  supabase: mockSupabase
};

// Helper to reset all mocks between tests
export const resetSupabaseMocks = () => {
  Object.values(mockSupabase).forEach(method => {
    if (typeof method === 'function' && 'mockClear' in method) {
      method.mockClear();
    }
  });
  
  // Reset nested auth methods
  Object.values(mockSupabase.auth).forEach(method => {
    if (typeof method === 'function' && 'mockClear' in method) {
      method.mockClear();
    }
  });
  
  // Reset nested admin methods
  Object.values(mockSupabase.auth.admin).forEach(method => {
    if (typeof method === 'function' && 'mockClear' in method) {
      method.mockClear();
    }
  });
}; 