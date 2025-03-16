'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { 
  getCurrentUser, 
  getSession,
  onAuthStateChange,
  signOut as supabaseSignOut
} from '@/lib/supabase';
import { 
  User, 
  AuthState, 
  LoginCredentials, 
  RegisterCredentials,
  mapSupabaseUser
} from '@/types/user';
import { api } from '@/lib/api';

// Default auth state
const defaultAuthState: AuthState = {
  user: null,
  session: null,
  loading: true,
  error: null,
};

// Create auth context
const AuthContext = createContext<{
  authState: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  resetUserPassword: (email: string) => Promise<void>;
  updateUserPassword: (password: string) => Promise<void>;
}>({
  authState: defaultAuthState,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  resetUserPassword: async () => {},
  updateUserPassword: async () => {},
});

// Auth provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>(defaultAuthState);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await getSession();
        const user = await getCurrentUser();

        if (session && user) {
          // Get user profile from our backend
          try {
            const response = await api.auth.profile(session.access_token);
            setAuthState({
              user: response.user as User,
              session,
              loading: false,
              error: null,
            });
          } catch (error) {
            // If API call fails, fall back to basic Supabase user info
            console.error('Error fetching user profile:', error);
            setAuthState({
              user: user ? mapSupabaseUser(user) : null,
              session,
              loading: false,
              error: null,
            });
          }
        } else {
          setAuthState({
            ...defaultAuthState,
            loading: false,
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthState({
          ...defaultAuthState,
          loading: false,
          error: 'Failed to initialize authentication',
        });
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const user = await getCurrentUser();
        
        if (session && user) {
          // Get user profile from our backend
          try {
            const response = await api.auth.profile(session.access_token);
            setAuthState({
              user: response.user as User,
              session,
              loading: false,
              error: null,
            });
          } catch (error) {
            // If API call fails, fall back to basic Supabase user info
            console.error('Error fetching user data after auth change:', error);
            setAuthState({
              user: user ? mapSupabaseUser(user) : null,
              session,
              loading: false,
              error: null,
            });
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setAuthState({
          user: null,
          session: null,
          loading: false,
          error: null,
        });
      }
    });

    // Unsubscribe on cleanup
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Login function
  const login = async ({ identifier, password }: LoginCredentials) => {
    try {
      setAuthState({ ...authState, loading: true, error: null });
      
      // Use our API instead of Supabase's client directly
      const response = await api.auth.login(identifier, password);
      
      setAuthState({
        user: response.user as User,
        session: response.session,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Login failed:', error);
      
      let errorMessage = 'Failed to login';
      
      if (error instanceof Error) {
        // Handle network errors specially
        if (error.message.includes('Failed to fetch') || 
            error.message.includes('NetworkError') ||
            error.message.includes('Network error')) {
          errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setAuthState({
        ...authState,
        loading: false,
        error: errorMessage
      });
    }
  };

  // Register function
  const register = async ({ email, password, username }: RegisterCredentials) => {
    try {
      setAuthState({ ...authState, loading: true, error: null });
      
      // Use our API instead of Supabase's client directly
      const response = await api.auth.register(username, email, password);
      
      setAuthState({
        user: response.user as User,
        session: response.session,
        loading: false,
        error: null,
      });
    } catch (error) {
      setAuthState({
        ...authState,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to register',
      });
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setAuthState({ ...authState, loading: true, error: null });
      
      // Sign out from Supabase
      const { error } = await supabaseSignOut();
      
      if (error) throw error;
      
      setAuthState({
        user: null,
        session: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      setAuthState({
        ...authState,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to logout',
      });
    }
  };

  // Reset password function
  const resetUserPassword = async (email: string) => {
    try {
      setAuthState({ ...authState, loading: true, error: null });
      
      // TODO: Implement password reset through our API
      console.log(`Password reset requested for email: ${email}`);
      
      setAuthState({
        ...authState,
        loading: false,
        error: null,
      });
    } catch (error) {
      setAuthState({
        ...authState,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to reset password',
      });
    }
  };

  // Update password function
  const updateUserPassword = async (password: string) => {
    try {
      setAuthState({ ...authState, loading: true, error: null });
      
      // TODO: Implement password update through our API
      console.log(`Password update requested with new password length: ${password.length}`);
      
      setAuthState({
        ...authState,
        loading: false,
        error: null,
      });
    } catch (error) {
      setAuthState({
        ...authState,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to update password',
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        login,
        register,
        logout,
        resetUserPassword,
        updateUserPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;