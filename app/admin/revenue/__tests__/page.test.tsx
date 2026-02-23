/**
 * Tests for Revenue Analytics page
 */

import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import RevenueAnalyticsPage from "../page";
import { adminService } from "@/lib/api/services/admin.service";
import type { RevenueAnalytics } from "@/lib/api/types/admin.types";

// Mock the admin service
vi.mock("@/lib/api/services/admin.service", () => ({
  adminService: {
    getRevenueAnalytics: vi.fn(),
  },
}));

// Mock DashboardLayout
vi.mock("@/components/layout/DashboardLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dashboard-layout">{children}</div>
  ),
}));

const mockRevenueAnalytics: RevenueAnalytics = {
  totalRevenue: 125000,
  platformCommission: 12500,
  restaurantPayouts: 100000,
  driverPayouts: 12500,
  revenueTrend: [
    {
      date: "2024-01-01",
      totalRevenue: 5000,
      commission: 500,
    },
    {
      date: "2024-01-02",
      totalRevenue: 6000,
      commission: 600,
    },
    {
      date: "2024-01-03",
      totalRevenue: 7500,
      commission: 750,
    },
  ],
  revenueByRestaurant: [
    {
      restaurantId: "rest1",
      restaurantName: "Pizza Palace",
      revenue: 50000,
      commission: 5000,
    },
    {
      restaurantId: "rest2",
      restaurantName: "Burger Barn",
      revenue: 40000,
      commission: 4000,
    },
    {
      restaurantId: "rest3",
      restaurantName: "Sushi Station",
      revenue: 35000,
      commission: 3500,
    },
  ],
  averageOrderValue: 45.5,
  orderCount: 2750,
};

describe("RevenueAnalyticsPage", () => {
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

  const renderPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <RevenueAnalyticsPage />
      </QueryClientProvider>,
    );
  };

  it("renders loading state initially", async () => {
    vi.mocked(adminService.getRevenueAnalytics).mockImplementation(
      () => new Promise(() => {}), // Never resolves
    );

    renderPage();

    expect(
      await screen.findByText("Loading revenue analytics..."),
    ).toBeInTheDocument();
  });

  it("renders error state when fetch fails", async () => {
    vi.mocked(adminService.getRevenueAnalytics).mockRejectedValue(
      new Error("Failed to fetch"),
    );

    renderPage();

    expect(
      await screen.findByText("Failed to Load Revenue Analytics"),
    ).toBeInTheDocument();
    expect(await screen.findByText("Failed to fetch")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("renders revenue analytics data correctly", async () => {
    vi.mocked(adminService.getRevenueAnalytics).mockResolvedValue(
      mockRevenueAnalytics,
    );

    renderPage();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("Revenue Analytics")).toBeInTheDocument();
    });

    // Check revenue stats
    expect(screen.getByText("Total Revenue")).toBeInTheDocument();
    expect(screen.getByText("$125,000")).toBeInTheDocument();

    expect(screen.getByText("Platform Commission")).toBeInTheDocument();
    expect(screen.getByText("Commission earned")).toBeInTheDocument();

    expect(screen.getByText("Restaurant Payouts")).toBeInTheDocument();
    expect(screen.getByText("$100,000")).toBeInTheDocument();

    expect(screen.getByText("Driver Payouts")).toBeInTheDocument();
    expect(screen.getByText("Paid to drivers")).toBeInTheDocument();

    // Check order metrics
    expect(screen.getByText("Total Orders")).toBeInTheDocument();
    expect(screen.getByText("2,750")).toBeInTheDocument();

    expect(screen.getByText("Average Order Value")).toBeInTheDocument();
    expect(screen.getByText("$46")).toBeInTheDocument(); // Rounded
  });

  it("renders revenue trend chart", async () => {
    vi.mocked(adminService.getRevenueAnalytics).mockResolvedValue(
      mockRevenueAnalytics,
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Revenue Trend")).toBeInTheDocument();
    });

    expect(
      screen.getByText("Daily revenue and commission over selected period"),
    ).toBeInTheDocument();

    // Check that trend data is displayed
    expect(screen.getByText("$5,000")).toBeInTheDocument();
    expect(screen.getByText("$6,000")).toBeInTheDocument();
    expect(screen.getByText("$7,500")).toBeInTheDocument();
  });

  it("renders revenue by restaurant breakdown", async () => {
    vi.mocked(adminService.getRevenueAnalytics).mockResolvedValue(
      mockRevenueAnalytics,
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Revenue by Restaurant")).toBeInTheDocument();
    });

    expect(
      screen.getByText("Top revenue-generating restaurants"),
    ).toBeInTheDocument();

    // Check restaurant names and revenues
    expect(screen.getByText("Pizza Palace")).toBeInTheDocument();
    expect(screen.getByText("$50,000")).toBeInTheDocument();

    expect(screen.getByText("Burger Barn")).toBeInTheDocument();
    expect(screen.getByText("$40,000")).toBeInTheDocument();

    expect(screen.getByText("Sushi Station")).toBeInTheDocument();
    expect(screen.getByText("$35,000")).toBeInTheDocument();

    // Check commission display
    expect(screen.getByText("Commission: $5,000")).toBeInTheDocument();
    expect(screen.getByText("Commission: $4,000")).toBeInTheDocument();
    expect(screen.getByText("Commission: $3,500")).toBeInTheDocument();
  });

  it("handles empty revenue trend gracefully", async () => {
    const emptyAnalytics = {
      ...mockRevenueAnalytics,
      revenueTrend: [],
    };

    vi.mocked(adminService.getRevenueAnalytics).mockResolvedValue(
      emptyAnalytics,
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Total Revenue")).toBeInTheDocument();
    });

    // Should not render the trend chart
    expect(screen.queryByText("Revenue Trend")).not.toBeInTheDocument();
  });

  it("handles empty restaurant breakdown gracefully", async () => {
    const emptyAnalytics = {
      ...mockRevenueAnalytics,
      revenueByRestaurant: [],
    };

    vi.mocked(adminService.getRevenueAnalytics).mockResolvedValue(
      emptyAnalytics,
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Total Revenue")).toBeInTheDocument();
    });

    // Should not render the restaurant breakdown
    expect(screen.queryByText("Revenue by Restaurant")).not.toBeInTheDocument();
  });

  it("displays ranking numbers for restaurants", async () => {
    vi.mocked(adminService.getRevenueAnalytics).mockResolvedValue(
      mockRevenueAnalytics,
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("#1")).toBeInTheDocument();
    });

    expect(screen.getByText("#2")).toBeInTheDocument();
    expect(screen.getByText("#3")).toBeInTheDocument();
  });
});
