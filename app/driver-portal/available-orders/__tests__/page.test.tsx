/**
 * Available Orders Page Tests
 *
 * Tests for the driver available orders page including:
 * - Order list display
 * - Order details (restaurant, delivery address, fee)
 * - Distance and duration estimates
 * - Accept order functionality with estimated pickup time input
 *
 * Requirements: 12.2, 12.3, 12.4, 12.5, 12.6
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AvailableOrdersPage from "../page";
import { useAuthStore } from "@/lib/store/auth.store";
import {
  useAvailableOrders,
  useAcceptOrder,
  useDriverProfile,
} from "@/lib/hooks/driver.hooks";
import { toast } from "@/lib/utils/toast";

// Mock dependencies
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/lib/store/auth.store");
vi.mock("@/lib/hooks/driver.hooks");
vi.mock("@/lib/utils/toast");

const mockUseAuthStore = vi.mocked(useAuthStore);
const mockUseAvailableOrders = vi.mocked(useAvailableOrders);
const mockUseAcceptOrder = vi.mocked(useAcceptOrder);
const mockUseDriverProfile = vi.mocked(useDriverProfile);
const mockToast = vi.mocked(toast);

describe("AvailableOrdersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default auth state
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { id: "1", name: "Test Driver", email: "driver@test.com" },
    } as any);

    // Default driver profile
    mockUseDriverProfile.mockReturnValue({
      data: {
        id: "1",
        status: "approved",
        isAvailable: true,
        name: "Test Driver",
      },
      isLoading: false,
      error: null,
    } as any);

    // Default accept order mutation
    mockUseAcceptOrder.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);
  });

  describe("Order List Display - Requirement 12.2", () => {
    it("should display available orders with restaurant information", async () => {
      mockUseAvailableOrders.mockReturnValue({
        data: {
          data: [
            {
              id: "order-1",
              status: "ready",
              restaurant: {
                id: "rest-1",
                name: "Test Restaurant",
                address: "123 Main St",
                phone: "555-0100",
              },
              pickupLocation: {
                street: "123 Main St",
                city: "Test City",
                state: "TS",
                zipCode: "12345",
              },
              deliveryLocation: {
                street: "456 Oak Ave",
                city: "Test City",
                state: "TS",
                zipCode: "12345",
              },
              deliveryFee: 5.99,
              estimatedDistance: 3.5,
              estimatedDuration: 15,
              total: 45.99,
              items: [
                { name: "Burger", quantity: 2 },
                { name: "Fries", quantity: 1 },
              ],
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
        },
        isLoading: false,
        error: null,
      } as any);

      render(<AvailableOrdersPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Restaurant")).toBeInTheDocument();
        expect(screen.getByText("123 Main St")).toBeInTheDocument();
        const cityStateZip = screen.getAllByText(/Test City, TS 12345/);
        expect(cityStateZip.length).toBeGreaterThan(0);
        expect(screen.getByText("📞 555-0100")).toBeInTheDocument();
      });
    });

    it("should display delivery address", async () => {
      mockUseAvailableOrders.mockReturnValue({
        data: {
          data: [
            {
              id: "order-1",
              status: "ready",
              restaurant: {
                id: "rest-1",
                name: "Test Restaurant",
                address: "123 Main St",
              },
              pickupLocation: {
                street: "123 Main St",
                city: "Test City",
                state: "TS",
                zipCode: "12345",
              },
              deliveryLocation: {
                street: "456 Oak Ave",
                city: "Test City",
                state: "TS",
                zipCode: "12345",
              },
              deliveryFee: 5.99,
              estimatedDistance: 3.5,
              estimatedDuration: 15,
              total: 45.99,
              items: [],
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
        },
        isLoading: false,
        error: null,
      } as any);

      render(<AvailableOrdersPage />);

      await waitFor(() => {
        expect(screen.getByText("Delivery Address")).toBeInTheDocument();
        expect(screen.getByText("456 Oak Ave")).toBeInTheDocument();
      });
    });

    it("should display delivery fee", async () => {
      mockUseAvailableOrders.mockReturnValue({
        data: {
          data: [
            {
              id: "order-1",
              status: "ready",
              restaurant: {
                id: "rest-1",
                name: "Test Restaurant",
              },
              pickupLocation: {
                street: "123 Main St",
                city: "Test City",
                state: "TS",
                zipCode: "12345",
              },
              deliveryLocation: {
                street: "456 Oak Ave",
                city: "Test City",
                state: "TS",
                zipCode: "12345",
              },
              deliveryFee: 5.99,
              estimatedDistance: 3.5,
              estimatedDuration: 15,
              total: 45.99,
              items: [],
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
        },
        isLoading: false,
        error: null,
      } as any);

      render(<AvailableOrdersPage />);

      await waitFor(() => {
        expect(screen.getByText("$5.99")).toBeInTheDocument();
        expect(screen.getByText("Delivery fee")).toBeInTheDocument();
      });
    });
  });

  describe("Distance and Duration Estimates - Requirement 12.4", () => {
    it("should display distance estimate", async () => {
      mockUseAvailableOrders.mockReturnValue({
        data: {
          data: [
            {
              id: "order-1",
              status: "ready",
              restaurant: {
                id: "rest-1",
                name: "Test Restaurant",
              },
              pickupLocation: {
                street: "123 Main St",
                city: "Test City",
                state: "TS",
                zipCode: "12345",
              },
              deliveryLocation: {
                street: "456 Oak Ave",
                city: "Test City",
                state: "TS",
                zipCode: "12345",
              },
              deliveryFee: 5.99,
              estimatedDistance: 3.5,
              estimatedDuration: 15,
              total: 45.99,
              items: [],
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
        },
        isLoading: false,
        error: null,
      } as any);

      render(<AvailableOrdersPage />);

      await waitFor(() => {
        expect(screen.getByText("3.5 mi")).toBeInTheDocument();
        expect(screen.getByText("Distance")).toBeInTheDocument();
      });
    });

    it("should display duration estimate", async () => {
      mockUseAvailableOrders.mockReturnValue({
        data: {
          data: [
            {
              id: "order-1",
              status: "ready",
              restaurant: {
                id: "rest-1",
                name: "Test Restaurant",
              },
              pickupLocation: {
                street: "123 Main St",
                city: "Test City",
                state: "TS",
                zipCode: "12345",
              },
              deliveryLocation: {
                street: "456 Oak Ave",
                city: "Test City",
                state: "TS",
                zipCode: "12345",
              },
              deliveryFee: 5.99,
              estimatedDistance: 3.5,
              estimatedDuration: 15,
              total: 45.99,
              items: [],
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
        },
        isLoading: false,
        error: null,
      } as any);

      render(<AvailableOrdersPage />);

      await waitFor(() => {
        expect(screen.getByText("15 min")).toBeInTheDocument();
        expect(screen.getByText("Est. Duration")).toBeInTheDocument();
      });
    });
  });

  describe("Accept Order Functionality - Requirement 12.3", () => {
    it("should open dialog when accept button is clicked", async () => {
      const mutateAsync = vi.fn().mockResolvedValue({});
      mockUseAcceptOrder.mockReturnValue({
        mutateAsync,
        isPending: false,
      } as any);

      mockUseAvailableOrders.mockReturnValue({
        data: {
          data: [
            {
              id: "order-1",
              status: "ready",
              restaurant: {
                id: "rest-1",
                name: "Test Restaurant",
              },
              pickupLocation: {
                street: "123 Main St",
                city: "Test City",
                state: "TS",
                zipCode: "12345",
              },
              deliveryLocation: {
                street: "456 Oak Ave",
                city: "Test City",
                state: "TS",
                zipCode: "12345",
              },
              deliveryFee: 5.99,
              estimatedDistance: 3.5,
              estimatedDuration: 15,
              total: 45.99,
              items: [],
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
        },
        isLoading: false,
        error: null,
      } as any);

      render(<AvailableOrdersPage />);

      const acceptButton = await screen.findByRole("button", {
        name: /accept order/i,
      });
      await userEvent.click(acceptButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Enter your estimated pickup time/),
        ).toBeInTheDocument();
        expect(
          screen.getByLabelText(/Estimated Pickup Time/i),
        ).toBeInTheDocument();
      });
    });

    it("should call accept order mutation with custom pickup time when confirmed", async () => {
      const mutateAsync = vi.fn().mockResolvedValue({});
      mockUseAcceptOrder.mockReturnValue({
        mutateAsync,
        isPending: false,
      } as any);

      mockUseAvailableOrders.mockReturnValue({
        data: {
          data: [
            {
              id: "order-1",
              status: "ready",
              restaurant: {
                id: "rest-1",
                name: "Test Restaurant",
              },
              pickupLocation: {
                street: "123 Main St",
                city: "Test City",
                state: "TS",
                zipCode: "12345",
              },
              deliveryLocation: {
                street: "456 Oak Ave",
                city: "Test City",
                state: "TS",
                zipCode: "12345",
              },
              deliveryFee: 5.99,
              estimatedDistance: 3.5,
              estimatedDuration: 15,
              total: 45.99,
              items: [],
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
        },
        isLoading: false,
        error: null,
      } as any);

      render(<AvailableOrdersPage />);

      // Click accept button to open dialog
      const acceptButton = await screen.findByRole("button", {
        name: /accept order/i,
      });
      await userEvent.click(acceptButton);

      // Change pickup time
      const pickupTimeInput = await screen.findByLabelText(
        /Estimated Pickup Time/i,
      );
      await userEvent.clear(pickupTimeInput);
      await userEvent.type(pickupTimeInput, "20");

      // Confirm acceptance
      const confirmButton = await screen.findByRole("button", {
        name: /confirm accept/i,
      });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(mutateAsync).toHaveBeenCalledWith({
          orderId: "order-1",
          data: expect.objectContaining({
            estimatedPickupTime: expect.any(String),
          }),
        });
      });
    });

    it("should show success toast when order is accepted", async () => {
      const mutateAsync = vi.fn().mockResolvedValue({});
      mockUseAcceptOrder.mockReturnValue({
        mutateAsync,
        isPending: false,
      } as any);

      mockUseAvailableOrders.mockReturnValue({
        data: {
          data: [
            {
              id: "order-1",
              status: "ready",
              restaurant: {
                id: "rest-1",
                name: "Test Restaurant",
              },
              pickupLocation: {
                street: "123 Main St",
                city: "Test City",
                state: "TS",
                zipCode: "12345",
              },
              deliveryLocation: {
                street: "456 Oak Ave",
                city: "Test City",
                state: "TS",
                zipCode: "12345",
              },
              deliveryFee: 5.99,
              estimatedDistance: 3.5,
              estimatedDuration: 15,
              total: 45.99,
              items: [],
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
        },
        isLoading: false,
        error: null,
      } as any);

      render(<AvailableOrdersPage />);

      // Click accept button to open dialog
      const acceptButton = await screen.findByRole("button", {
        name: /accept order/i,
      });
      await userEvent.click(acceptButton);

      // Confirm acceptance
      const confirmButton = await screen.findByRole("button", {
        name: /confirm accept/i,
      });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          expect.stringContaining("Order accepted"),
        );
      });
    });

    it("should show error toast when order acceptance fails", async () => {
      const mutateAsync = vi.fn().mockRejectedValue(new Error("Failed"));
      mockUseAcceptOrder.mockReturnValue({
        mutateAsync,
        isPending: false,
      } as any);

      mockUseAvailableOrders.mockReturnValue({
        data: {
          data: [
            {
              id: "order-1",
              status: "ready",
              restaurant: {
                id: "rest-1",
                name: "Test Restaurant",
              },
              pickupLocation: {
                street: "123 Main St",
                city: "Test City",
                state: "TS",
                zipCode: "12345",
              },
              deliveryLocation: {
                street: "456 Oak Ave",
                city: "Test City",
                state: "TS",
                zipCode: "12345",
              },
              deliveryFee: 5.99,
              estimatedDistance: 3.5,
              estimatedDuration: 15,
              total: 45.99,
              items: [],
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
        },
        isLoading: false,
        error: null,
      } as any);

      render(<AvailableOrdersPage />);

      // Click accept button to open dialog
      const acceptButton = await screen.findByRole("button", {
        name: /accept order/i,
      });
      await userEvent.click(acceptButton);

      // Confirm acceptance
      const confirmButton = await screen.findByRole("button", {
        name: /confirm accept/i,
      });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          expect.stringContaining("Failed to accept order"),
        );
      });
    });

    it("should show specific error when order is already accepted by another driver", async () => {
      const mutateAsync = vi
        .fn()
        .mockRejectedValue({ response: { status: 409 } });
      mockUseAcceptOrder.mockReturnValue({
        mutateAsync,
        isPending: false,
      } as any);

      mockUseAvailableOrders.mockReturnValue({
        data: {
          data: [
            {
              id: "order-1",
              status: "ready",
              restaurant: {
                id: "rest-1",
                name: "Test Restaurant",
              },
              pickupLocation: {
                street: "123 Main St",
                city: "Test City",
                state: "TS",
                zipCode: "12345",
              },
              deliveryLocation: {
                street: "456 Oak Ave",
                city: "Test City",
                state: "TS",
                zipCode: "12345",
              },
              deliveryFee: 5.99,
              estimatedDistance: 3.5,
              estimatedDuration: 15,
              total: 45.99,
              items: [],
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
        },
        isLoading: false,
        error: null,
      } as any);

      render(<AvailableOrdersPage />);

      // Click accept button to open dialog
      const acceptButton = await screen.findByRole("button", {
        name: /accept order/i,
      });
      await userEvent.click(acceptButton);

      // Confirm acceptance
      const confirmButton = await screen.findByRole("button", {
        name: /confirm accept/i,
      });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          expect.stringContaining("accepted by another driver"),
        );
      });
    });

    it("should validate pickup time is within valid range", async () => {
      const mutateAsync = vi.fn().mockResolvedValue({});
      mockUseAcceptOrder.mockReturnValue({
        mutateAsync,
        isPending: false,
      } as any);

      mockUseAvailableOrders.mockReturnValue({
        data: {
          data: [
            {
              id: "order-1",
              status: "ready",
              restaurant: {
                id: "rest-1",
                name: "Test Restaurant",
              },
              pickupLocation: {
                street: "123 Main St",
                city: "Test City",
                state: "TS",
                zipCode: "12345",
              },
              deliveryLocation: {
                street: "456 Oak Ave",
                city: "Test City",
                state: "TS",
                zipCode: "12345",
              },
              deliveryFee: 5.99,
              estimatedDistance: 3.5,
              estimatedDuration: 15,
              total: 45.99,
              items: [],
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
        },
        isLoading: false,
        error: null,
      } as any);

      render(<AvailableOrdersPage />);

      // Click accept button to open dialog
      const acceptButton = await screen.findByRole("button", {
        name: /accept order/i,
      });
      await userEvent.click(acceptButton);

      // Enter invalid pickup time
      const pickupTimeInput = await screen.findByLabelText(
        /Estimated Pickup Time/i,
      );
      await userEvent.clear(pickupTimeInput);
      await userEvent.type(pickupTimeInput, "150");

      // Confirm acceptance
      const confirmButton = await screen.findByRole("button", {
        name: /confirm accept/i,
      });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          expect.stringContaining("valid pickup time"),
        );
      });

      // Should not call mutateAsync
      expect(mutateAsync).not.toHaveBeenCalled();
    });

    it("should close dialog when cancel button is clicked", async () => {
      const mutateAsync = vi.fn().mockResolvedValue({});
      mockUseAcceptOrder.mockReturnValue({
        mutateAsync,
        isPending: false,
      } as any);

      mockUseAvailableOrders.mockReturnValue({
        data: {
          data: [
            {
              id: "order-1",
              status: "ready",
              restaurant: {
                id: "rest-1",
                name: "Test Restaurant",
              },
              pickupLocation: {
                street: "123 Main St",
                city: "Test City",
                state: "TS",
                zipCode: "12345",
              },
              deliveryLocation: {
                street: "456 Oak Ave",
                city: "Test City",
                state: "TS",
                zipCode: "12345",
              },
              deliveryFee: 5.99,
              estimatedDistance: 3.5,
              estimatedDuration: 15,
              total: 45.99,
              items: [],
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
        },
        isLoading: false,
        error: null,
      } as any);

      render(<AvailableOrdersPage />);

      // Click accept button to open dialog
      const acceptButton = await screen.findByRole("button", {
        name: /accept order/i,
      });
      await userEvent.click(acceptButton);

      // Wait for dialog to open
      await waitFor(() => {
        expect(
          screen.getByText(/Enter your estimated pickup time/),
        ).toBeInTheDocument();
      });

      // Click cancel button
      const cancelButton = await screen.findByRole("button", {
        name: /cancel/i,
      });
      await userEvent.click(cancelButton);

      // Dialog should be closed - check for dialog content
      await waitFor(() => {
        expect(
          screen.queryByText(/Enter your estimated pickup time/),
        ).not.toBeInTheDocument();
      });

      // Should not call mutateAsync
      expect(mutateAsync).not.toHaveBeenCalled();
    });
  });

  describe("Empty State", () => {
    it("should show empty state when no orders are available", async () => {
      mockUseAvailableOrders.mockReturnValue({
        data: {
          data: [],
          total: 0,
          page: 1,
          limit: 10,
        },
        isLoading: false,
        error: null,
      } as any);

      render(<AvailableOrdersPage />);

      await waitFor(() => {
        expect(screen.getByText("No Available Orders")).toBeInTheDocument();
        expect(
          screen.getByText(/There are currently no orders available/),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Loading State", () => {
    it("should show loading skeleton when orders are loading", () => {
      mockUseAvailableOrders.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      render(<AvailableOrdersPage />);

      expect(screen.getByText("Available Orders")).toBeInTheDocument();
    });
  });

  describe("Error State", () => {
    it("should show error message when orders fail to load", async () => {
      mockUseAvailableOrders.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error("Failed to load"),
      } as any);

      render(<AvailableOrdersPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/Failed to load available orders/),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Driver Status Checks", () => {
    it("should show warning when driver is not approved", async () => {
      mockUseDriverProfile.mockReturnValue({
        data: {
          id: "1",
          status: "pending",
          isAvailable: false,
          name: "Test Driver",
        },
        isLoading: false,
        error: null,
      } as any);

      render(<AvailableOrdersPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/Your driver account must be approved/),
        ).toBeInTheDocument();
      });
    });

    it("should show warning when driver is not available", async () => {
      mockUseDriverProfile.mockReturnValue({
        data: {
          id: "1",
          status: "approved",
          isAvailable: false,
          name: "Test Driver",
        },
        isLoading: false,
        error: null,
      } as any);

      render(<AvailableOrdersPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/You must be available to view orders/),
        ).toBeInTheDocument();
      });
    });
  });
});
