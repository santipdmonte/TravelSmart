"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import {
  AuthState,
  AuthAction,
  TokenData,
  LoginRequest,
  RegisterRequest,
} from "@/types/auth";
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getUserProfile,
  getTokens,
  setTokens,
  clearTokens,
  isAuthenticated as checkAuthenticated,
  verifyEmail as apiVerifyEmail,
  resendVerification as apiResendVerification,
} from "@/lib/authApi";

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  tokens: null,
  verificationPending: false,
  verificationEmail: null,
  showWelcomePopup: false,
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "AUTH_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case "AUTH_FAILURE":
      return {
        ...state,
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case "AUTH_LOGOUT":
      return {
        ...initialState,
      };

    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
      };

    case "SET_TOKENS":
      return {
        ...state,
        tokens: action.payload,
        isAuthenticated: true,
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };

    case "TOKEN_REFRESH_SUCCESS":
      return {
        ...state,
        tokens: action.payload,
      };

    case "TOKEN_REFRESH_FAILURE":
      return {
        ...initialState,
      };

    case "VERIFICATION_PENDING":
      return {
        ...state,
        verificationPending: true,
        verificationEmail: action.payload,
        isLoading: false,
        error: null,
      };

    case "VERIFICATION_SUCCESS":
      return {
        ...state,
        verificationPending: false,
        verificationEmail: null,
        isLoading: false,
        error: null,
      };

    case "VERIFICATION_FAILURE":
      return {
        ...state,
        verificationPending: false,
        verificationEmail: null,
        isLoading: false,
        error: action.payload,
      };

    case "SHOW_WELCOME_POPUP":
      console.log(
        "AuthContext [reducer]: Recibida acción SHOW_WELCOME_POPUP. El nuevo estado será:",
        { ...state, showWelcomePopup: action.payload }
      );
      return {
        ...state,
        showWelcomePopup: action.payload,
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
  verifyEmail: (token: string) => Promise<boolean>;
  resendVerification: (email: string) => Promise<boolean>;
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
        dispatch({ type: "SET_LOADING", payload: true });

        try {
          // Try to get user profile to verify token validity
          const profileResponse = await getUserProfile();

          if (profileResponse.data) {
            dispatch({
              type: "AUTH_SUCCESS",
              payload: {
                user: profileResponse.data,
                tokens: tokens,
              },
            });
          } else {
            // Token invalid, clear everything
            clearTokens();
            dispatch({ type: "AUTH_LOGOUT" });
          }
        } catch {
          // Error getting profile, clear auth
          clearTokens();
          dispatch({ type: "AUTH_LOGOUT" });
        }
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = useCallback(
    async (credentials: LoginRequest): Promise<boolean> => {
      dispatch({ type: "AUTH_START" });

      try {
        const response = await apiLogin(credentials);

        if (response.error) {
          dispatch({ type: "AUTH_FAILURE", payload: response.error });
          return false;
        }

        if (response.data) {
          const { user, access_token, refresh_token } = response.data;
          const tokens: TokenData = {
            access_token,
            refresh_token,
            // Set expiry to 50 minutes from now (assuming 1-hour tokens)
            expires_at: Date.now() + 50 * 60 * 1000,
          };

          // Store tokens in localStorage
          setTokens(tokens);

          // Decide welcome popup before committing user to state
          const shouldShowPopup =
            Number(user?.login_count ?? 0) === 1 && !user?.traveler_type_id;
          console.log(
            "AuthContext [login]: Verificando condición del popup...",
            {
              login_count: user?.login_count,
              traveler_type_id: user?.traveler_type_id,
              shouldShowPopup,
            }
          );
          if (shouldShowPopup) {
            console.log(
              "AuthContext [login]: Condición cumplida. Despachando SHOW_WELCOME_POPUP."
            );
            dispatch({ type: "SHOW_WELCOME_POPUP", payload: true });
          }

          // Update state
          dispatch({
            type: "AUTH_SUCCESS",
            payload: { user, tokens },
          });

          return true;
        }

        dispatch({ type: "AUTH_FAILURE", payload: "Error al iniciar sesión" });
        return false;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Error al iniciar sesión";
        dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
        return false;
      }
    },
    []
  );

  // Register function
  const register = useCallback(
    async (userData: RegisterRequest): Promise<boolean> => {
      dispatch({ type: "AUTH_START" });

      try {
        const response = await apiRegister(userData);

        if (response.error) {
          dispatch({ type: "AUTH_FAILURE", payload: response.error });
          return false;
        }

        if (response.data) {
          // Check if user needs email verification
          if (response.data.user && !response.data.user.email_verified) {
            // User registered but needs email verification
            dispatch({
              type: "VERIFICATION_PENDING",
              payload: response.data.user.email,
            });
            return true;
          }

          // User is already verified (auto-login case)
          const { user, access_token, refresh_token } = response.data;
          const tokens: TokenData = {
            access_token,
            refresh_token,
            expires_at: Date.now() + 50 * 60 * 1000,
          };

          // Store tokens in localStorage
          setTokens(tokens);

          // Update state
          dispatch({
            type: "AUTH_SUCCESS",
            payload: { user, tokens },
          });

          return true;
        }

        dispatch({ type: "AUTH_FAILURE", payload: "Error en el registro" });
        return false;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Error en el registro";
        dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
        return false;
      }
    },
    []
  );

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    try {
      // Call API logout (will clear tokens internally)
      await apiLogout();
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      // Always clear local state regardless of API response
      dispatch({ type: "AUTH_LOGOUT" });
    }
  }, []);

  // Refresh user profile
  const refreshUserProfile = useCallback(async (): Promise<void> => {
    try {
      const response = await getUserProfile();

      if (response.data) {
        dispatch({ type: "SET_USER", payload: response.data });
      }
    } catch (error) {
      console.error("Failed to refresh user profile:", error);
    }
  }, []);

  // Clear error
  const clearError = useCallback((): void => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  // Verify email function
  const verifyEmail = useCallback(async (token: string): Promise<boolean> => {
    console.log("AuthContext: Starting email verification with token:", token);
    dispatch({ type: "AUTH_START" });

    try {
      const response = await apiVerifyEmail(token);
      console.log("AuthContext: API response:", response);

      if (response.error) {
        console.log(
          "AuthContext: Verification failed with error:",
          response.error
        );
        dispatch({ type: "VERIFICATION_FAILURE", payload: response.error });
        return false;
      }

      if (response.data) {
        // Email verified successfully, user is now logged in
        const { user, access_token, refresh_token, expires_in } = response.data;

        // Decide welcome popup based on verifyEmail login flow
        const shouldShowPopup =
          Number(user?.login_count ?? 0) === 1 && !user?.traveler_type_id;
        if (shouldShowPopup) {
          console.log(
            "AuthContext [verifyEmail]: ¡Condición cumplida! Mostrando el pop-up."
          );
          dispatch({ type: "SHOW_WELCOME_POPUP", payload: true });
        } else {
          console.log("AuthContext [verifyEmail]: Condición no cumplida.", {
            login_count: user?.login_count,
            has_traveler_type: !!user?.traveler_type_id,
          });
        }

        const tokens: TokenData = {
          access_token,
          refresh_token,
          expires_at: Date.now() + expires_in * 1000,
        };

        // Store tokens in localStorage
        setTokens(tokens);

        // Update state
        dispatch({
          type: "AUTH_SUCCESS",
          payload: { user, tokens },
        });

        return true;
      }

      dispatch({
        type: "VERIFICATION_FAILURE",
        payload: "La verificación de correo falló",
      });
      return false;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "La verificación de correo falló";
      dispatch({ type: "VERIFICATION_FAILURE", payload: errorMessage });
      return false;
    }
  }, []);

  // Resend verification email function
  const resendVerification = useCallback(
    async (email: string): Promise<boolean> => {
      dispatch({ type: "AUTH_START" });

      try {
        const response = await apiResendVerification(email);

        if (response.error) {
          dispatch({ type: "AUTH_FAILURE", payload: response.error });
          return false;
        }

        // Success - verification email sent
        dispatch({ type: "VERIFICATION_SUCCESS" });
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "No se pudo reenviar el correo de verificación";
        dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
        return false;
      }
    },
    []
  );

  const contextValue: AuthContextType = {
    state,
    dispatch,
    login,
    register,
    logout,
    refreshUserProfile,
    clearError,
    verifyEmail,
    resendVerification,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
