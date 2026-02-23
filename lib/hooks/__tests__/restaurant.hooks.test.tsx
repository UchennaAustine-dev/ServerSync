/**
 * Restaurant Hooks Tests
 *
 * Tests for restaurant-related React Query hooks with focus on optimistic updates
 * Validates Requirements 4.7, 4.8, 22.4, 22.5, 22.6
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUpdateMenuItem, useRestaurantMenu } from "../restaurant.hooks";
import { restaurantService } from "@/lib/api/services/restaurant.service";
import type {
  MenuItem,
  MenuItemListResponse,
} from "@/lib/api/types/restaurant.types";

// Mock the restaurant service
vi.mock("@/lib/api/services/restaurant.service");

const mockRestaurantService = restaurantService as any;

describe("Restaurant Hooks - Optimistic Updates", () => {
  let queryClient: QueryClient;
  const restaurantId = "restaurant-123";

  const mockMenuItem: MenuItem = {
    id: "item-1",
    restaurantId,
    name: "Test Item",
    description: "Test Description",
    price: 10.99,
    category: "Main",
    isAvailable: true,
    preparationTime: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockMenuData: MenuItemListResponse = {
    items: [mockMenuItem],
    categories: ["Main"],
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe("useUpdateMenuItem - Optimistic Updates", () => {
    it("should optimistically update menu item availability", async () => {
      // Pre-populate the cache with menu data
      queryClient.setQueryData(
        ["restaurants", "menu", restaurantId],
        mockMenuData,
      );

      mockRestaurantService.updateMenuItem.mockResolvedValue({
        ...mockMenuItem,
        isAvailable: false,
      });

      const { result } = renderHook(() => useUpdateMenuItem(restaurantId), {
        wrapper,
      });

      // Get initial cache state
      const initialCache = queryClient.getQueryData([
        "restaurants",
        "menu",
        restaurantId,
      ]) as MenuItemListResponse;
      expect(initialCache.items[0].isAvailable).toBe(true);

      // Trigger the mutation
      result.current.mutate({
        itemId: "item-1",
        data: { isAvailable: false },
      });

      // Wait for the optimistic update to be applied
      await waitFor(() => {
        const optimisticCache = queryClient.getQueryData([
          "restaurants",
          "menu",
          restaurantId,
        ]) as MenuItemListResponse;
        return optimisticCache.items[0].isAvailable === false;
      });

      // Wait for mutation to complete
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockRestaurantService.updateMenuItem).toHaveBeenCalledWith(
        restaurantId,
        "item-1",
        { isAvailable: false },
      );
    });

    it("should rollback optimistic update on error", async () => {
      // Pre-populate the cache with menu data
      queryClient.setQueryData(
        ["restaurants", "menu", restaurantId],
        mockMenuData,
      );

      const mockError = new Error("Update failed");
      mockRestaurantService.updateMenuItem.mockRejectedValue(mockError);

      const { result } = renderHook(() => useUpdateMenuItem(restaurantId), {
        wrapper,
      });

      // Get initial cache state
      const initialCache = queryClient.getQueryData([
        "restaurants",
        "menu",
        restaurantId,
      ]) as MenuItemListResponse;
      expect(initialCache.items[0].isAvailable).toBe(true);

      // Trigger the mutation
      result.current.mutate({
        itemId: "item-1",
        data: { isAvailable: false },
      });

      // Wait for the optimistic update to be applied
      await waitFor(() => {
        const optimisticCache = queryClient.getQueryData([
          "restaurants",
          "menu",
          restaurantId,
        ]) as MenuItemListResponse;
        return optimisticCache.items[0].isAvailable === false;
      });

      // Wait for mutation to fail
      await waitFor(() => expect(result.current.isError).toBe(true));

      // Check that cache is rolled back to original state
      const rolledBackCache = queryClient.getQueryData([
        "restaurants",
        "menu",
        restaurantId,
      ]) as MenuItemListResponse;
      expect(rolledBackCache.items[0].isAvailable).toBe(true);
      expect(result.current.error).toEqual(mockError);
    });

    it("should handle multiple item updates optimistically", async () => {
      const multiItemMenu: MenuItemListResponse = {
        items: [
          { ...mockMenuItem, id: "item-1", isAvailable: true },
          { ...mockMenuItem, id: "item-2", isAvailable: true },
          { ...mockMenuItem, id: "item-3", isAvailable: false },
        ],
        categories: ["Main"],
      };

      queryClient.setQueryData(
        ["restaurants", "menu", restaurantId],
        multiItemMenu,
      );

      mockRestaurantService.updateMenuItem.mockResolvedValue({
        ...mockMenuItem,
        id: "item-2",
        isAvailable: false,
      });

      const { result } = renderHook(() => useUpdateMenuItem(restaurantId), {
        wrapper,
      });

      // Update item-2
      result.current.mutate({
        itemId: "item-2",
        data: { isAvailable: false },
      });

      // Wait for optimistic update and check only item-2 is affected
      await waitFor(() => {
        const optimisticCache = queryClient.getQueryData([
          "restaurants",
          "menu",
          restaurantId,
        ]) as MenuItemListResponse;
        return optimisticCache.items[1].isAvailable === false;
      });

      const optimisticCache = queryClient.getQueryData([
        "restaurants",
        "menu",
        restaurantId,
      ]) as MenuItemListResponse;
      expect(optimisticCache.items[0].isAvailable).toBe(true); // item-1 unchanged
      expect(optimisticCache.items[1].isAvailable).toBe(false); // item-2 updated
      expect(optimisticCache.items[2].isAvailable).toBe(false); // item-3 unchanged

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });

    it("should update other fields optimistically", async () => {
      queryClient.setQueryData(
        ["restaurants", "menu", restaurantId],
        mockMenuData,
      );

      const updatedData = {
        name: "Updated Item Name",
        price: 15.99,
      };

      mockRestaurantService.updateMenuItem.mockResolvedValue({
        ...mockMenuItem,
        ...updatedData,
      });

      const { result } = renderHook(() => useUpdateMenuItem(restaurantId), {
        wrapper,
      });

      result.current.mutate({
        itemId: "item-1",
        data: updatedData,
      });

      // Wait for optimistic update
      await waitFor(() => {
        const optimisticCache = queryClient.getQueryData([
          "restaurants",
          "menu",
          restaurantId,
        ]) as MenuItemListResponse;
        return optimisticCache.items[0].name === "Updated Item Name";
      });

      const optimisticCache = queryClient.getQueryData([
        "restaurants",
        "menu",
        restaurantId,
      ]) as MenuItemListResponse;
      expect(optimisticCache.items[0].name).toBe("Updated Item Name");
      expect(optimisticCache.items[0].price).toBe(15.99);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });

    it("should invalidate cache after successful update", async () => {
      queryClient.setQueryData(
        ["restaurants", "menu", restaurantId],
        mockMenuData,
      );

      mockRestaurantService.updateMenuItem.mockResolvedValue({
        ...mockMenuItem,
        isAvailable: false,
      });

      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useUpdateMenuItem(restaurantId), {
        wrapper,
      });

      result.current.mutate({
        itemId: "item-1",
        data: { isAvailable: false },
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["restaurants", "menu", restaurantId],
      });
    });

    it("should invalidate cache after failed update", async () => {
      queryClient.setQueryData(
        ["restaurants", "menu", restaurantId],
        mockMenuData,
      );

      mockRestaurantService.updateMenuItem.mockRejectedValue(
        new Error("Update failed"),
      );

      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useUpdateMenuItem(restaurantId), {
        wrapper,
      });

      result.current.mutate({
        itemId: "item-1",
        data: { isAvailable: false },
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["restaurants", "menu", restaurantId],
      });
    });
  });
});
