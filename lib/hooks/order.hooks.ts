/**
 * Order React Query Hooks
 *
 * Provides React Query hooks for order operations including:
 * - Order creation and management
 * - Order history fetching
 * - Order status updates
 * - Order cancellation and rating
 * - Promo code validation
 *
 * Integrates with:
 * - orderService for API calls
 * - useCartStore for cart management
 * - queryKeys for cache management
 *
 * Requirements: 5.1, 5.7, 5.9, 8.1, 8.2, 8.3, 8.5
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orderService } from "@/lib/api/services/order.service";
import { useCartStore } from "@/lib/store/cart.store";
import { queryKeys, staleTimeConfig } from "@/lib/config/query-client";
import type {
  CreateOrderRequest,
  OrderListParams,
  UpdateOrderStatusRequest,
  CancelOrderRequest,
  RateOrderRequest,
  ValidatePromoRequest,
} from "@/lib/api/types/order.types";

/**
 * Create order mutation hook
 * Requirement 5.1: Calls POST /orders with order details
 * Requirement 5.7: Includes delivery address, contact information, and special instructions
 * Requirement 5.8: Invalidates customer order history after creation
 *
 * @returns Mutation object with createOrder function
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { clearCart } = useCartStore();

  return useMutation({
    mutationFn: (data: CreateOrderRequest) => orderService.create(data),
    onSuccess: (order) => {
      // Clear the cart after successful order creation
      clearCart();

      // Invalidate order list to refetch with new order
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.all,
      });

      // Set the new order in cache
      queryClient.setQueryData(queryKeys.orders.detail(order.id), order);
    },
    onError: (error) => {
      console.error("Order creation failed:", error);
    },
  });
}

/**
 * Orders list query hook
 * Requirement 8.1: Calls GET /orders
 * Requirement 8.2: Supports pagination parameters
 *
 * @param params - Optional filter and pagination parameters
 * @returns Query object with orders list data
 */
export function useOrders(params?: OrderListParams) {
  return useQuery({
    queryKey: queryKeys.orders.list(params),
    queryFn: () => orderService.list(params),
    staleTime: staleTimeConfig.orders, // 2 minutes
  });
}

/**
 * Single order query hook
 * Requirement 8.3: Calls GET /orders/:id
 *
 * @param orderId - The order ID to fetch
 * @param enabled - Whether the query should run (default: true)
 * @returns Query object with order detail data
 */
export function useOrder(orderId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.orders.detail(orderId),
    queryFn: () => orderService.getById(orderId),
    staleTime: staleTimeConfig.orders, // 2 minutes
    enabled: enabled && !!orderId,
  });
}

/**
 * Update order status mutation hook
 * Used by restaurant staff to update order status
 *
 * @returns Mutation object with updateStatus function
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      data,
    }: {
      orderId: string;
      data: UpdateOrderStatusRequest;
    }) => orderService.updateStatus(orderId, data),
    onSuccess: (order) => {
      // Update the order in cache
      queryClient.setQueryData(queryKeys.orders.detail(order.id), order);

      // Invalidate order lists to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.all,
      });
    },
    onError: (error) => {
      console.error("Order status update failed:", error);
    },
  });
}

/**
 * Cancel order mutation hook
 * Requirement 8.5: Calls PATCH /orders/:id/cancel
 *
 * @returns Mutation object with cancelOrder function
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      data,
    }: {
      orderId: string;
      data: CancelOrderRequest;
    }) => orderService.cancel(orderId, data),
    onSuccess: (order) => {
      // Update the order in cache
      queryClient.setQueryData(queryKeys.orders.detail(order.id), order);

      // Invalidate order lists to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.all,
      });
    },
    onError: (error) => {
      console.error("Order cancellation failed:", error);
    },
  });
}

/**
 * Rate order mutation hook
 * Allows customers to rate and review completed orders
 *
 * @returns Mutation object with rateOrder function
 */
export function useRateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      data,
    }: {
      orderId: string;
      data: RateOrderRequest;
    }) => orderService.rate(orderId, data),
    onSuccess: (order) => {
      // Update the order in cache
      queryClient.setQueryData(queryKeys.orders.detail(order.id), order);

      // Invalidate order lists to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.all,
      });
    },
    onError: (error) => {
      console.error("Order rating failed:", error);
    },
  });
}

/**
 * Validate promo code mutation hook
 * Requirement 5.9: Validates promo code via orderService.validatePromo
 *
 * @returns Mutation object with validatePromo function
 */
export function useValidatePromo() {
  return useMutation({
    mutationFn: (data: ValidatePromoRequest) =>
      orderService.validatePromo(data),
    onError: (error) => {
      console.error("Promo code validation failed:", error);
    },
  });
}
