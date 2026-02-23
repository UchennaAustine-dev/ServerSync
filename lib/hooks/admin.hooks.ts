/**
 * Admin React Query hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../api/services/admin.service";
import type {
  AdminDashboard,
  AdminRestaurantListParams,
  AdminDriverListParams,
  AdminOrderListParams,
  UpdateRestaurantStatusRequest,
  UpdateDriverStatusRequest,
} from "../api/types/admin.types";
import type { CancelOrderRequest } from "../api/types/order.types";
import { toast } from "../utils/toast";

// Query keys
export const adminKeys = {
  all: ["admin"] as const,
  dashboard: (params?: { startDate?: string; endDate?: string }) =>
    [...adminKeys.all, "dashboard", params] as const,
  restaurants: (params?: AdminRestaurantListParams) =>
    [...adminKeys.all, "restaurants", params] as const,
  restaurant: (id: string) => [...adminKeys.all, "restaurant", id] as const,
  drivers: (params?: AdminDriverListParams) =>
    [...adminKeys.all, "drivers", params] as const,
  driver: (id: string) => [...adminKeys.all, "driver", id] as const,
  orders: (params?: AdminOrderListParams) =>
    [...adminKeys.all, "orders", params] as const,
  order: (id: string) => [...adminKeys.all, "order", id] as const,
  revenueAnalytics: (params?: { startDate?: string; endDate?: string }) =>
    [...adminKeys.all, "revenue-analytics", params] as const,
  driverPerformance: (params?: { startDate?: string; endDate?: string }) =>
    [...adminKeys.all, "driver-performance", params] as const,
};

/**
 * Hook to fetch admin dashboard data
 */
export function useAdminDashboard(params?: {
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: adminKeys.dashboard(params),
    queryFn: () => adminService.getDashboard(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch restaurants list for admin
 */
export function useAdminRestaurants(params?: AdminRestaurantListParams) {
  return useQuery({
    queryKey: adminKeys.restaurants(params),
    queryFn: () => adminService.getRestaurants(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch single restaurant details for admin
 */
export function useAdminRestaurant(id: string) {
  return useQuery({
    queryKey: adminKeys.restaurant(id),
    queryFn: () => adminService.getRestaurantById(id),
    enabled: !!id,
  });
}

/**
 * Hook to update restaurant status
 */
export function useUpdateRestaurantStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateRestaurantStatusRequest;
    }) => adminService.updateRestaurantStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.restaurants() });
      queryClient.invalidateQueries({
        queryKey: adminKeys.restaurant(variables.id),
      });
      toast.success("Restaurant status updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update restaurant status",
      );
    },
  });
}

/**
 * Hook to fetch drivers list for admin
 */
export function useAdminDrivers(params?: AdminDriverListParams) {
  return useQuery({
    queryKey: adminKeys.drivers(params),
    queryFn: () => adminService.getDrivers(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch single driver details for admin
 */
export function useAdminDriver(id: string) {
  return useQuery({
    queryKey: adminKeys.driver(id),
    queryFn: () => adminService.getDriverById(id),
    enabled: !!id,
  });
}

/**
 * Hook to update driver status
 */
export function useUpdateDriverStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateDriverStatusRequest;
    }) => adminService.updateDriverStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.drivers() });
      queryClient.invalidateQueries({
        queryKey: adminKeys.driver(variables.id),
      });
      toast.success("Driver status updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update driver status",
      );
    },
  });
}

/**
 * Hook to fetch orders list for admin
 */
export function useAdminOrders(params?: AdminOrderListParams) {
  return useQuery({
    queryKey: adminKeys.orders(params),
    queryFn: () => adminService.getOrders(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch single order details for admin
 */
export function useAdminOrder(id: string) {
  return useQuery({
    queryKey: adminKeys.order(id),
    queryFn: () => adminService.getOrderById(id),
    enabled: !!id,
  });
}

/**
 * Hook to cancel order as admin
 */
export function useAdminCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CancelOrderRequest }) =>
      adminService.cancelOrder(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.orders() });
      queryClient.invalidateQueries({
        queryKey: adminKeys.order(variables.id),
      });
      toast.success("Order cancelled successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to cancel order");
    },
  });
}

/**
 * Hook to fetch revenue analytics
 */
export function useRevenueAnalytics(params?: {
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: adminKeys.revenueAnalytics(params),
    queryFn: () => adminService.getRevenueAnalytics(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch driver performance analytics
 */
export function useDriverPerformance(params?: {
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: adminKeys.driverPerformance(params),
    queryFn: () => adminService.getDriverPerformance(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
