/**
 * Restaurant React Query Hooks
 * Implements requirements 3.1, 3.2, 3.4, 22.1, 26.2
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, staleTimeConfig } from "@/lib/config/query-client";
import { restaurantService } from "@/lib/api/services";
import type {
  RestaurantListParams,
  UpdateRestaurantRequest,
  CreateMenuItemRequest,
  UpdateMenuItemRequest,
} from "@/lib/api/types";

/**
 * Fetch restaurant list with pagination support
 * Requirement 3.1: Calls GET /restaurants on page load
 * Requirement 3.4: No mock data fallbacks
 * Requirement 22.1: Returns loading state for indicators
 * Requirement 26.2: Removes hardcoded mock data
 */
export function useRestaurants(params?: RestaurantListParams) {
  return useQuery({
    queryKey: queryKeys.restaurants.list(params),
    queryFn: () => restaurantService.list(params),
    staleTime: staleTimeConfig.restaurants, // 5 minutes
  });
}

/**
 * Fetch single restaurant by ID
 * Requirement 3.2: Calls GET /restaurants/:id on detail page load
 * Requirement 3.4: No mock data fallbacks
 */
export function useRestaurant(id: string) {
  return useQuery({
    queryKey: queryKeys.restaurants.detail(id),
    queryFn: () => restaurantService.getById(id),
    staleTime: staleTimeConfig.restaurants,
    enabled: !!id, // Only fetch if id is provided
  });
}

/**
 * Fetch restaurant menu
 */
export function useRestaurantMenu(restaurantId: string) {
  return useQuery({
    queryKey: queryKeys.restaurants.menu(restaurantId),
    queryFn: () => restaurantService.getMenu(restaurantId),
    staleTime: staleTimeConfig.menu, // 5 minutes
    enabled: !!restaurantId,
  });
}

/**
 * Fetch restaurant operating hours
 */
export function useRestaurantHours(restaurantId: string) {
  return useQuery({
    queryKey: queryKeys.restaurants.hours(restaurantId),
    queryFn: () => restaurantService.getOperatingHours(restaurantId),
    staleTime: staleTimeConfig.restaurants,
    enabled: !!restaurantId,
  });
}

/**
 * Fetch restaurant promotions
 */
export function useRestaurantPromotions(restaurantId: string) {
  return useQuery({
    queryKey: queryKeys.restaurants.promotions(restaurantId),
    queryFn: () => restaurantService.getPromotions(restaurantId),
    staleTime: staleTimeConfig.restaurants,
    enabled: !!restaurantId,
  });
}

/**
 * Update restaurant mutation with cache invalidation
 */
export function useUpdateRestaurant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRestaurantRequest }) =>
      restaurantService.update(id, data),
    onSuccess: (updatedRestaurant, variables) => {
      // Invalidate specific restaurant query
      queryClient.invalidateQueries({
        queryKey: queryKeys.restaurants.detail(variables.id),
      });

      // Invalidate restaurant list to show updated data
      queryClient.invalidateQueries({
        queryKey: queryKeys.restaurants.list(),
      });

      // Optimistically update the cache
      queryClient.setQueryData(
        queryKeys.restaurants.detail(variables.id),
        updatedRestaurant,
      );
    },
  });
}

/**
 * Create menu item mutation
 */
export function useCreateMenuItem(restaurantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMenuItemRequest) =>
      restaurantService.createMenuItem(restaurantId, data),
    onSuccess: () => {
      // Invalidate menu query to refetch with new item
      queryClient.invalidateQueries({
        queryKey: queryKeys.restaurants.menu(restaurantId),
      });
    },
  });
}

/**
 * Update menu item mutation with optimistic updates
 * Requirement 4.7: Implements optimistic updates for menu item availability toggles
 * Requirement 4.8: Reverts optimistic updates and displays error messages on failure
 * Requirement 22.4: Implements optimistic updates for boolean value toggles
 * Requirement 22.5: Updates Query_Cache optimistically
 * Requirement 22.6: Reverts changes and displays error messages on failure
 */
export function useUpdateMenuItem(restaurantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      data,
    }: {
      itemId: string;
      data: UpdateMenuItemRequest;
    }) => restaurantService.updateMenuItem(restaurantId, itemId, data),
    // Optimistic update: Update cache immediately before API call
    onMutate: async ({ itemId, data }) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({
        queryKey: queryKeys.restaurants.menu(restaurantId),
      });

      // Snapshot the previous value for rollback
      const previousMenu = queryClient.getQueryData(
        queryKeys.restaurants.menu(restaurantId),
      );

      // Optimistically update the cache
      queryClient.setQueryData(
        queryKeys.restaurants.menu(restaurantId),
        (old: any) => {
          if (!old?.items) return old;

          return {
            ...old,
            items: old.items.map((item: any) =>
              item.id === itemId ? { ...item, ...data } : item,
            ),
          };
        },
      );

      // Return context with previous value for rollback
      return { previousMenu };
    },
    // On error, rollback to previous state
    onError: (error, variables, context) => {
      if (context?.previousMenu) {
        queryClient.setQueryData(
          queryKeys.restaurants.menu(restaurantId),
          context.previousMenu,
        );
      }
    },
    // Always refetch after success or error to ensure cache is in sync
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.restaurants.menu(restaurantId),
      });
    },
  });
}

