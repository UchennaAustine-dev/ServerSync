import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
} from "../customer.hooks";
import { customerService } from "@/lib/api/services/customer.service";
import type { CustomerAddress } from "@/lib/api/types/customer.types";

// Mock the customer service
vi.mock("@/lib/api/services/customer.service");

// Mock the UI store
vi.mock("@/lib/store", () => ({
  useUIStore: () => ({
    addToast: vi.fn(),
  }),
}));

describe("Customer Hooks", () => {
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

  describe("useAddresses", () => {
    it("fetches addresses successfully", async () => {
      const mockAddresses: CustomerAddress[] = [
        {
          id: "1",
          customerId: "user1",
          label: "Home",
          street: "123 Main St",
          city: "New York",
          state: "NY",
          zipCode: "10001",
          country: "United States",
          isDefault: true,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
      ];

      vi.mocked(customerService.getAddresses).mockResolvedValue(mockAddresses);

      const { result } = renderHook(() => useAddresses(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockAddresses);
      expect(customerService.getAddresses).toHaveBeenCalledTimes(1);
    });

    it("handles fetch error", async () => {
      vi.mocked(customerService.getAddresses).mockRejectedValue(
        new Error("Failed to fetch"),
      );

      const { result } = renderHook(() => useAddresses(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe("useCreateAddress", () => {
    it("creates address successfully", async () => {
      const newAddress = {
        label: "Home",
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "United States",
        isDefault: true,
      };

      const createdAddress: CustomerAddress = {
        id: "1",
        customerId: "user1",
        ...newAddress,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      };

      vi.mocked(customerService.createAddress).mockResolvedValue(
        createdAddress,
      );

      const { result } = renderHook(() => useCreateAddress(), { wrapper });

      await result.current.mutateAsync(newAddress);

      expect(customerService.createAddress).toHaveBeenCalledWith(newAddress);
    });
  });

  describe("useUpdateAddress", () => {
    it("updates address successfully", async () => {
      const updateData = {
        label: "Updated Home",
        street: "456 New St",
      };

      const updatedAddress: CustomerAddress = {
        id: "1",
        customerId: "user1",
        label: "Updated Home",
        street: "456 New St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "United States",
        isDefault: true,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-02",
      };

      vi.mocked(customerService.updateAddress).mockResolvedValue(
        updatedAddress,
      );

      const { result } = renderHook(() => useUpdateAddress(), { wrapper });

      await result.current.mutateAsync({ id: "1", data: updateData });

      expect(customerService.updateAddress).toHaveBeenCalledWith(
        "1",
        updateData,
      );
    });
  });

  describe("useDeleteAddress", () => {
    it("deletes address successfully", async () => {
      vi.mocked(customerService.deleteAddress).mockResolvedValue();

      const { result } = renderHook(() => useDeleteAddress(), { wrapper });

      await result.current.mutateAsync("1");

      expect(customerService.deleteAddress).toHaveBeenCalledWith("1");
    });
  });
});
