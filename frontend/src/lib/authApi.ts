import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  TokenData,
  EmailVerificationResponse,
  ApiResponse,
} from "@/types/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8001";

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

// Base fetch wrapper for auth endpoints
async function authApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    // Handle different response types
    if (response.status === 204) {
      // No content responses (like logout)
      return { data: {} as T };
    }

    const data = await response.json();

    if (!response.ok) {
      return {
        error:
          data.message ||
          data.detail ||
          `HTTP error! status: ${response.status}`,
      };
    }

    return { data };
  } catch (error) {
    console.error("Auth API request failed:", error);
    return {
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
}

// Authenticated request wrapper (includes Authorization header)
async function authenticatedRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const accessToken = getAccessToken();

  if (!accessToken) {
    return { error: "No access token available" };
  }

  return authApiRequest<T>(endpoint, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });
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

  return authApiRequest<TokenData>(
    `/auth/refresh-token?refresh-token=${encodeURIComponent(tokenToUse)}`,
    {
      method: "GET",
    }
  );
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
 * Resend email verification
 */
export async function resendVerification(): Promise<
  ApiResponse<{ message: string }>
> {
  return authenticatedRequest<{ message: string }>(
    "/auth/resend-verification",
    {
      method: "POST",
    }
  );
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
    const refreshResult = await refreshToken();

    if (refreshResult.error || !refreshResult.data) {
      clearTokens();
      return false;
    }

    setTokens(refreshResult.data);
    return true;
  }

  return true;
}
