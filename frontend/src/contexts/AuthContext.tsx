'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {
  AuthState,
  AuthAction,
  TokenData,
  LoginRequest,
  RegisterRequest
} from '@/types/auth';
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getUserProfile,
  getTokens,
  setTokens,
  clearTokens,
  isAuthenticated as checkAuthenticated
} from '@/lib/authApi';

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  tokens: null,
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case 'AUTH_LOGOUT':
      return {
        ...initialState,
      };

    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
      };

    case 'SET_TOKENS':
      return {
        ...state,
        tokens: action.payload,
        isAuthenticated: true,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'TOKEN_REFRESH_SUCCESS':
      return {
        ...state,
        tokens: action.payload,
      };

    case 'TOKEN_REFRESH_FAILURE':
      return {
        ...initialState,
      };

    default:
      return state;
  }
}

// Context type
interface AuthContextType {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  clearError: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const tokens = getTokens();
      const isAuth = checkAuthenticated();

      if (isAuth && tokens) {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        try {
          // Try to get user profile to verify token validity
          const profileResponse = await getUserProfile();
          
          if (profileResponse.data) {
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: {
                user: profileResponse.data,
                tokens: tokens,
              },
            });
          } else {
            // Token invalid, clear everything
            clearTokens();
            dispatch({ type: 'AUTH_LOGOUT' });
          }
        } catch {
          // Error getting profile, clear auth
          clearTokens();
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginRequest): Promise<boolean> => {
    dispatch({ type: 'AUTH_START' });

    try {
      const response = await apiLogin(credentials);

      if (response.error) {
        dispatch({ type: 'AUTH_FAILURE', payload: response.error });
        return false;
      }

      if (response.data) {
        const { user, access_token, refresh_token } = response.data;
        const tokens: TokenData = {
          access_token,
          refresh_token,
          // Set expiry to 50 minutes from now (assuming 1-hour tokens)
          expires_at: Date.now() + (50 * 60 * 1000),
        };

        // Store tokens in localStorage
        setTokens(tokens);

        // Update state
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, tokens },
        });

        return true;
      }

      dispatch({ type: 'AUTH_FAILURE', payload: 'Login failed' });
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      return false;
    }
  };

  // Register function
  const register = async (userData: RegisterRequest): Promise<boolean> => {
    dispatch({ type: 'AUTH_START' });

    try {
      const response = await apiRegister(userData);

      if (response.error) {
        dispatch({ type: 'AUTH_FAILURE', payload: response.error });
        return false;
      }

      if (response.data) {
        const { user, access_token, refresh_token } = response.data;
        const tokens: TokenData = {
          access_token,
          refresh_token,
          expires_at: Date.now() + (50 * 60 * 1000),
        };

        // Store tokens in localStorage
        setTokens(tokens);

        // Update state
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, tokens },
        });

        return true;
      }

      dispatch({ type: 'AUTH_FAILURE', payload: 'Registration failed' });
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      return false;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      // Call API logout (will clear tokens internally)
      await apiLogout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local state regardless of API response
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  // Refresh user profile
  const refreshUserProfile = async (): Promise<void> => {
    if (!state.isAuthenticated) return;

    try {
      const response = await getUserProfile();
      
      if (response.data) {
        dispatch({ type: 'SET_USER', payload: response.data });
      }
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
    }
  };

  // Clear error
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: AuthContextType = {
    state,
    dispatch,
    login,
    register,
    logout,
    refreshUserProfile,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
} 