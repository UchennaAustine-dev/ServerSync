/**
 * React Query hooks for customer operations
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customerService } from "../api/services/customer.service";
import type {
  CreateAddressRequest,
  UpdateAddressRequest,
} from "../api/types/customer.types";
import { useUIStore } from "../store";

// Query keys
export const customerKeys = {
  all: ["customers"] as const,
  addresses: () => [...customerKeys.all, "addresses"] as const,
  favorites: () => [...customerKeys.all, "favorites"] as const,
  analytics: (params?: any) =>
    [...customerKeys.all, "analytics", params] as const,
  notificationPreferences: () =>
    [...customerKeys.all, "notification-preferences"] as const,
};

// Address hooks
export function useAddresses() {
  return useQuery({
    queryKey: customerKeys.addresses(),
    queryFn: () => customerService.getAddresses(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: (data: CreateAddressRequest) =>
      customerService.createAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.addresses() });
      addToast({
        type: "success",
        message: "Address added successfully",
      });
    },
    onError: (error: any) => {
      addToast({
        type: "error",
        message: error?.response?.data?.message || "Failed to add address",
      });
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAddressRequest }) =>
      customerService.updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.addresses() });
      addToast({
        type: "success",
        message: "Address updated successfully",
      });
    },
    onError: (error: any) => {
      addToast({
        type: "error",
        message: error?.response?.data?.message || "Failed to update address",
      });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: (id: string) => customerService.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.addresses() });
      addToast({
        type: "success",
        message: "Address deleted successfully",
      });
    },
    onError: (error: any) => {
      addToast({
        type: "error",
        message: error?.response?.data?.message || "Failed to delete address",
      });
    },
  });
}

// Favorites hooks
export function useFavorites() {
  return useQuery({
    queryKey: customerKeys.favorites(),
    queryFn: () => customerService.getFavorites(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: (restaurantId: string) =>
      customerService.addFavorite(restaurantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.favorites() });
      addToast({
        type: "success",
        message: "Added to favorites",
      });
    },
    onError: (error: any) => {
      addToast({
        type: "error",
        message: error?.response?.data?.message || "Failed to add to favorites",
      });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: (restaurantId: string) =>
      customerService.removeFavorite(restaurantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.favorites() });
      addToast({
        type: "success",
        message: "Removed from favorites",
      });
    },
    onError: (error: any) => {
      addToast({
        type: "error",
        message:
          error?.response?.data?.message || "Failed to remove from favorites",
      });
    },
  });
}

// Analytics hooks
export function useCustomerAnalytics(params?: {
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: customerKeys.analytics(params),
    queryFn: () => customerService.getAnalytics(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Notification preferences hooks
export function useNotificationPreferences() {
  return useQuery({
    queryKey: customerKeys.notificationPreferences(),
    queryFn: () => customerService.getNotificationPreferences(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: (data: any) =>
      customerService.updateNotificationPreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: customerKeys.notificationPreferences(),
      });
      addToast({
        type: "success",
        message: "Preferences updated successfully",
      });
    },
    onError: (error: any) => {
      addToast({
        type: "error",
        message:
          error?.response?.data?.message || "Failed to update preferences",
      });
    },
  });
}
