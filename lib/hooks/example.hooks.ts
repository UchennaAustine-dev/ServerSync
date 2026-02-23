/**
 * Example React Query Hooks
 *
 * This file demonstrates how to use the query client configuration
 * with the query key factories for consistent cache management.
 *
 * These examples show the pattern that should be followed when
 * creating hooks for other domains (auth, orders, drivers, etc.)
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, staleTimeConfig } from "@/lib/config/query-client";
import { restaurantService } from "@/lib/api/services";
import type {
  Restaurant,
  RestaurantListParams,
  UpdateRestaurantRequest,
} from "@/lib/api/types";

/**
 * Example: Fetch restaurant list with custom stale time
 * Uses query key factory for consistent cache keys
 */
export function useRestaurants(params?: RestaurantListParams) {
  return useQuery({
    queryKey: queryKeys.restaurants.list(params),
    queryFn: () => restaurantService.list(params),
    staleTime: staleTimeConfig.restaurants, // 5 minutes
  });
}

/**
 * Example: Fetch single restaurant
 * Demonstrates hierarchical query keys
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
 * Example: Fetch restaurant menu
 * Shows domain-specific query key usage
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
 * Example: Update restaurant mutation
 * Demonstrates cache invalidation after mutation (Requirement 28.8)
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

      // Optionally: Optimistically update the cache
      queryClient.setQueryData(
        queryKeys.restaurants.detail(variables.id),
        updatedRestaurant,
      );
    },
    onError: (error, variables) => {
      console.error("Failed to update restaurant:", error);
      // Error handling will be implemented in error-handler utility
    },
  });
}

/**
 * Example: Create menu item mutation
 * Shows nested domain mutation with cache invalidation
 */
export function useCreateMenuItem(restaurantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) =>
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
 * Example: Prefetch restaurant data
 * Useful for optimizing navigation and perceived performance
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
