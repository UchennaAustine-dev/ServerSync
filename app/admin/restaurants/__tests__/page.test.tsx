import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import RestaurantsManagementPage from "../page";
import * as adminHooks from "@/lib/hooks/admin.hooks";
import type { AdminRestaurantListResponse } from "@/lib/api/types/admin.types";
import type { Restaurant } from "@/lib/api/types/restaurant.types";

// Mock the hooks
vi.mock("@/lib/hooks/admin.hooks");
vi.mock("@/components/layout/DashboardLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dashboard-layout">{children}</div>
  ),
}));

const mockRestaurant: Restaurant & { status: string } = {
  id: "rest-1",
  name: "Test Restaurant",
  description: "A test restaurant",
  cuisineType: ["Italian", "Pizza"],
  address: "123 Test St",
  phone: "555-0100",
  email: "test@restaurant.com",
  rating: 4.5,
  reviewCount: 100,
  priceRange: 2,
  deliveryFee: 5,
  minimumOrder: 15,
  estimatedDeliveryTime: 30,
  isOpen: true,
  isAvailable: true,
  ownerId: "owner-1",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  status: "pending",
};

const mockRestaurantsData: AdminRestaurantListResponse = {
  data: [mockRestaurant],
  pagination: {
    page: 1,
    limit: 10,
    total: 1,
    totalPages: 1,
  },
};

describe("RestaurantsManagementPage", () => {
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
  });

  const renderPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <RestaurantsManagementPage />
      </QueryClientProvider>,
    );
  };

  it("renders loading state initially", () => {
    vi.spyOn(adminHooks, "useAdminRestaurants").mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(adminHooks, "useUpdateRestaurantStatus").mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    renderPage();

    expect(screen.getByText("Loading restaurants...")).toBeInTheDocument();
  });

  it("renders error state when fetch fails", async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.spyOn(adminHooks, "useAdminRestaurants").mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Failed to fetch"),
      refetch,
    } as any);

    vi.spyOn(adminHooks, "useUpdateRestaurantStatus").mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    renderPage();

    expect(screen.getByText("Failed to Load Restaurants")).toBeInTheDocument();
    expect(screen.getByText("Failed to fetch")).toBeInTheDocument();

    const retryButton = screen.getByRole("button", { name: /retry/i });
    await user.click(retryButton);

    expect(refetch).toHaveBeenCalled();
  });

  it("renders restaurants list successfully", () => {
    vi.spyOn(adminHooks, "useAdminRestaurants").mockReturnValue({
      data: mockRestaurantsData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(adminHooks, "useUpdateRestaurantStatus").mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    renderPage();

    expect(screen.getByText("Restaurant Management")).toBeInTheDocument();
    expect(screen.getByText("Test Restaurant")).toBeInTheDocument();
    expect(screen.getByText("A test restaurant")).toBeInTheDocument();
    expect(screen.getByText("Italian, Pizza")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("displays search and filter controls", () => {
    vi.spyOn(adminHooks, "useAdminRestaurants").mockReturnValue({
      data: mockRestaurantsData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(adminHooks, "useUpdateRestaurantStatus").mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    renderPage();

    expect(
      screen.getByPlaceholderText("Search by restaurant name..."),
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("shows status update buttons based on current status", () => {
    vi.spyOn(adminHooks, "useAdminRestaurants").mockReturnValue({
      data: mockRestaurantsData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(adminHooks, "useUpdateRestaurantStatus").mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    renderPage();

    // For pending status, should show Approve, Suspend, and Reject buttons
    expect(
      screen.getByRole("button", { name: /approve/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /suspend/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reject/i })).toBeInTheDocument();
  });

  it("opens confirmation dialog when status button is clicked", async () => {
    const user = userEvent.setup();

    vi.spyOn(adminHooks, "useAdminRestaurants").mockReturnValue({
      data: mockRestaurantsData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(adminHooks, "useUpdateRestaurantStatus").mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    renderPage();

    const approveButton = screen.getByRole("button", { name: /approve/i });
    await user.click(approveButton);

    await waitFor(() => {
      expect(screen.getByText("Update Restaurant Status")).toBeInTheDocument();
      expect(
        screen.getByText(/Are you sure you want to change the status/i),
      ).toBeInTheDocument();
    });
  });

  it("calls mutation when confirming status update", async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockResolvedValue({});

    vi.spyOn(adminHooks, "useAdminRestaurants").mockReturnValue({
      data: mockRestaurantsData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(adminHooks, "useUpdateRestaurantStatus").mockReturnValue({
      mutateAsync,
      isPending: false,
    } as any);

    renderPage();

    // Click approve button
    const approveButton = screen.getByRole("button", { name: /approve/i });
    await user.click(approveButton);

    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByText("Update Restaurant Status")).toBeInTheDocument();
    });

    // Click confirm button
    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    await user.click(confirmButton);

    // Verify mutation was called
    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        id: "rest-1",
        data: {
          status: "active",
          reason: undefined,
        },
      });
    });
  });

  it("displays empty state when no restaurants found", () => {
    vi.spyOn(adminHooks, "useAdminRestaurants").mockReturnValue({
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

    vi.spyOn(adminHooks, "useUpdateRestaurantStatus").mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    renderPage();

    expect(screen.getByText("No Restaurants Found")).toBeInTheDocument();
  });

  it("handles pagination correctly", () => {
    const mockDataWithPagination: AdminRestaurantListResponse = {
      data: [mockRestaurant],
      pagination: {
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3,
      },
    };

    vi.spyOn(adminHooks, "useAdminRestaurants").mockReturnValue({
      data: mockDataWithPagination,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(adminHooks, "useUpdateRestaurantStatus").mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    renderPage();

    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /next/i })).not.toBeDisabled();
  });
});