/**
 * Delete menu item mutation
 */
export function useDeleteMenuItem(restaurantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) =>
      restaurantService.deleteMenuItem(restaurantId, itemId),
    onSuccess: () => {
      // Invalidate menu query to refetch without deleted item
      queryClient.invalidateQueries({
        queryKey: queryKeys.restaurants.menu(restaurantId),
      });
    },
  });
}

/**
 * Upload menu item image mutation
 * Requirement 4.5: Handles multipart/form-data encoding for image upload
 */
export function useUploadMenuItemImage(restaurantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, file }: { itemId: string; file: File }) =>
      restaurantService.uploadMenuItemImage(restaurantId, itemId, file),
    onSuccess: () => {
      // Invalidate menu query to refetch with updated image URL
      queryClient.invalidateQueries({
        queryKey: queryKeys.restaurants.menu(restaurantId),
      });
    },
  });
}

/**
 * Update operating hours mutation
 */
export function useUpdateOperatingHours(restaurantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) =>
      restaurantService.updateOperatingHours(restaurantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.restaurants.hours(restaurantId),
      });
    },
  });
}

/**
 * Create promotion mutation
 */
export function useCreatePromotion(restaurantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) =>
      restaurantService.createPromotion(restaurantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.restaurants.promotions(restaurantId),
      });
    },
  });
}

/**
 * Update promotion mutation
 */
export function useUpdatePromotion(restaurantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ promoId, data }: { promoId: string; data: any }) =>
      restaurantService.updatePromotion(restaurantId, promoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.restaurants.promotions(restaurantId),
      });
    },
  });
}

/**
 * Delete promotion mutation
 */
export function useDeletePromotion(restaurantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (promoId: string) =>
      restaurantService.deletePromotion(restaurantId, promoId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.restaurants.promotions(restaurantId),
      });
    },
  });
}

/**
 * Fetch restaurant analytics
 */
export function useRestaurantAnalytics(
  restaurantId: string,
  params?: { startDate?: string; endDate?: string },
) {
  return useQuery({
    queryKey: queryKeys.restaurants.analytics(restaurantId, params),
    queryFn: () => restaurantService.getAnalytics(restaurantId, params),
    staleTime: staleTimeConfig.analytics, // 10 minutes
    enabled: !!restaurantId,
  });
}

/**
 * Fetch order analytics
 */
export function useOrderAnalytics(
  restaurantId: string,
  params?: { startDate?: string; endDate?: string },
) {
  return useQuery({
    queryKey: queryKeys.restaurants.orderAnalytics(restaurantId, params),
    queryFn: () => restaurantService.getOrderAnalytics(restaurantId, params),
    staleTime: staleTimeConfig.analytics,
    enabled: !!restaurantId,
  });
}

/**
 * Fetch menu analytics
 */
export function useMenuAnalytics(
  restaurantId: string,
  params?: { startDate?: string; endDate?: string },
) {
  return useQuery({
    queryKey: queryKeys.restaurants.menuAnalytics(restaurantId, params),
    queryFn: () => restaurantService.getMenuAnalytics(restaurantId, params),
    staleTime: staleTimeConfig.analytics,
    enabled: !!restaurantId,
  });
}

/**
 * Prefetch restaurant data for optimized navigation
 */
export function usePrefetchRestaurant() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.restaurants.detail(id),
      queryFn: () => restaurantService.getById(id),
      staleTime: staleTimeConfig.restaurants,
    });
  };
}

/**
 * Prefetch restaurant menu data for optimized navigation
 */
export function usePrefetchRestaurantMenu() {
  const queryClient = useQueryClient();

  return (restaurantId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.restaurants.menu(restaurantId),
      queryFn: () => restaurantService.getMenu(restaurantId),
      staleTime: staleTimeConfig.menu,
    });
  };
}

/**
 * Fetch restaurant orders for kitchen dashboard
 * Used by restaurant owners to view and manage incoming orders
 */
export function useRestaurantOrders(restaurantId: string) {
  return useQuery({
    queryKey: queryKeys.restaurants.kitchenOrders(restaurantId),
    queryFn: () => restaurantService.getKitchenOrders(restaurantId),
    staleTime: staleTimeConfig.orders, // 2 minutes
    enabled: !!restaurantId,
    refetchInterval: 30000, // Refetch every 30 seconds for kitchen dashboard
  });
}
