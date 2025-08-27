"use client";

import { useAuth as useAuthContext } from "@/contexts/AuthContext";
// import { LoginRequest, RegisterRequest } from "@/types/auth";

/**
 * Convenient hook for authentication operations
 * Provides simplified access to auth state and actions
 */
export function useAuth() {
  const {
    state,
    dispatch,
    login,
    register,
    logout,
    refreshUserProfile,
    clearError,
    verifyEmail,
    resendVerification,
  } = useAuthContext();

  return {
    // Raw state/dispatch for advanced flows
    state,
    dispatch,
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    tokens: state.tokens,

    // Computed state
    isEmailVerified: state.user?.email_verified ?? false,
    userDisplayName:
      state.user?.display_name ||
      state.user?.username ||
      state.user?.email ||
      "",
    hasCompletedOnboarding: state.user?.onboarding_completed ?? false,

    // Actions (return the stable functions directly)
    login,
    register,
    logout,
    refreshProfile: refreshUserProfile,
    clearError,
    verifyEmail,
    resendVerification,

    // Helper methods
    getUserInitials: (): string => {
      if (!state.user) return "";

      const firstName = state.user.first_name;
      const lastName = state.user.last_name;
      const username = state.user.username;

      if (firstName && lastName) {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
      }

      if (username) {
        return username.charAt(0).toUpperCase();
      }

      return state.user.email.charAt(0).toUpperCase();
    },

    getFullName: (): string => {
      if (!state.user) return "";

      const firstName = state.user.first_name;
      const lastName = state.user.last_name;

      if (firstName && lastName) {
        return `${firstName} ${lastName}`;
      }

      return state.user.username || state.user.email;
    },

    hasRole: (role: string): boolean => {
      return state.user?.role === role;
    },

    isSubscribed: (): boolean => {
      return !!(
        state.user?.subscription_type && state.user.subscription_type !== "free"
      );
    },
  };
}
