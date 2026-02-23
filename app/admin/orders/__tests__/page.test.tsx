import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import OrdersManagementPage from "../page";
import * as adminHooks from "@/lib/hooks/admin.hooks";
import type { AdminOrderListResponse } from "@/lib/api/types/admin.types";
import type { Order } from "@/lib/api/types/order.types";

// Mock the hooks
vi.mock("@/lib/hooks/admin.hooks");
vi.mock("@/components/layout/DashboardLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dashboard-layout">{children}</div>
  ),
}));

const mockOrders: Order[] = [
  {
    id: "order-1",
    customerId: "customer-1",
    restaurantId: "restaurant-1",
    driverId: "driver-1",
    items: [
      {
        menuItemId: "item-1",
        name: "Burger",
        price: 12.99,
        quantity: 2,
      },
    ],
    subtotal: 25.98,
    deliveryFee: 3.99,
    tax: 2.6,
    discount: 0,
    total: 32.57,
    status: "confirmed",
    paymentStatus: "completed",
    deliveryAddress: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA",
    },
    contactPhone: "+1234567890",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:05:00Z",
    statusHistory: [
      {
        status: "pending",
        timestamp: "2024-01-15T10:00:00Z",
      },
      {
        status: "confirmed",
        timestamp: "2024-01-15T10:05:00Z",
      },
    ],
  },
  {
    id: "order-2",
    customerId: "customer-2",
    restaurantId: "restaurant-2",
    items: [
      {
        menuItemId: "item-2",
        name: "Pizza",
        price: 18.99,
        quantity: 1,
      },
    ],
    subtotal: 18.99,
    deliveryFee: 3.99,
    tax: 1.9,
    discount: 2.0,
    total: 22.88,
    status: "delivered",
    paymentStatus: "completed",
    deliveryAddress: {
      street: "456 Oak Ave",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90001",
      country: "USA",
    },
    contactPhone: "+1987654321",
    rating: 4.5,
    review: "Great food!",
    createdAt: "2024-01-14T15:00:00Z",
    updatedAt: "2024-01-14T16:30:00Z",
    statusHistory: [
      {
        status: "pending",
        timestamp: "2024-01-14T15:00:00Z",
      },
      {
        status: "delivered",
        timestamp: "2024-01-14T16:30:00Z",
      },
    ],
  },
];

const mockOrdersResponse: AdminOrderListResponse = {
  data: mockOrders,
  pagination: {
    page: 1,
    limit: 10,
    total: 2,
    totalPages: 1,
  },
};

