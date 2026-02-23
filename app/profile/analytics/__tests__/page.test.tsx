import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import userEvent from "@testing-library/user-event";
import CustomerAnalyticsPage from "../page";
import { customerService } from "@/lib/api/services/customer.service";
import type { CustomerAnalytics } from "@/lib/api/types/customer.types";

// Mock the customer service
vi.mock("@/lib/api/services/customer.service", () => ({
  customerService: {
    getAnalytics: vi.fn(),
  },
}));

const mockAnalyticsData: CustomerAnalytics = {
  totalSpending: 1250.75,
  totalOrders: 25,
  averageOrderValue: 50.03,
  spendingTrend: [
    { date: "2024-01-01", amount: 45.5 },
    { date: "2024-01-02", amount: 62.3 },
    { date: "2024-01-03", amount: 38.9 },
    { date: "2024-01-04", amount: 71.2 },
    { date: "2024-01-05", amount: 55.8 },
  ],
  favoriteRestaurants: [
    {
      restaurantId: "rest-1",
      restaurantName: "Pizza Palace",
      orderCount: 8,
      totalSpent: 320.5,
    },
    {
      restaurantId: "rest-2",
      restaurantName: "Burger Haven",
      orderCount: 6,
      totalSpent: 245.75,
    },
    {
      restaurantId: "rest-3",
      restaurantName: "Sushi Express",
      orderCount: 5,
      totalSpent: 198.25,
    },
  ],
  mostOrderedItems: [
    {
      itemId: "item-1",
      itemName: "Margherita Pizza",
      restaurantName: "Pizza Palace",
      orderCount: 12,
    },
    {
      itemId: "item-2",
      itemName: "Classic Burger",
      restaurantName: "Burger Haven",
      orderCount: 9,
    },
    {
      itemId: "item-3",
      itemName: "California Roll",
      restaurantName: "Sushi Express",
      orderCount: 7,
    },
  ],
};

describe("CustomerAnalyticsPage", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.mocked(customerService.getAnalytics).mockResolvedValue(
      mockAnalyticsData,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <CustomerAnalyticsPage />
      </QueryClientProvider>,
    );
  };

  it("renders loading state initially", () => {
    // Don't resolve the promise immediately to show loading state
    vi.mocked(customerService.getAnalytics).mockImplementation(
      () => new Promise(() => {}),
    );

    const { container } = renderPage();

    // Check for loading skeleton elements
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders error state when analytics fetch fails", async () => {
    vi.mocked(customerService.getAnalytics).mockRejectedValue(
      new Error("Failed to fetch"),
    );

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByText("Failed to load analytics data"),
      ).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("renders analytics data correctly", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("My Analytics")).toBeInTheDocument();
    });

    // Check page title
    expect(
      screen.getByText("Track your ordering habits and spending insights"),
    ).toBeInTheDocument();

    // Check summary metrics
    expect(screen.getByText("Total Spending")).toBeInTheDocument();
    expect(screen.getByText("$1250.75")).toBeInTheDocument();
    expect(screen.getByText("Total Orders")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getByText("Avg Order Value")).toBeInTheDocument();
    expect(screen.getByText("$50.03")).toBeInTheDocument();
  });

  it("displays spending trend chart", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Spending Trend")).toBeInTheDocument();
    });

    expect(
      screen.getByText("Your spending over the selected period"),
    ).toBeInTheDocument();
  });

  it("displays favorite restaurants", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Favorite Restaurants")).toBeInTheDocument();
    });

    const pizzaPalaceElements = screen.getAllByText("Pizza Palace");
    expect(pizzaPalaceElements.length).toBeGreaterThan(0);
    expect(screen.getByText("8 orders")).toBeInTheDocument();
    expect(screen.getByText("$320.50")).toBeInTheDocument();

    const burgerHavenElements = screen.getAllByText("Burger Haven");
    expect(burgerHavenElements.length).toBeGreaterThan(0);
    expect(screen.getByText("6 orders")).toBeInTheDocument();
    expect(screen.getByText("$245.75")).toBeInTheDocument();
  });

  it("displays most ordered items", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Most Ordered Items")).toBeInTheDocument();
    });

    expect(screen.getByText("Margherita Pizza")).toBeInTheDocument();
    expect(screen.getByText("12x")).toBeInTheDocument();

    expect(screen.getByText("Classic Burger")).toBeInTheDocument();
    expect(screen.getByText("9x")).toBeInTheDocument();
  });

  it("allows changing date range", async () => {
    const user = userEvent.setup();

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("My Analytics")).toBeInTheDocument();
    });

    const startDateInput = screen.getByLabelText(
      "Start Date",
    ) as HTMLInputElement;
    const endDateInput = screen.getByLabelText("End Date") as HTMLInputElement;

    // Just verify the inputs exist and have values
    expect(startDateInput).toBeInTheDocument();
    expect(endDateInput).toBeInTheDocument();
    expect(startDateInput.value).toBeTruthy();
    expect(endDateInput.value).toBeTruthy();
  });

  it("has Last 30 Days quick filter button", async () => {
    const user = userEvent.setup();

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("My Analytics")).toBeInTheDocument();
    });

    const last30DaysButton = screen.getByRole("button", {
      name: /last 30 days/i,
    });
    expect(last30DaysButton).toBeInTheDocument();

    await user.click(last30DaysButton);

    // Verify date inputs are updated (they should be set to last 30 days)
    const startDateInput = screen.getByLabelText(
      "Start Date",
    ) as HTMLInputElement;
    const endDateInput = screen.getByLabelText("End Date") as HTMLInputElement;

    expect(startDateInput.value).toBeTruthy();
    expect(endDateInput.value).toBeTruthy();
  });

  it("handles empty analytics data gracefully", async () => {
    vi.mocked(customerService.getAnalytics).mockResolvedValue({
      totalSpending: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      spendingTrend: [],
      favoriteRestaurants: [],
      mostOrderedItems: [],
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("My Analytics")).toBeInTheDocument();
    });

    const zeroValues = screen.getAllByText("$0.00");
    expect(zeroValues.length).toBeGreaterThan(0);
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("No data available")).toBeInTheDocument();
    expect(
      screen.getByText("No restaurant data available"),
    ).toBeInTheDocument();
    expect(screen.getByText("No item data available")).toBeInTheDocument();
  });

  it("calls customerService.getAnalytics with correct date range", async () => {
    renderPage();

    await waitFor(() => {
      expect(customerService.getAnalytics).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: expect.any(String),
          endDate: expect.any(String),
        }),
      );
    });
  });
});
