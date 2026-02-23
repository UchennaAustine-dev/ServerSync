/**
 * Active Orders Page Tests
 *
 * Tests for the driver active orders page including:
 * - Order list display with restaurant and customer information
 * - Order items summary
 * - Current delivery status
 * - Status update controls
 * - Navigation to pickup/delivery locations
 *
 * Requirements: 12.7, 12.8
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ActiveOrdersPage from "../page";
import { useAuthStore } from "@/lib/store/auth.store";
import {
  useActiveOrders,
  useUpdateDeliveryStatus,
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
const mockUseActiveOrders = vi.mocked(useActiveOrders);
const mockUseUpdateDeliveryStatus = vi.mocked(useUpdateDeliveryStatus);
const mockUseDriverProfile = vi.mocked(useDriverProfile);
const mockToast = vi.mocked(toast);

describe("ActiveOrdersPage", () => {
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

    // Default update status mutation
    mockUseUpdateDeliveryStatus.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);
  });

  it("redirects to login if not authenticated", () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
    } as any);
    mockUseActiveOrders.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    } as any);

    render(<ActiveOrdersPage />);

    // Component returns null when not authenticated
    expect(screen.queryByText("Active Deliveries")).not.toBeInTheDocument();
  });

  it("shows approval required message for unapproved drivers", () => {
    mockUseDriverProfile.mockReturnValue({
      data: { id: "1", status: "pending", name: "Test Driver" },
      isLoading: false,
      error: null,
    } as any);
    mockUseActiveOrders.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    } as any);

    render(<ActiveOrdersPage />);

    expect(
      screen.getByText(/Your driver account must be approved/i),
    ).toBeInTheDocument();
  });

  it("displays loading state", () => {
    mockUseActiveOrders.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    render(<ActiveOrdersPage />);

    expect(screen.getByText("Active Deliveries")).toBeInTheDocument();
  });

  it("displays error state", () => {
    mockUseActiveOrders.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error("Failed to fetch"),
    } as any);

    render(<ActiveOrdersPage />);

    expect(
      screen.getByText(/Failed to load active orders/i),
    ).toBeInTheDocument();
  });

  it("displays empty state when no active orders", () => {
    mockUseActiveOrders.mockReturnValue({
      data: { data: [], total: 0, page: 1, limit: 10 },
      isLoading: false,
      error: null,
    } as any);

    render(<ActiveOrdersPage />);

    expect(screen.getByText("No Active Deliveries")).toBeInTheDocument();
    expect(
      screen.getByText(/You don't have any active deliveries/i),
    ).toBeInTheDocument();
  });

  it("displays active orders correctly", () => {
    mockUseActiveOrders.mockReturnValue({
      data: {
        data: [
          {
            id: "order-123",
            status: "ready",
            restaurant: {
              id: "restaurant-1",
              name: "Test Restaurant",
              phone: "555-5678",
            },
            pickupLocation: {
              street: "456 Oak Ave",
              city: "Springfield",
              state: "IL",
              zipCode: "62701",
            },
            deliveryLocation: {
              street: "123 Main St",
              city: "Springfield",
              state: "IL",
              zipCode: "62701",
            },
            items: [
              { name: "Burger", quantity: 2 },
              { name: "Fries", quantity: 1 },
            ],
            deliveryFee: 5.99,
            total: 39.44,
            estimatedDistance: 3.5,
            estimatedDuration: 15,
            contactPhone: "555-1234",
            specialInstructions: "Ring doorbell twice",
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      },
      isLoading: false,
      error: null,
    } as any);

    render(<ActiveOrdersPage />);

    expect(screen.getByText(/Order #order-12/i)).toBeInTheDocument();
    expect(screen.getByText("Test Restaurant")).toBeInTheDocument();
    expect(screen.getByText("456 Oak Ave")).toBeInTheDocument();
    expect(screen.getByText("123 Main St")).toBeInTheDocument();
    expect(screen.getByText("2x Burger")).toBeInTheDocument();
    expect(screen.getByText("1x Fries")).toBeInTheDocument();
    expect(screen.getByText("$5.99")).toBeInTheDocument();
    expect(screen.getByText("$39.44")).toBeInTheDocument();
    expect(screen.getByText("Ring doorbell twice")).toBeInTheDocument();
  });

  it("shows correct status badge", () => {
    mockUseActiveOrders.mockReturnValue({
      data: {
        data: [
          {
            id: "order-123",
            status: "ready",
            restaurant: { id: "1", name: "Test Restaurant" },
            pickupLocation: {
              street: "456 Oak Ave",
              city: "Springfield",
              state: "IL",
              zipCode: "62701",
            },
            deliveryLocation: {
              street: "123 Main St",
              city: "Springfield",
              state: "IL",
              zipCode: "62701",
            },
            items: [],
            deliveryFee: 5.99,
            total: 39.44,
            estimatedDistance: 3.5,
            estimatedDuration: 15,
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      },
      isLoading: false,
      error: null,
    } as any);

    render(<ActiveOrdersPage />);

    expect(screen.getByText("Ready for Pickup")).toBeInTheDocument();
  });

  it("shows navigation buttons for pickup and delivery locations", () => {
    mockUseActiveOrders.mockReturnValue({
      data: {
        data: [
          {
            id: "order-123",
            status: "ready",
            restaurant: { id: "1", name: "Test Restaurant" },
            pickupLocation: {
              street: "456 Oak Ave",
              city: "Springfield",
              state: "IL",
              zipCode: "62701",
            },
            deliveryLocation: {
              street: "123 Main St",
              city: "Springfield",
              state: "IL",
              zipCode: "62701",
            },
            items: [],
            deliveryFee: 5.99,
            total: 39.44,
            estimatedDistance: 3.5,
            estimatedDuration: 15,
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      },
      isLoading: false,
      error: null,
    } as any);

    const windowOpenSpy = vi
      .spyOn(window, "open")
      .mockImplementation(() => null);

    render(<ActiveOrdersPage />);

    const navigateButtons = screen.getAllByText("Navigate");
    expect(navigateButtons).toHaveLength(2);

    windowOpenSpy.mockRestore();
  });

  it("updates delivery status when button clicked", async () => {
    const mockMutateAsync = vi.fn().mockResolvedValue({});
    mockUseUpdateDeliveryStatus.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any);
    mockUseActiveOrders.mockReturnValue({
      data: {
        data: [
          {
            id: "order-123",
            status: "ready",
            restaurant: { id: "1", name: "Test Restaurant" },
            pickupLocation: {
              street: "456 Oak Ave",
              city: "Springfield",
              state: "IL",
              zipCode: "62701",
            },
            deliveryLocation: {
              street: "123 Main St",
              city: "Springfield",
              state: "IL",
              zipCode: "62701",
            },
            items: [],
            deliveryFee: 5.99,
            total: 39.44,
            estimatedDistance: 3.5,
            estimatedDuration: 15,
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      },
      isLoading: false,
      error: null,
    } as any);

    render(<ActiveOrdersPage />);

    const updateButton = screen.getByText("Mark as Picked Up");
    await userEvent.click(updateButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        orderId: "order-123",
        data: { status: "picked_up" },
      });
    });

    expect(mockToast.success).toHaveBeenCalledWith("Order marked as picked up");
  });

  it("shows confirmation dialog for delivered status", async () => {
    const mockMutateAsync = vi.fn().mockResolvedValue({});
    mockUseUpdateDeliveryStatus.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any);
    mockUseActiveOrders.mockReturnValue({
      data: {
        data: [
          {
            id: "order-123",
            status: "in_transit",
            restaurant: { id: "1", name: "Test Restaurant" },
            pickupLocation: {
              street: "456 Oak Ave",
              city: "Springfield",
              state: "IL",
              zipCode: "62701",
            },
            deliveryLocation: {
              street: "123 Main St",
              city: "Springfield",
              state: "IL",
              zipCode: "62701",
            },
            items: [],
            deliveryFee: 5.99,
            total: 39.44,
            estimatedDistance: 3.5,
            estimatedDuration: 15,
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      },
      isLoading: false,
      error: null,
    } as any);

    render(<ActiveOrdersPage />);

    const updateButton = screen.getByText("Mark as Delivered");
    await userEvent.click(updateButton);

    // Confirmation dialog should appear
    await waitFor(() => {
      expect(
        screen.getByText("Confirm Delivery Completion"),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Are you sure you want to mark Order #order-12/i),
    ).toBeInTheDocument();

    // Mutation should not be called yet
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it("confirms delivery after dialog confirmation", async () => {
    const mockMutateAsync = vi.fn().mockResolvedValue({});
    mockUseUpdateDeliveryStatus.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any);
    mockUseActiveOrders.mockReturnValue({
      data: {
        data: [
          {
            id: "order-123",
            status: "in_transit",
            restaurant: { id: "1", name: "Test Restaurant" },
            pickupLocation: {
              street: "456 Oak Ave",
              city: "Springfield",
              state: "IL",
              zipCode: "62701",
            },
            deliveryLocation: {
              street: "123 Main St",
              city: "Springfield",
              state: "IL",
              zipCode: "62701",
            },
            items: [],
            deliveryFee: 5.99,
            total: 39.44,
            estimatedDistance: 3.5,
            estimatedDuration: 15,
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      },
      isLoading: false,
      error: null,
    } as any);

    render(<ActiveOrdersPage />);

    const updateButton = screen.getByText("Mark as Delivered");
    await userEvent.click(updateButton);

    // Wait for dialog to appear
    await waitFor(() => {
      expect(
        screen.getByText("Confirm Delivery Completion"),
      ).toBeInTheDocument();
    });

    // Click confirm button
    const confirmButton = screen.getByText("Confirm Delivery");
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        orderId: "order-123",
        data: { status: "delivered" },
      });
    });

    expect(mockToast.success).toHaveBeenCalledWith("Order marked as delivered");
  });

  it("cancels delivery confirmation when cancel button clicked", async () => {
    const mockMutateAsync = vi.fn().mockResolvedValue({});
    mockUseUpdateDeliveryStatus.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any);
    mockUseActiveOrders.mockReturnValue({
      data: {
        data: [
          {
            id: "order-123",
            status: "in_transit",
            restaurant: { id: "1", name: "Test Restaurant" },
            pickupLocation: {
              street: "456 Oak Ave",
              city: "Springfield",
              state: "IL",
              zipCode: "62701",
            },
            deliveryLocation: {
              street: "123 Main St",
              city: "Springfield",
              state: "IL",
              zipCode: "62701",
            },
            items: [],
            deliveryFee: 5.99,
            total: 39.44,
            estimatedDistance: 3.5,
            estimatedDuration: 15,
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      },
      isLoading: false,
      error: null,
    } as any);

    render(<ActiveOrdersPage />);

    const updateButton = screen.getByText("Mark as Delivered");
    await userEvent.click(updateButton);

    // Wait for dialog to appear
    await waitFor(() => {
      expect(
        screen.getByText("Confirm Delivery Completion"),
      ).toBeInTheDocument();
    });

    // Click cancel button
    const cancelButton = screen.getByText("Cancel");
    await userEvent.click(cancelButton);

    // Dialog should close and mutation should not be called
    await waitFor(() => {
      expect(
        screen.queryByText("Confirm Delivery Completion"),
      ).not.toBeInTheDocument();
    });

    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it("shows error toast when status update fails", async () => {
    const mockMutateAsync = vi
      .fn()
      .mockRejectedValue(new Error("Update failed"));
    mockUseUpdateDeliveryStatus.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any);
    mockUseActiveOrders.mockReturnValue({
      data: {
        data: [
          {
            id: "order-123",
            status: "ready",
            restaurant: { id: "1", name: "Test Restaurant" },
            pickupLocation: {
              street: "456 Oak Ave",
              city: "Springfield",
              state: "IL",
              zipCode: "62701",
            },
            deliveryLocation: {
              street: "123 Main St",
              city: "Springfield",
              state: "IL",
              zipCode: "62701",
            },
            items: [],
            deliveryFee: 5.99,
            total: 39.44,
            estimatedDistance: 3.5,
            estimatedDuration: 15,
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      },
      isLoading: false,
      error: null,
    } as any);

    render(<ActiveOrdersPage />);

    const updateButton = screen.getByText("Mark as Picked Up");
    await userEvent.click(updateButton);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        "Failed to update delivery status. Please try again",
      );
    });
  });

  it("shows correct next status button based on current status", () => {
    mockUseActiveOrders.mockReturnValue({
      data: {
        data: [
          {
            id: "order-123",
            status: "in_transit",
            restaurant: { id: "1", name: "Test Restaurant" },
            pickupLocation: {
              street: "456 Oak Ave",
              city: "Springfield",
              state: "IL",
              zipCode: "62701",
            },
            deliveryLocation: {
              street: "123 Main St",
              city: "Springfield",
              state: "IL",
              zipCode: "62701",
            },
            items: [],
            deliveryFee: 5.99,
            total: 39.44,
            estimatedDistance: 3.5,
            estimatedDuration: 15,
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      },
      isLoading: false,
      error: null,
    } as any);

    render(<ActiveOrdersPage />);

    expect(screen.getByText("Mark as Delivered")).toBeInTheDocument();
  });

  it("displays distance and duration estimates", () => {
    mockUseActiveOrders.mockReturnValue({
      data: {
        data: [
          {
            id: "order-123",
            status: "ready",
            restaurant: { id: "1", name: "Test Restaurant" },
            pickupLocation: {
              street: "456 Oak Ave",
              city: "Springfield",
              state: "IL",
              zipCode: "62701",
            },
            deliveryLocation: {
              street: "123 Main St",
              city: "Springfield",
              state: "IL",
              zipCode: "62701",
            },
            items: [],
            deliveryFee: 5.99,
            total: 39.44,
            estimatedDistance: 3.5,
            estimatedDuration: 15,
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      },
      isLoading: false,
      error: null,
    } as any);

    render(<ActiveOrdersPage />);

    expect(screen.getByText("3.5 mi")).toBeInTheDocument();
    expect(screen.getByText("15 min")).toBeInTheDocument();
  });

  it("displays contact phone numbers", () => {
    mockUseActiveOrders.mockReturnValue({
      data: {
        data: [
          {
            id: "order-123",
            status: "ready",
            restaurant: {
              id: "1",
              name: "Test Restaurant",
              phone: "555-5678",
            },
            pickupLocation: {
              street: "456 Oak Ave",
              city: "Springfield",
              state: "IL",
              zipCode: "62701",
            },
            deliveryLocation: {
              street: "123 Main St",
              city: "Springfield",
              state: "IL",
              zipCode: "62701",
            },
            items: [],
            deliveryFee: 5.99,
            total: 39.44,
            estimatedDistance: 3.5,
            estimatedDuration: 15,
            contactPhone: "555-1234",
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      },
      isLoading: false,
      error: null,
    } as any);

    render(<ActiveOrdersPage />);

    expect(screen.getByText("📞 555-5678")).toBeInTheDocument();
    expect(screen.getByText("📞 555-1234")).toBeInTheDocument();
  });
});
