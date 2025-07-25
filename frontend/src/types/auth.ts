// Base API response interface
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// User profile interface (matches GET /users/profile response)
export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  display_name: string;
  bio: string;
  date_of_birth: string;
  phone_number: string;
  country: string;
  city: string;
  timezone: string;
  preferred_currency: string;
  preferred_travel_style: string;
  travel_interests: string[];
  dietary_restrictions: string[];
  accessibility_needs: string[];
  countries_visited: string[];
  languages_spoken: string[];
  travel_experience_level: string;
  measurement_system: string;
  preferred_language: string;
  status: string;
  role: string;
  email_verified: boolean;
  subscription_type: string;
  is_public_profile: boolean;
  total_trips_created: number;
  total_trips_completed: number;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

// Authentication request interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

// Simplified registration form data (username will be auto-generated)
export interface RegisterFormData {
  email: string;
  password: string;
}

// Authentication response interfaces
export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
}

// Authentication state interface
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  tokens: TokenData | null;
  verificationPending: boolean;
  verificationEmail: string | null;
}

// Authentication error interface
export interface AuthError {
  message: string;
  code?: string;
  field?: string;
}

// Email verification interface
export interface EmailVerificationRequest {
  token: string;
}

export interface EmailVerificationResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

// Auth action types for reducer
export type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: { user: User; tokens: TokenData } }
  | { type: "AUTH_FAILURE"; payload: string }
  | { type: "AUTH_LOGOUT" }
  | { type: "SET_USER"; payload: User }
  | { type: "SET_TOKENS"; payload: TokenData }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "CLEAR_ERROR" }
  | { type: "TOKEN_REFRESH_SUCCESS"; payload: TokenData }
  | { type: "TOKEN_REFRESH_FAILURE" }
  | { type: "VERIFICATION_PENDING"; payload: string }
  | { type: "VERIFICATION_SUCCESS" }
  | { type: "VERIFICATION_FAILURE"; payload: string };
