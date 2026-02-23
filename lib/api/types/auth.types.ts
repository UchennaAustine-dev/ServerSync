/**
 * Authentication and user management types
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  restaurantId?: string; // For RESTAURANT_OWNER and KITCHEN_STAFF roles
  createdAt: string;
  updatedAt: string;
}

export type UserRole =
  | "CUSTOMER"
  | "RESTAURANT_OWNER"
  | "DRIVER"
  | "ADMIN"
  | "KITCHEN_STAFF";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: UserRole;
}

export interface RegisterResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

export interface UserProfile extends User {
  preferences?: {
    notifications: boolean;
    language: string;
  };
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  avatar?: string;
  preferences?: {
    notifications?: boolean;
    language?: string;
  };
}
