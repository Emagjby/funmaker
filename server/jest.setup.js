// Set environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.PORT = '5001'; // Use a different port for tests

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => {
  return {
    createClient: jest.fn(() => ({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({ data: null, error: null })),
            limit: jest.fn(() => ({ data: [], error: null })),
          })),
          limit: jest.fn(() => ({ data: [], error: null })),
        })),
        insert: jest.fn(() => ({ data: [], error: null })),
        update: jest.fn(() => ({ data: [], error: null })),
        delete: jest.fn(() => ({ data: [], error: null })),
      })),
      auth: {
        signIn: jest.fn(() => ({ data: null, error: null })),
        signUp: jest.fn(() => ({ data: null, error: null })),
        getUser: jest.fn(() => ({ data: { user: null }, error: null })),
      },
    })),
  };
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
}); 