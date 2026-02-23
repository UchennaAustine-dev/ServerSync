/**
 * Tests for admin React Query hooks
 */

import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  useAdminDashboard,
  useAdminRestaurants,
  useAdminDrivers,
  useUpdateRestaurantStatus,
  useUpdateDriverStatus,
} from "../admin.hooks";
import { adminService } from "../../api/services/admin.service";
import type { AdminDashboard } from "../../api/types/admin.types";

// Mock the admin service
vi.mock("../../api/services/admin.service", () => ({
  adminService: {
    getDashboard: vi.fn(),
    getRestaurants: vi.fn(),
    getDrivers: vi.fn(),
    updateRestaurantStatus: vi.fn(),
    updateDriverStatus: vi.fn(),
  },
}));

// Mock toast
vi.mock("../../utils/toast", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Admin Hooks", () => {
  let queryClient: QueryClient;

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

  describe("useAdminDashboard", () => {
    it("should fetch admin dashboard data", async () => {
      const mockDashboard: AdminDashboard = {
        totalRevenue: 100000,
        totalOrders: 500,
        activeRestaurants: 25,
        activeDrivers: 50,
        todayRevenue: 5000,
        todayOrders: 30,
        revenueTrend: [
          { date: "2024-01-01", amount: 1000 },
          { date: "2024-01-02", amount: 1500 },
        ],
        orderVolumeTrend: [
          { date: "2024-01-01", count: 10 },
          { date: "2024-01-02", count: 15 },
        ],
        topRestaurants: [
          {
            id: "1",
            name: "Test Restaurant",
            revenue: 10000,
            orderCount: 100,
          },
        ],
      };

      vi.mocked(adminService.getDashboard).mockResolvedValue(mockDashboard);

      const { result } = renderHook(() => useAdminDashboard(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockDashboard);
      expect(adminService.getDashboard).toHaveBeenCalledWith(undefined);
    });

    it("should fetch dashboard with date range params", async () => {
      const params = {
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      };

      const mockDashboard: AdminDashboard = {
        totalRevenue: 100000,
        totalOrders: 500,
        activeRestaurants: 25,
        activeDrivers: 50,
        todayRevenue: 5000,
        todayOrders: 30,
        revenueTrend: [],
        orderVolumeTrend: [],
        topRestaurants: [],
      };

      vi.mocked(adminService.getDashboard).mockResolvedValue(mockDashboard);

      const { result } = renderHook(() => useAdminDashboard(params), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(adminService.getDashboard).toHaveBeenCalledWith(params);
    });
  });

  describe("useAdminRestaurants", () => {
    it("should fetch restaurants list", async () => {
      const mockResponse = {
        data: [
          {
            id: "1",
            name: "Test Restaurant",
            status: "active" as const,
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      vi.mocked(adminService.getRestaurants).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAdminRestaurants(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
    });
  });

  describe("useAdminDrivers", () => {
    it("should fetch drivers list", async () => {
      const mockResponse = {
        data: [
          {
            id: "1",
            name: "Test Driver",
            status: "approved" as const,
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      vi.mocked(adminService.getDrivers).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAdminDrivers(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
    });
  });

  describe("useUpdateRestaurantStatus", () => {
    it("should update restaurant status", async () => {
      const mockRestaurant = {
        id: "1",
        name: "Test Restaurant",
        status: "active" as const,
      };

      vi.mocked(adminService.updateRestaurantStatus).mockResolvedValue(
        mockRestaurant as any,
      );

      const { result } = renderHook(() => useUpdateRestaurantStatus(), {
        wrapper,
      });

      result.current.mutate({
        id: "1",
        data: { status: "active" },
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(adminService.updateRestaurantStatus).toHaveBeenCalledWith("1", {
        status: "active",
      });
    });
  });

  describe("useUpdateDriverStatus", () => {
    it("should update driver status", async () => {
      const mockDriver = {
        id: "1",
        name: "Test Driver",
        status: "approved" as const,
      };

      vi.mocked(adminService.updateDriverStatus).mockResolvedValue(
        mockDriver as any,
      );

      const { result } = renderHook(() => useUpdateDriverStatus(), {
        wrapper,
      });

      result.current.mutate({
        id: "1",
        data: { status: "approved" },
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(adminService.updateDriverStatus).toHaveBeenCalledWith("1", {
        status: "approved",
      });
    });
  });
});
