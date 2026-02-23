/**
 * Authentication React Query Hooks
 *
 * Provides React Query hooks for authentication operations including:
 * - Login, Register, Logout
 * - Password reset flow (forgot password, reset password)
 * - User profile management (fetch, update)
 *
 * Integrates with:
 * - authService for API calls
 * - useAuthStore for state management
 * - queryKeys for cache management
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 23.8
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/lib/api/services/auth.service";
import { useAuthStore } from "@/lib/store/auth.store";
import { queryKeys, staleTimeConfig } from "@/lib/config/query-client";
import type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
} from "@/lib/api/types/auth.types";

/**
 * Login mutation hook
 * Requirement 2.7: Stores authentication tokens securely
 *
 * @returns Mutation object with login function
 */
export function useLogin() {
  const { setAuth } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (response) => {
      // Update auth store with user and tokens
      setAuth(response.user, response.token, response.refreshToken);

      // Set profile data in cache
      queryClient.setQueryData(queryKeys.auth.profile, response.user);
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });
}

/**
 * Register mutation hook
 * Requirement 2.7: Stores authentication tokens securely
 *
 * @returns Mutation object with register function
 */
export function useRegister() {
  const { setAuth } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (response) => {
      // Update auth store with user and tokens
      setAuth(response.user, response.token, response.refreshToken);

      // Set profile data in cache
      queryClient.setQueryData(queryKeys.auth.profile, response.user);
    },
    onError: (error) => {
      console.error("Registration failed:", error);
    },
  });
}

/**
 * Logout mutation hook
 * Clears authentication state and cache
 *
 * @returns Mutation object with logout function
 */
export function useLogout() {
  const { clearAuth } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear auth store
      clearAuth();

      // Clear all cached queries
      queryClient.clear();
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      // Clear auth even if API call fails
      clearAuth();
      queryClient.clear();
    },
  });
}

/**
 * Forgot password mutation hook
 * Requirement 2.1: Calls POST /auth/forgot-password
 * Requirement 2.2: Displays confirmation message on success
 *
 * @returns Mutation object with forgotPassword function
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) =>
      authService.forgotPassword(data),
    onError: (error) => {
      console.error("Forgot password request failed:", error);
    },
  });
}

/**
 * Reset password mutation hook
 * Requirement 2.3: Validates the reset token
 * Requirement 2.4: Calls POST /auth/reset-password
 * Requirement 2.5: Redirects to login page on success
 *
 * @returns Mutation object with resetPassword function
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => authService.resetPassword(data),
    onError: (error) => {
      console.error("Password reset failed:", error);
    },
  });
}

/**
 * User profile query hook
 * Fetches the current user's profile data
 *
 * @returns Query object with profile data
 */
export function useProfile() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.auth.profile,
    queryFn: () => authService.getProfile(),
    staleTime: staleTimeConfig.profile, // 5 minutes
    enabled: isAuthenticated, // Only fetch if user is authenticated
  });
}

/**
 * Update profile mutation hook
 * Requirement 2.6: Calls PATCH /auth/profile
 *
 * @returns Mutation object with updateProfile function
 */
export function useUpdateProfile() {
  const { setUser } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => authService.updateProfile(data),
    onSuccess: (updatedProfile) => {
      // Update user in auth store
      setUser(updatedProfile);

      // Update profile in cache
      queryClient.setQueryData(queryKeys.auth.profile, updatedProfile);

      // Invalidate profile query to ensure consistency
      queryClient.invalidateQueries({
        queryKey: queryKeys.auth.profile,
      });
    },
    onError: (error) => {
      console.error("Profile update failed:", error);
    },
  });
}
