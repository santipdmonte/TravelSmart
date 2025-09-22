import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  TokenData,
  EmailVerificationResponse,
  ApiResponse,
  PasswordResetRequest,
  PasswordResetConfirmRequest,
} from "@/types/auth";
import { ROOT_BASE_URL } from "./config";

// Expected response shape for POST /auth/refresh-token
interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number; // seconds
  user_id: string;
}

// Token management utilities
export function getTokens(): TokenData | null {
  if (typeof window === "undefined") return null;

  try {
    const tokens = localStorage.getItem("auth_tokens");
    return tokens ? JSON.parse(tokens) : null;
  } catch {
    return null;
  }
}

export function setTokens(tokens: TokenData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("auth_tokens", JSON.stringify(tokens));
}

export function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_tokens");
}

export function getAccessToken(): string | null {
  const tokens = getTokens();
  return tokens?.access_token || null;
}

// Ensure only one refresh happens at a time across the app
let refreshInFlight: Promise<boolean> | null = null;

async function refreshWithLock(providedRefreshToken?: string): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const result = await refreshToken(providedRefreshToken);
      return !result.error && !!result.data;
    })().finally(() => {
      refreshInFlight = null;
    });
  }
  return await refreshInFlight;
}

// Base fetch wrapper for auth and other root-mounted endpoints
async function authApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${ROOT_BASE_URL}${path}`;

    const response = await fetch(url.replace(/([^:])\/\//g, "$1/"), {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
      ...options,
    });

    // Handle different response types
    if (response.status === 204) {
      // No content responses (like logout)
      return { data: {} as T, status: 204 };
    }

    const data = await response.json();

    if (!response.ok) {
      return {
        error:
          (data && (data.message || data.detail)) ||
          `HTTP error! status: ${response.status}`,
        status: response.status,
      };
    }

    return { data, status: response.status };
  } catch (error) {
    console.error("Auth API request failed:", error);
    return {
      error: error instanceof Error ? error.message : "Network error occurred",
      status: undefined,
    };
  }
}

// Authenticated request wrapper (includes Authorization header)
async function authenticatedRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  // Preflight: ensure token is present and valid (refresh if expired)
  const preflightOk = await ensureValidToken();
  if (!preflightOk) {
    return { error: "No access token available" };
  }

  const perform = () =>
    authApiRequest<T>(endpoint, {
      ...options,
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
        ...options.headers,
      },
    });

  // First attempt
  let result = await perform();

  // If unauthorized, try refreshing once and retry
  if (result.status === 401) {
    const ok = await refreshWithLock();
    if (ok) {
      result = await perform();
    }
  }

  return result;
}

// Authentication API functions

/**
 * Login user with email and password
 */
export async function login(
  credentials: LoginRequest
): Promise<ApiResponse<AuthResponse>> {
  return authApiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

/**
 * Request a magic login link via email
 * Expected 200 response: { message: "Verification code sent", email: string }
 */
export async function requestMagicLink(
  email: string
): Promise<ApiResponse<{ message: string; email: string }>> {
  const endpoint = `/auth/login`;
  return authApiRequest<{ message: string; email: string }>(endpoint, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/**
 * Register new user account
 */
export async function register(
  userData: RegisterRequest
): Promise<ApiResponse<AuthResponse>> {
  return authApiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

/**
 * Logout current user
 */
export async function logout(): Promise<ApiResponse<void>> {
  const result = await authenticatedRequest<void>("/auth/logout", {
    method: "POST",
  });

  // Clear tokens regardless of API response
  clearTokens();

  return result;
}

/**
 * Refresh access token using refresh token
 */
export async function refreshToken(
  refreshTokenValue?: string
): Promise<ApiResponse<TokenData>> {
  const currentTokens = getTokens();
  const tokenToUse = refreshTokenValue || currentTokens?.refresh_token;

  if (!tokenToUse) {
    return { error: "No refresh token available" };
  }

  const result = await authApiRequest<RefreshTokenResponse>(
    `/auth/refresh-token?refresh_token=${encodeURIComponent(tokenToUse)}`,
    {
      method: "POST",
    }
  );

  if (result.error || !result.data) return result as ApiResponse<TokenData>;

  // The backend returns token_type, access_token, refresh_token, expires_in, user_id
  const now = Date.now();
  const expiresAt =
    now + (result.data.expires_in ? result.data.expires_in * 1000 : 0);
  const tokenData: TokenData = {
    access_token: result.data.access_token,
    refresh_token: result.data.refresh_token ?? tokenToUse,
    expires_at: expiresAt,
  };
  setTokens(tokenData);
  return { data: tokenData };
}

/**
 * Verify email with verification token
 */
export async function verifyEmail(
  token: string
): Promise<ApiResponse<EmailVerificationResponse>> {
  const url = `/auth/verify-email?token=${encodeURIComponent(token)}`;
  console.log("API: Making verification request to:", url);
  return authApiRequest<EmailVerificationResponse>(url, {
    method: "GET",
  });
}

/**
 * Verify email validation token (magic link) and retrieve token pair
 * GET /auth/email/verify-token/?token=<token>
 * Returns: { access_token, refresh_token, token_type }
 */
export async function verifyEmailValidationToken(
  token: string
): Promise<ApiResponse<{ access_token: string; refresh_token: string; token_type: string }>> {
  const url = `/auth/email/verify-token/?token=${encodeURIComponent(token)}`;
  return authApiRequest<{ access_token: string; refresh_token: string; token_type: string }>(url, {
    method: "GET",
  });
}

/**
 * Verify Google validation token and retrieve token pair
 * GET /auth/google/verify-token/?token=<token>
 * Returns: { access_token, refresh_token, token_type }
 */
export async function verifyGoogleToken(
  token: string
): Promise<ApiResponse<{ access_token: string; refresh_token: string; token_type: string }>> {
  const url = `/auth/google/verify-token/?token=${encodeURIComponent(token)}`;
  return authApiRequest<{ access_token: string; refresh_token: string; token_type: string }>(url, {
    method: "GET",
  });
}

/**
 * Resend email verification
 */
export async function resendVerification(
  email: string
): Promise<ApiResponse<{ message: string }>> {
  // This endpoint does NOT require auth; backend expects body { email }
  return authApiRequest<{ message: string }>("/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// ==================== PASSWORD MANAGEMENT ====================

/**
 * Request password reset email
 */
export async function requestPasswordReset(
  emailData: PasswordResetRequest
): Promise<ApiResponse<{ message: string }>> {
  return authApiRequest<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(emailData),
  });
}

/**
 * Reset password with token
 */
export async function resetPassword(
  resetData: PasswordResetConfirmRequest
): Promise<ApiResponse<{ message: string }>> {
  return authApiRequest<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(resetData),
  });
}

/**
 * Get current user profile
 */
export async function getUserProfile(): Promise<ApiResponse<User>> {
  return authenticatedRequest<User>("/users/profile");
}

/**
 * Update user profile
 */
export async function updateUserProfile(profileData: {
  first_name: string;
  last_name: string;
  display_name: string;
  username: string;
  bio?: string;
}): Promise<ApiResponse<User>> {
  return authenticatedRequest<User>("/users/profile", {
    method: "PUT",
    body: JSON.stringify(profileData),
  });
}

/**
 * Update only visited countries on the user profile
 */
export async function updateUserVisitedCountries(
  visited_countries: string[]
): Promise<ApiResponse<User>> {
  console.log("API: Updating visited countries:", JSON.stringify({ visited_countries }));
  return authenticatedRequest<User>("/users/profile", {
    method: "PUT",
    body: JSON.stringify({ visited_countries }),
  });
}

/**
 * Check if user is authenticated (has valid tokens)
 */
export function isAuthenticated(): boolean {
  const tokens = getTokens();
  return !!(tokens?.access_token && tokens?.refresh_token);
}

/**
 * Auto-refresh token if needed (called before API requests)
 */
export async function ensureValidToken(): Promise<boolean> {
  const tokens = getTokens();

  if (!tokens) {
    return false;
  }

  // If we have an expires_at and it's expired, try to refresh
  if (tokens.expires_at && Date.now() >= tokens.expires_at) {
    const ok = await refreshWithLock();
    if (!ok) {
      clearTokens();
    }
    return ok;
  }

  return true;
}
