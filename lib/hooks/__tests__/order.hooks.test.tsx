/**
 * Order Hooks Tests
 *
 * Tests for order-related React Query hooks
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCreateOrder, useOrders, useOrder } from "../order.hooks";
import { orderService } from "@/lib/api/services/order.service";
import { useCartStore } from "@/lib/store/cart.store";
import type { Order, CreateOrderRequest } from "@/lib/api/types/order.types";

// Mock the order service
vi.mock("@/lib/api/services/order.service");

// Mock the cart store
vi.mock("@/lib/store/cart.store");

const mockOrderService = orderService as any;
const mockUseCartStore = useCartStore as unknown as any;

describe("Order Hooks", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Reset mocks
    vi.clearAllMocks();

    // Mock cart store
    mockUseCartStore.mockReturnValue({
      clearCart: vi.fn(),
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe("useCreateOrder", () => {
    it("should create an order successfully", async () => {
      const mockOrder: Order = {
        id: "order-123",
        customerId: "customer-1",
        restaurantId: "restaurant-1",
        items: [
          {
            menuItemId: "item-1",
            name: "Test Item",
            price: 10.99,
            quantity: 2,
          },
        ],
        subtotal: 21.98,
        deliveryFee: 4.99,
        tax: 2.2,
        discount: 0,
        total: 29.17,
        status: "pending",
        paymentStatus: "pending",
        deliveryAddress: {
          street: "123 Test St",
          city: "Test City",
          state: "TS",
          zipCode: "12345",
          country: "United States",
        },
        contactPhone: "555-0123",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        statusHistory: [],
      };

      mockOrderService.create.mockResolvedValue(mockOrder);

      const { result } = renderHook(() => useCreateOrder(), { wrapper });

      const orderRequest: CreateOrderRequest = {
        restaurantId: "restaurant-1",
        items: [
          {
            menuItemId: "item-1",
            quantity: 2,
          },
        ],
        deliveryAddress: {
          street: "123 Test St",
          city: "Test City",
          state: "TS",
          zipCode: "12345",
          country: "United States",
        },
        contactPhone: "555-0123",
      };

      result.current.mutate(orderRequest);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockOrderService.create).toHaveBeenCalledWith(orderRequest);
      expect(result.current.data).toEqual(mockOrder);
    });

    it("should clear cart after successful order creation", async () => {
      const mockClearCart = vi.fn();
      mockUseCartStore.mockReturnValue({
        clearCart: mockClearCart,
      });

      const mockOrder: Order = {
        id: "order-123",
        customerId: "customer-1",
        restaurantId: "restaurant-1",
        items: [],
        subtotal: 0,
        deliveryFee: 0,
        tax: 0,
        discount: 0,
        total: 0,
        status: "pending",
        paymentStatus: "pending",
        deliveryAddress: {
          street: "123 Test St",
          city: "Test City",
          state: "TS",
          zipCode: "12345",
          country: "United States",
        },
        contactPhone: "555-0123",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        statusHistory: [],
      };

      mockOrderService.create.mockResolvedValue(mockOrder);

      const { result } = renderHook(() => useCreateOrder(), { wrapper });

      const orderRequest: CreateOrderRequest = {
        restaurantId: "restaurant-1",
        items: [],
        deliveryAddress: {
          street: "123 Test St",
          city: "Test City",
          state: "TS",
          zipCode: "12345",
          country: "United States",
        },
        contactPhone: "555-0123",
      };

      result.current.mutate(orderRequest);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockClearCart).toHaveBeenCalled();
    });

    it("should handle order creation errors", async () => {
      const mockError = new Error("Order creation failed");
      mockOrderService.create.mockRejectedValue(mockError);

      const { result } = renderHook(() => useCreateOrder(), { wrapper });

      const orderRequest: CreateOrderRequest = {
        restaurantId: "restaurant-1",
        items: [],
        deliveryAddress: {
          street: "123 Test St",
          city: "Test City",
          state: "TS",
          zipCode: "12345",
          country: "United States",
        },
        contactPhone: "555-0123",
      };

      result.current.mutate(orderRequest);

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(mockError);
    });
  });

  describe("useOrders", () => {
    it("should fetch orders list", async () => {
      const mockOrders = {
        data: [
          {
            id: "order-1",
            customerId: "customer-1",
            restaurantId: "restaurant-1",
            items: [],
            subtotal: 0,
            deliveryFee: 0,
            tax: 0,
            discount: 0,
            total: 0,
            status: "pending" as const,
            paymentStatus: "pending" as const,
            deliveryAddress: {
              street: "123 Test St",
              city: "Test City",
              state: "TS",
              zipCode: "12345",
              country: "United States",
            },
            contactPhone: "555-0123",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            statusHistory: [],
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockOrderService.list.mockResolvedValue(mockOrders);

      const { result } = renderHook(() => useOrders(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockOrderService.list).toHaveBeenCalled();
      expect(result.current.data).toEqual(mockOrders);
    });
  });

  describe("useOrder", () => {
    it("should fetch a single order", async () => {
      const mockOrder: Order = {
        id: "order-123",
        customerId: "customer-1",
        restaurantId: "restaurant-1",
        items: [],
        subtotal: 0,
        deliveryFee: 0,
        tax: 0,
        discount: 0,
        total: 0,
        status: "pending",
        paymentStatus: "pending",
        deliveryAddress: {
          street: "123 Test St",
          city: "Test City",
          state: "TS",
          zipCode: "12345",
          country: "United States",
        },
        contactPhone: "555-0123",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        statusHistory: [],
      };

      mockOrderService.getById.mockResolvedValue(mockOrder);

      const { result } = renderHook(() => useOrder("order-123"), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockOrderService.getById).toHaveBeenCalledWith("order-123");
      expect(result.current.data).toEqual(mockOrder);
    });

    it("should not fetch when disabled", () => {
      const { result } = renderHook(() => useOrder("order-123", false), {
        wrapper,
      });

      expect(result.current.isFetching).toBe(false);
      expect(mockOrderService.getById).not.toHaveBeenCalled();
    });
  });
});
