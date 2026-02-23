/**
 * Tests for Admin Dashboard page
 */

import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import AdminDashboard from "../page";
import { adminService } from "@/lib/api/services/admin.service";
import type { AdminDashboard as AdminDashboardType } from "@/lib/api/types/admin.types";

// Mock the admin service
vi.mock("@/lib/api/services/admin.service", () => ({
  adminService: {
    getDashboard: vi.fn(),
  },
}));

// Mock DashboardLayout
vi.mock("@/components/layout/DashboardLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dashboard-layout">{children}</div>
  ),
}));

describe("Admin Dashboard Page", () => {
  let queryClient: QueryClient;

  const mockDashboard: AdminDashboardType = {
    totalRevenue: 124500,
    totalOrders: 8234,
    activeRestaurants: 487,
    activeDrivers: 156,
    todayRevenue: 5420,
    todayOrders: 89,
    revenueTrend: [
      { date: "2024-01-01", amount: 10000 },
      { date: "2024-01-02", amount: 12000 },
      { date: "2024-01-03", amount: 11500 },
      { date: "2024-01-04", amount: 13000 },
      { date: "2024-01-05", amount: 14000 },
    ],
    orderVolumeTrend: [
      { date: "2024-01-01", count: 100 },
      { date: "2024-01-02", count: 120 },
      { date: "2024-01-03", count: 115 },
      { date: "2024-01-04", count: 130 },
      { date: "2024-01-05", count: 140 },
    ],
    topRestaurants: [
      {
        id: "1",
        name: "Dragon Wok",
        revenue: 12450,
        orderCount: 234,
      },
      {
        id: "2",
        name: "Pizza Paradise",
        revenue: 9876,
        orderCount: 198,
      },
      {
        id: "3",
        name: "Sushi Masters",
        revenue: 15230,
        orderCount: 156,
      },
    ],
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

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>,
    );
  };

  it("should display loading state initially", () => {
    vi.mocked(adminService.getDashboard).mockImplementation(
      () => new Promise(() => {}),
    );

    renderWithProviders(<AdminDashboard />);

    expect(screen.getByText(/loading dashboard data/i)).toBeInTheDocument();
  });

  it("should display dashboard data when loaded", async () => {
    vi.mocked(adminService.getDashboard).mockResolvedValue(mockDashboard);

    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
    });

    // Check stats are displayed
    expect(screen.getByText("$124,500")).toBeInTheDocument(); // Total Revenue
    expect(screen.getByText("8,234")).toBeInTheDocument(); // Total Orders
    expect(screen.getByText("487")).toBeInTheDocument(); // Active Restaurants
    expect(screen.getByText("156")).toBeInTheDocument(); // Active Drivers

    // Check today's stats
    expect(screen.getByText("$5,420 today")).toBeInTheDocument();
    expect(screen.getByText("89 today")).toBeInTheDocument();
  });

  it("should display revenue trend chart", async () => {
    vi.mocked(adminService.getDashboard).mockResolvedValue(mockDashboard);

    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Revenue Trend")).toBeInTheDocument();
    });

    expect(
      screen.getByText("Daily revenue over selected period"),
    ).toBeInTheDocument();
  });

  it("should display order volume trend chart", async () => {
    vi.mocked(adminService.getDashboard).mockResolvedValue(mockDashboard);

    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Order Volume Trend")).toBeInTheDocument();
    });

    expect(
      screen.getByText("Daily orders over selected period"),
    ).toBeInTheDocument();
  });

  it("should display top restaurants by revenue", async () => {
    vi.mocked(adminService.getDashboard).mockResolvedValue(mockDashboard);

    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(
        screen.getByText("Top Restaurants by Revenue"),
      ).toBeInTheDocument();
    });

    // Use getAllByText since restaurants appear in both sections
    const dragonWokElements = screen.getAllByText("Dragon Wok");
    expect(dragonWokElements.length).toBeGreaterThan(0);

    const pizzaParadiseElements = screen.getAllByText("Pizza Paradise");
    expect(pizzaParadiseElements.length).toBeGreaterThan(0);

    const sushiMastersElements = screen.getAllByText("Sushi Masters");
    expect(sushiMastersElements.length).toBeGreaterThan(0);
  });

  it("should display top restaurants by orders", async () => {
    vi.mocked(adminService.getDashboard).mockResolvedValue(mockDashboard);

    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Top Restaurants by Orders")).toBeInTheDocument();
    });

    expect(screen.getByText("Most popular restaurants")).toBeInTheDocument();
  });

  it("should display date range selector", async () => {
    vi.mocked(adminService.getDashboard).mockResolvedValue(mockDashboard);

    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
    });

    // Verify date range selector is present
    expect(screen.getByText("Last 30 days")).toBeInTheDocument();

    // Initial call with date params
    expect(adminService.getDashboard).toHaveBeenCalledWith(
      expect.objectContaining({
        endDate: expect.any(String),
        startDate: expect.any(String),
      }),
    );
  });

  it("should display error state when fetch fails", async () => {
    vi.mocked(adminService.getDashboard).mockRejectedValue(
      new Error("Failed to fetch dashboard"),
    );

    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Failed to Load Dashboard")).toBeInTheDocument();
    });

    expect(screen.getByText("Failed to fetch dashboard")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("should retry fetching data when retry button is clicked", async () => {
    const user = userEvent.setup();
    vi.mocked(adminService.getDashboard)
      .mockRejectedValueOnce(new Error("Failed to fetch"))
      .mockResolvedValueOnce(mockDashboard);

    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Failed to Load Dashboard")).toBeInTheDocument();
    });

    const retryButton = screen.getByRole("button", { name: /retry/i });
    await user.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
    });

    expect(screen.getByText("$124,500")).toBeInTheDocument();
  });

  it("should format currency values correctly", async () => {
    vi.mocked(adminService.getDashboard).mockResolvedValue(mockDashboard);

    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText("$124,500")).toBeInTheDocument();
    });

    // Check formatted revenue values in top restaurants
    expect(screen.getByText("$12,450")).toBeInTheDocument();
    expect(screen.getByText("$9,876")).toBeInTheDocument();
    expect(screen.getByText("$15,230")).toBeInTheDocument();
  });

  it("should format number values correctly", async () => {
    vi.mocked(adminService.getDashboard).mockResolvedValue(mockDashboard);

    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText("8,234")).toBeInTheDocument();
    });

    // Check formatted order counts - use getAllByText since they appear in both sections
    const orderCounts234 = screen.getAllByText("234 orders");
    expect(orderCounts234.length).toBeGreaterThan(0);

    const orderCounts198 = screen.getAllByText("198 orders");
    expect(orderCounts198.length).toBeGreaterThan(0);

    const orderCounts156 = screen.getAllByText("156 orders");
    expect(orderCounts156.length).toBeGreaterThan(0);
  });
});
