/**
 * Tests to verify React Query request deduplication
 * Validates that multiple components requesting the same data don't cause duplicate requests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { queryClient, queryKeys } from "../query-client";

describe("React Query Request Deduplication", () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it("should deduplicate simultaneous requests for the same query key", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ data: "test" });

    // Simulate multiple components requesting the same data simultaneously
    const promise1 = queryClient.fetchQuery({
      queryKey: ["test", "1"],
      queryFn: mockFetch,
    });

    const promise2 = queryClient.fetchQuery({
      queryKey: ["test", "1"],
      queryFn: mockFetch,
    });

    const promise3 = queryClient.fetchQuery({
      queryKey: ["test", "1"],
      queryFn: mockFetch,
    });

    await Promise.all([promise1, promise2, promise3]);

    // Should only call the fetch function once despite 3 requests
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should not deduplicate requests with different query keys", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ data: "test" });

    // Simulate requests with different keys
    const promise1 = queryClient.fetchQuery({
      queryKey: ["test", "1"],
      queryFn: mockFetch,
    });

    const promise2 = queryClient.fetchQuery({
      queryKey: ["test", "2"],
      queryFn: mockFetch,
    });

    await Promise.all([promise1, promise2]);

    // Should call the fetch function twice for different keys
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("should use cached data within stale time", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ data: "test" });

    // First request
    await queryClient.fetchQuery({
      queryKey: ["test", "1"],
      queryFn: mockFetch,
      staleTime: 5000, // 5 seconds
    });

    // Second request within stale time
    await queryClient.fetchQuery({
      queryKey: ["test", "1"],
      queryFn: mockFetch,
      staleTime: 5000,
    });

    // Should only call the fetch function once, second request uses cache
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should refetch after stale time expires", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ data: "test" });

    // First request
    await queryClient.fetchQuery({
      queryKey: ["test", "1"],
      queryFn: mockFetch,
      staleTime: 0, // Immediately stale
    });

    // Wait a bit to ensure stale time has passed
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Second request after stale time
    await queryClient.fetchQuery({
      queryKey: ["test", "1"],
      queryFn: mockFetch,
      staleTime: 0,
    });

    // Should call the fetch function twice
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("should have correct stale time configuration for different domains", () => {
    const defaultOptions = queryClient.getDefaultOptions();

    // Verify default stale time is set
    expect(defaultOptions.queries?.staleTime).toBe(5 * 60 * 1000); // 5 minutes
  });

  it("should have retry configuration that prevents retries on 4xx errors", () => {
    const defaultOptions = queryClient.getDefaultOptions();
    const retryFn = defaultOptions.queries?.retry as Function;

    // Should not retry on 4xx errors
    const shouldNotRetry = retryFn(1, {
      response: { status: 404 },
    });
    expect(shouldNotRetry).toBe(false);

    // Should retry on 5xx errors
    const shouldRetry = retryFn(1, {
      response: { status: 500 },
    });
    expect(shouldRetry).toBe(true);

    // Should not retry after 3 attempts
    const shouldNotRetryAfter3 = retryFn(3, {
      response: { status: 500 },
    });
    expect(shouldNotRetryAfter3).toBe(false);
  });

  it("should have hierarchical query keys for efficient cache invalidation", () => {
    // Verify query key structure
    expect(queryKeys.restaurants.all).toEqual(["restaurants"]);
    expect(queryKeys.restaurants.list()).toEqual([
      "restaurants",
      "list",
      undefined,
    ]);
    expect(queryKeys.restaurants.detail("123")).toEqual([
      "restaurants",
      "detail",
      "123",
    ]);

    // Verify orders query keys
    expect(queryKeys.orders.all).toEqual(["orders"]);
    expect(queryKeys.orders.list()).toEqual(["orders", "list", undefined]);
    expect(queryKeys.orders.detail("456")).toEqual(["orders", "detail", "456"]);
  });

  it("should support partial matching for cache invalidation", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ data: "test" });

    // Create multiple queries with related keys
    await queryClient.fetchQuery({
      queryKey: queryKeys.restaurants.list(),
      queryFn: mockFetch,
    });

    await queryClient.fetchQuery({
      queryKey: queryKeys.restaurants.detail("1"),
      queryFn: mockFetch,
    });

    await queryClient.fetchQuery({
      queryKey: queryKeys.restaurants.detail("2"),
      queryFn: mockFetch,
    });

    // Invalidate all restaurant queries
    await queryClient.invalidateQueries({
      queryKey: queryKeys.restaurants.all,
    });

    // All restaurant queries should be marked as stale
    const restaurantListState = queryClient.getQueryState(
      queryKeys.restaurants.list(),
    );
    const restaurant1State = queryClient.getQueryState(
      queryKeys.restaurants.detail("1"),
    );
    const restaurant2State = queryClient.getQueryState(
      queryKeys.restaurants.detail("2"),
    );

    expect(restaurantListState?.isInvalidated).toBe(true);
    expect(restaurant1State?.isInvalidated).toBe(true);
    expect(restaurant2State?.isInvalidated).toBe(true);
  });
});
