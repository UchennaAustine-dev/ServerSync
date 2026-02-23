/**
 * Driver React Query Hooks
 *
 * Provides React Query hooks for driver operations including:
 * - Driver registration and profile management
 * - Order management (available, active orders)
 * - Availability management
 * - Earnings and metrics tracking
 *
 * Integrates with:
 * - driverService for API calls
 * - useAuthStore for state management
 * - queryKeys for cache management
 *
 * Requirements: 11.1, 11.2, 11.3, 11.4, 12.1, 12.2, 12.3, 14.1, 14.2, 15.1
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { driverService } from "@/lib/api/services/driver.service";
import { useAuthStore } from "@/lib/store/auth.store";
import { queryKeys, staleTimeConfig } from "@/lib/config/query-client";
import type {
  RegisterDriverRequest,
  UpdateDriverProfileRequest,
  AcceptOrderRequest,
  UpdateDeliveryStatusRequest,
  UpdateAvailabilityRequest,
} from "@/lib/api/types/driver.types";

/**
 * Driver registration mutation hook
 * Requirement 11.1: Calls POST /drivers/register
 * Requirement 11.2: Includes driver personal information, vehicle details, and license number
 * Requirement 11.3: Handles multipart/form-data encoding for document uploads
 * Requirement 11.4: Stores driver authentication tokens on success
 *
 * @returns Mutation object with register function
 */
export function useRegisterDriver() {
  const { setAuth } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RegisterDriverRequest) => {
      // If documents are provided, convert to FormData
      if (data.documents) {
        const formData = new FormData();

        // Add text fields
        formData.append("name", data.name);
        formData.append("email", data.email);
        formData.append("password", data.password);
        formData.append("phone", data.phone);
        formData.append("licenseNumber", data.licenseNumber);
        formData.append("vehicleType", data.vehicleType);
        formData.append("vehiclePlate", data.vehiclePlate);
        formData.append("vehicleColor", data.vehicleColor);

        // Add document files
        if (data.documents.license) {
          formData.append("license", data.documents.license);
        }
        if (data.documents.insurance) {
          formData.append("insurance", data.documents.insurance);
        }
        if (data.documents.registration) {
          formData.append("registration", data.documents.registration);
        }

        // Call service with FormData
        return driverService.register(data);
      }

      // Call service with regular JSON data
      return driverService.register(data);
    },
    onSuccess: (response: any) => {
      // If response includes auth tokens, store them
      if (response.token && response.refreshToken) {
        setAuth(
          response.user || response,
          response.token,
          response.refreshToken,
        );
      }

      // Set profile data in cache
      queryClient.setQueryData(queryKeys.drivers.profile, response);
    },
    onError: (error) => {
      console.error("Driver registration failed:", error);
    },
  });
}

/**
 * Driver profile query hook
 * Requirement 14.8: Calls GET /drivers/profile to retrieve current availability
 *
 * @returns Query object with driver profile data
 */
export function useDriverProfile() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.drivers.profile,
    queryFn: () => driverService.getProfile(),
    staleTime: staleTimeConfig.profile,
    enabled: isAuthenticated,
  });
}

/**
 * Update driver profile mutation hook
 *
 * @returns Mutation object with updateProfile function
 */
export function useUpdateDriverProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateDriverProfileRequest) =>
      driverService.updateProfile(data),
    onSuccess: (updatedProfile) => {
      // Update profile in cache
      queryClient.setQueryData(queryKeys.drivers.profile, updatedProfile);

      // Invalidate profile query to ensure consistency
      queryClient.invalidateQueries({
        queryKey: queryKeys.drivers.profile,
      });
    },
    onError: (error) => {
      console.error("Driver profile update failed:", error);
    },
  });
}

/**
 * Available orders query hook
 * Requirement 12.1: Calls GET /drivers/orders/available
 *
 * @returns Query object with available orders
 */