describe("OrdersManagementPage", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Mock successful query
    vi.spyOn(adminHooks, "useAdminOrders").mockReturnValue({
      data: mockOrdersResponse,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(adminHooks, "useAdminCancelOrder").mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <OrdersManagementPage />
      </QueryClientProvider>,
    );
  };

  it("renders the page with header", () => {
    renderComponent();

    expect(screen.getByText("Order Management")).toBeInTheDocument();
    expect(
      screen.getByText("View and manage all orders across the platform"),
    ).toBeInTheDocument();
  });

  it("displays orders list", () => {
    renderComponent();

    expect(screen.getByText(/Order #order-1/)).toBeInTheDocument();
    expect(screen.getByText(/Order #order-2/)).toBeInTheDocument();
  });

  it("displays order status badges", () => {
    renderComponent();

    expect(screen.getByText("Confirmed")).toBeInTheDocument();
    expect(screen.getByText("Delivered")).toBeInTheDocument();
  });

  it("displays order totals", () => {
    renderComponent();

    expect(screen.getByText("$32.57")).toBeInTheDocument();
    expect(screen.getByText("$22.88")).toBeInTheDocument();
  });

  it("displays delivery addresses", () => {
    renderComponent();

    expect(
      screen.getByText(/123 Main St, New York, NY 10001/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/456 Oak Ave, Los Angeles, CA 90001/),
    ).toBeInTheDocument();
  });

  it("shows loading state", () => {
    vi.spyOn(adminHooks, "useAdminOrders").mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    } as any);

    renderComponent();

    expect(screen.getByText("Loading orders...")).toBeInTheDocument();
  });

  it("shows error state with retry button", async () => {
    const user = userEvent.setup();
    const mockRefetch = vi.fn();
    vi.spyOn(adminHooks, "useAdminOrders").mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error("Failed to fetch"),
      refetch: mockRefetch,
    } as any);

    renderComponent();

    expect(screen.getByText("Failed to Load Orders")).toBeInTheDocument();
    expect(screen.getByText("Failed to fetch")).toBeInTheDocument();

    const retryButton = screen.getByRole("button", { name: /retry/i });
    await user.click(retryButton);

    expect(mockRefetch).toHaveBeenCalled();
  });

  it("filters orders by status", async () => {
    const user = userEvent.setup();
    renderComponent();

    const statusSelect = screen.getByRole("combobox", {
      name: /filter by status/i,
    });
    await user.click(statusSelect);

    const confirmedOption = screen.getByRole("option", { name: /confirmed/i });
    await user.click(confirmedOption);

    await waitFor(() => {
      expect(adminHooks.useAdminOrders).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "confirmed",
        }),
      );
    });
  });

  it("searches orders by ID", async () => {
    const user = userEvent.setup();
    renderComponent();

    const searchInput = screen.getByPlaceholderText("Search by order ID...");
    await user.type(searchInput, "order-1");

    await waitFor(() => {
      expect(adminHooks.useAdminOrders).toHaveBeenCalledWith(
        expect.objectContaining({
          search: "order-1",
        }),
      );
    });
  });

  it("filters by restaurant ID", async () => {
    const user = userEvent.setup();
    renderComponent();

    const restaurantInput = screen.getByPlaceholderText("Restaurant ID...");
    await user.type(restaurantInput, "restaurant-1");

    await waitFor(() => {
      expect(adminHooks.useAdminOrders).toHaveBeenCalledWith(
        expect.objectContaining({
          restaurantId: "restaurant-1",
        }),
      );
    });
  });

  it("filters by driver ID", async () => {
    const user = userEvent.setup();
    renderComponent();

    const driverInput = screen.getByPlaceholderText("Driver ID...");
    await user.type(driverInput, "driver-1");

    await waitFor(() => {
      expect(adminHooks.useAdminOrders).toHaveBeenCalledWith(
        expect.objectContaining({
          driverId: "driver-1",
        }),
      );
    });
  });

  it("filters by date range", async () => {
    const user = userEvent.setup();
    renderComponent();

    const startDateInput = screen.getByPlaceholderText("Start date");
    const endDateInput = screen.getByPlaceholderText("End date");

    await user.type(startDateInput, "2024-01-01");
    await user.type(endDateInput, "2024-01-31");

    await waitFor(() => {
      expect(adminHooks.useAdminOrders).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: "2024-01-01",
          endDate: "2024-01-31",
        }),
      );
    });
  });

  it("clears all filters", async () => {
    const user = userEvent.setup();
    renderComponent();

    // Apply some filters
    const searchInput = screen.getByPlaceholderText("Search by order ID...");
    await user.type(searchInput, "order-1");

    const restaurantInput = screen.getByPlaceholderText("Restaurant ID...");
    await user.type(restaurantInput, "restaurant-1");

    // Clear filters
    const clearButton = screen.getByRole("button", { name: /clear filters/i });
    await user.click(clearButton);

    await waitFor(() => {
      expect(adminHooks.useAdminOrders).toHaveBeenCalledWith(
        expect.objectContaining({
          search: undefined,
          restaurantId: undefined,
        }),
      );
    });
  });

  it("opens order detail dialog", async () => {
    const user = userEvent.setup();
    renderComponent();

    const viewDetailsButtons = screen.getAllByRole("button", {
      name: /view details/i,
    });
    await user.click(viewDetailsButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Order Details")).toBeInTheDocument();
      expect(screen.getByText(/Order #order-1/)).toBeInTheDocument();
    });
  });

  it("displays order details in dialog", async () => {
    const user = userEvent.setup();
    renderComponent();

    const viewDetailsButtons = screen.getAllByRole("button", {
      name: /view details/i,
    });
    await user.click(viewDetailsButtons[1]); // Second order with rating

    await waitFor(() => {
      const dialog = screen.getByRole("dialog");
      expect(within(dialog).getByText("Delivered")).toBeInTheDocument();
      expect(within(dialog).getByText("Pizza")).toBeInTheDocument();
      expect(within(dialog).getByText("$18.99")).toBeInTheDocument();
      expect(within(dialog).getByText("Great food!")).toBeInTheDocument();
      expect(within(dialog).getByText("4.5 / 5.0")).toBeInTheDocument();
    });
  });

  it("opens cancel order dialog", async () => {
    const user = userEvent.setup();
    renderComponent();

    const cancelButtons = screen.getAllByRole("button", {
      name: /cancel order/i,
    });
    await user.click(cancelButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(
        screen.getByText(/Are you sure you want to cancel order/),
      ).toBeInTheDocument();
    });
  });

  it("cancels order with reason", async () => {
    const user = userEvent.setup();
    const mockMutateAsync = vi.fn().mockResolvedValue({});
    vi.spyOn(adminHooks, "useAdminCancelOrder").mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any);

    renderComponent();

    const cancelButtons = screen.getAllByRole("button", {
      name: /cancel order/i,
    });
    await user.click(cancelButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const reasonInput = screen.getByPlaceholderText(
      "Enter reason for cancellation...",
    );
    await user.type(reasonInput, "Customer requested cancellation");

    const confirmButton = screen.getByRole("button", {
      name: /confirm cancellation/i,
    });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        id: "order-1",
        data: { reason: "Customer requested cancellation" },
      });
    });
  });

  it("disables cancel button without reason", async () => {
    const user = userEvent.setup();
    renderComponent();

    const cancelButtons = screen.getAllByRole("button", {
      name: /cancel order/i,
    });
    await user.click(cancelButtons[0]);

    await waitFor(() => {
      const confirmButton = screen.getByRole("button", {
        name: /confirm cancellation/i,
      });
      expect(confirmButton).toBeDisabled();
    });
  });

  it("does not show cancel button for delivered orders", () => {
    renderComponent();

    // Get all cancel buttons - should only be 1 (for the confirmed order)
    const cancelButtons = screen.queryAllByRole("button", {
      name: /cancel order/i,
    });

    // Only the first order (confirmed) should have a cancel button
    // The second order (delivered) should not
    expect(cancelButtons).toHaveLength(1);
  });

  it("handles pagination", async () => {
    const user = userEvent.setup();
    const mockOrdersWithPagination: AdminOrderListResponse = {
      data: mockOrders,
      pagination: {
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3,
      },
    };

    vi.spyOn(adminHooks, "useAdminOrders").mockReturnValue({
      data: mockOrdersWithPagination,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    renderComponent();

    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();

    const nextButton = screen.getByRole("button", { name: /next/i });
    await user.click(nextButton);

    await waitFor(() => {
      expect(adminHooks.useAdminOrders).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
        }),
      );
    });
  });

  it("shows empty state when no orders", () => {
    vi.spyOn(adminHooks, "useAdminOrders").mockReturnValue({
      data: {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    renderComponent();

    expect(screen.getByText("No Orders Found")).toBeInTheDocument();
    expect(
      screen.getByText("No orders have been placed yet"),
    ).toBeInTheDocument();
  });

  it("displays results summary", () => {
    renderComponent();

    expect(screen.getByText(/Showing 1 to 2 of 2 orders/)).toBeInTheDocument();
  });
});
