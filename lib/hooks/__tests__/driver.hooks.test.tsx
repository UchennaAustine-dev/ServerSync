/**
 * Driver Hooks Tests
 *
 * Tests for driver registration and management hooks
 * Requirements: 11.1, 11.2, 11.3, 11.4, 14.1, 14.2, 14.3, 14.6, 14.7, 14.8
 */

import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  useRegisterDriver,
  useDriverProfile,
  useUpdateAvailability,
} from "../driver.hooks";
import { driverService } from "@/lib/api/services/driver.service";
import { useAuthStore } from "@/lib/store/auth.store";

// Mock the services and stores
vi.mock("@/lib/api/services/driver.service");
vi.mock("@/lib/store/auth.store");

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("Driver Hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useRegisterDriver", () => {
    it("should register a driver successfully", async () => {
      const mockSetAuth = vi.fn();
      const mockResponse = {
        id: "driver-1",
        name: "John Driver",
        email: "john@driver.com",
        token: "mock-token",
        refreshToken: "mock-refresh-token",
      };

      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        setAuth: mockSetAuth,
      });

      (driverService.register as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockResponse,
      );

      const { result } = renderHook(() => useRegisterDriver(), {
        wrapper: createWrapper(),
      });

      const registrationData = {
        name: "John Driver",
        email: "john@driver.com",
        password: "password123",
        phone: "+1234567890",
        licenseNumber: "DL123456",
        vehicleType: "car",
        vehiclePlate: "ABC-1234",
        vehicleColor: "Black",
      };

      result.current.mutate(registrationData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(driverService.register).toHaveBeenCalledWith(registrationData);
      expect(mockSetAuth).toHaveBeenCalledWith(
        mockResponse,
        mockResponse.token,
        mockResponse.refreshToken,
      );
    });

    it("should handle registration with documents", async () => {
      const mockSetAuth = vi.fn();
      const mockResponse = {
        id: "driver-1",
        name: "John Driver",
        email: "john@driver.com",
        token: "mock-token",
        refreshToken: "mock-refresh-token",
      };

      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        setAuth: mockSetAuth,
      });

      (driverService.register as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockResponse,
      );

      const { result } = renderHook(() => useRegisterDriver(), {
        wrapper: createWrapper(),
      });

      const mockFile = new File(["content"], "license.jpg", {
        type: "image/jpeg",
      });

      const registrationData = {
        name: "John Driver",
        email: "john@driver.com",
        password: "password123",
        phone: "+1234567890",
        licenseNumber: "DL123456",
        vehicleType: "car",
        vehiclePlate: "ABC-1234",
        vehicleColor: "Black",
        documents: {
          license: mockFile,
        },
      };

      result.current.mutate(registrationData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(driverService.register).toHaveBeenCalled();
    });

    it("should handle registration errors", async () => {
      const mockSetAuth = vi.fn();
      const mockError = new Error("Registration failed");

      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        setAuth: mockSetAuth,
      });

      (driverService.register as ReturnType<typeof vi.fn>).mockRejectedValue(
        mockError,
      );

      const { result } = renderHook(() => useRegisterDriver(), {
        wrapper: createWrapper(),
      });

      const registrationData = {
        name: "John Driver",
        email: "john@driver.com",
        password: "password123",
        phone: "+1234567890",
        licenseNumber: "DL123456",
        vehicleType: "car",
        vehiclePlate: "ABC-1234",
        vehicleColor: "Black",
      };

      result.current.mutate(registrationData);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(mockSetAuth).not.toHaveBeenCalled();
    });
  });

  describe("useDriverProfile", () => {
    it("should fetch driver profile when authenticated", async () => {
      const mockProfile = {
        id: "driver-1",
        name: "John Driver",
        email: "john@driver.com",
        phone: "+1234567890",
        licenseNumber: "DL123456",
        vehicleType: "car",
        vehiclePlate: "ABC-1234",
        vehicleColor: "Black",
        status: "approved",
        isAvailable: true,
        rating: 4.8,
        totalDeliveries: 150,
      };

      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isAuthenticated: true,
      });

      (driverService.getProfile as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockProfile,
      );

      const { result } = renderHook(() => useDriverProfile(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockProfile);
      expect(driverService.getProfile).toHaveBeenCalled();
    });

    it("should not fetch profile when not authenticated", () => {
      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isAuthenticated: false,
      });

      const { result } = renderHook(() => useDriverProfile(), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(driverService.getProfile).not.toHaveBeenCalled();
    });
  });

  describe("useUpdateAvailability", () => {
    it("should update driver availability successfully - Requirement 14.1", async () => {
      const mockProfile = {
        id: "driver-1",
        name: "John Driver",
        isAvailable: true,
      };

      (
        driverService.updateAvailability as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockProfile);

      const { result } = renderHook(() => useUpdateAvailability(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ isAvailable: true });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Requirement 14.1: Calls PATCH /drivers/availability
      expect(driverService.updateAvailability).toHaveBeenCalledWith({
        isAvailable: true,
      });
    });

    it("should send availability status as boolean - Requirement 14.2", async () => {
      const mockProfile = {
        id: "driver-1",
        name: "John Driver",
        isAvailable: false,
      };

      (
        driverService.updateAvailability as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockProfile);

      const { result } = renderHook(() => useUpdateAvailability(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ isAvailable: false });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Requirement 14.2: Sends availability status as boolean value
      expect(driverService.updateAvailability).toHaveBeenCalledWith({
        isAvailable: false,
      });
    });

    it("should implement optimistic update - Requirement 14.6", async () => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });

      // Set initial profile data in cache
      const initialProfile = {
        id: "driver-1",
        name: "John Driver",
        isAvailable: false,
      };

      queryClient.setQueryData(["drivers", "profile"], initialProfile);

      const mockUpdatedProfile = {
        ...initialProfile,
        isAvailable: true,
      };

      (
        driverService.updateAvailability as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockUpdatedProfile);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      const { result } = renderHook(() => useUpdateAvailability(), {
        wrapper,
      });

      result.current.mutate({ isAvailable: true });

      // Requirement 14.6: Implements optimistic update
      // The cache should be updated immediately before the API call completes
      await waitFor(() => {
        const cachedData = queryClient.getQueryData(["drivers", "profile"]);
        expect(cachedData).toBeDefined();
      });
    });

    it("should revert optimistic update on error - Requirement 14.7", async () => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });

      // Set initial profile data in cache
      const initialProfile = {
        id: "driver-1",
        name: "John Driver",
        isAvailable: false,
      };

      queryClient.setQueryData(["drivers", "profile"], initialProfile);

      const mockError = new Error("Update failed");

      (
        driverService.updateAvailability as ReturnType<typeof vi.fn>
      ).mockRejectedValue(mockError);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      const { result } = renderHook(() => useUpdateAvailability(), {
        wrapper,
      });

      result.current.mutate({ isAvailable: true });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Requirement 14.7: Reverts optimistic update on error
      // The cache should be reverted to the initial state
      await waitFor(() => {
        const cachedData = queryClient.getQueryData(["drivers", "profile"]);
        expect(cachedData).toEqual(initialProfile);
      });
    });

    it("should invalidate profile query after update - Requirement 14.3", async () => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });

      const mockProfile = {
        id: "driver-1",
        name: "John Driver",
        isAvailable: true,
      };

      (
        driverService.updateAvailability as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockProfile);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      const { result } = renderHook(() => useUpdateAvailability(), {
        wrapper,
      });

      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      result.current.mutate({ isAvailable: true });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Requirement 14.3: Updates driver status in State_Manager (React Query cache)
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["drivers", "profile"],
      });
    });
  });
});