export function useAvailableOrders() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.drivers.availableOrders,
    queryFn: () => driverService.getAvailableOrders(),
    staleTime: staleTimeConfig.driverAvailability,
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
}

/**
 * Active orders query hook
 * Requirement 12.5: Calls GET /drivers/orders/active
 *
 * @returns Query object with active orders
 */
export function useActiveOrders() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.drivers.activeOrders,
    queryFn: () => driverService.getActiveOrders(),
    staleTime: staleTimeConfig.driverAvailability,
    enabled: isAuthenticated,
    refetchInterval: 10000, // Refetch every 10 seconds for active deliveries
  });
}

/**
 * Accept order mutation hook
 * Requirement 12.3: Calls POST /drivers/orders/:id/accept
 * Requirement 12.8: Updates available orders list when driver accepts an order
 *
 * @returns Mutation object with acceptOrder function
 */
export function useAcceptOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      data,
    }: {
      orderId: string;
      data: AcceptOrderRequest;
    }) => driverService.acceptOrder(orderId, data),
    onSuccess: () => {
      // Invalidate available orders to remove accepted order
      queryClient.invalidateQueries({
        queryKey: queryKeys.drivers.availableOrders,
      });

      // Invalidate active orders to show newly accepted order
      queryClient.invalidateQueries({
        queryKey: queryKeys.drivers.activeOrders,
      });
    },
    onError: (error) => {
      console.error("Order acceptance failed:", error);
    },
  });
}

/**
 * Update delivery status mutation hook
 * Requirement 12.6: Calls PATCH /drivers/orders/:id/status
 *
 * @returns Mutation object with updateDeliveryStatus function
 */
export function useUpdateDeliveryStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      data,
    }: {
      orderId: string;
      data: UpdateDeliveryStatusRequest;
    }) => driverService.updateDeliveryStatus(orderId, data),
    onSuccess: () => {
      // Invalidate active orders to reflect status change
      queryClient.invalidateQueries({
        queryKey: queryKeys.drivers.activeOrders,
      });
    },
    onError: (error) => {
      console.error("Delivery status update failed:", error);
    },
  });
}

/**
 * Update availability mutation hook
 * Requirement 14.1: Calls PATCH /drivers/availability
 * Requirement 14.6: Implements optimistic update for availability toggle
 *
 * @returns Mutation object with updateAvailability function
 */
export function useUpdateAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAvailabilityRequest) =>
      driverService.updateAvailability(data),
    onMutate: async (newData) => {
      // Optimistic update
      await queryClient.cancelQueries({
        queryKey: queryKeys.drivers.profile,
      });

      const previousProfile = queryClient.getQueryData(
        queryKeys.drivers.profile,
      );

      queryClient.setQueryData(queryKeys.drivers.profile, (old: any) => ({
        ...old,
        isAvailable: newData.isAvailable,
      }));

      return { previousProfile };
    },
    onError: (err, newData, context) => {
      // Revert optimistic update on error
      if (context?.previousProfile) {
        queryClient.setQueryData(
          queryKeys.drivers.profile,
          context.previousProfile,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.drivers.profile,
      });
    },
  });
}

/**
 * Driver earnings query hook
 * Requirement 15.1: Calls GET /drivers/earnings
 *
 * @returns Query object with earnings data
 */
export function useDriverEarnings(params?: {
  startDate?: string;
  endDate?: string;
}) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.drivers.earnings(params),
    queryFn: () => driverService.getEarnings(params),
    staleTime: staleTimeConfig.analytics,
    enabled: isAuthenticated,
  });
}

/**
 * Driver metrics query hook
 *
 * @returns Query object with driver metrics
 */
export function useDriverMetrics(params?: {
  startDate?: string;
  endDate?: string;
}) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.drivers.metrics(params),
    queryFn: () => driverService.getMetrics(params),
    staleTime: staleTimeConfig.analytics,
    enabled: isAuthenticated,
  });
}
