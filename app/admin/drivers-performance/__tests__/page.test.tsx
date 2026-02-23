import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import DriverPerformanceAnalyticsPage from "../page";
import * as adminHooks from "@/lib/hooks/admin.hooks";

// Mock the hooks
vi.mock("@/lib/hooks/admin.hooks");

// Mock DashboardLayout
vi.mock("@/components/layout/DashboardLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dashboard-layout">{children}</div>
  ),
}));

// Mock UI components
vi.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-testid="select">{children}</div>
  ),
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <div>{children}</div>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: () => <div>Select value</div>,
}));

const mockDriverPerformanceData = {
  totalDrivers: 150,
  activeDrivers: 85,
  driverRankings: [
    {
      driverId: "1",
      driverName: "John Doe",
      deliveryCount: 250,
      averageRating: 4.8,
      averageDeliveryTime: 25,
      earnings: 5000,
    },
    {
      driverId: "2",
      driverName: "Jane Smith",
      deliveryCount: 220,
      averageRating: 4.9,
      averageDeliveryTime: 22,
      earnings: 4800,
    },
    {
      driverId: "3",
      driverName: "Bob Johnson",
      deliveryCount: 200,
      averageRating: 4.7,
      averageDeliveryTime: 28,
      earnings: 4200,
    },
  ],
  averageDeliveryTime: 26.5,
  onTimeDeliveryRate: 92.5,
  driverAvailability: [
    { hour: 8, availableDrivers: 20 },
    { hour: 12, availableDrivers: 45 },
    { hour: 18, availableDrivers: 60 },
    { hour: 20, availableDrivers: 50 },
  ],
  earningsDistribution: [
    { range: "$0 - $1,000", driverCount: 30 },
    { range: "$1,000 - $3,000", driverCount: 50 },
    { range: "$3,000 - $5,000", driverCount: 40 },
    { range: "$5,000+", driverCount: 30 },
  ],
};

describe("DriverPerformanceAnalyticsPage", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const renderPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <DriverPerformanceAnalyticsPage />
      </QueryClientProvider>,
    );
  };

  it("displays loading state initially", () => {
    vi.mocked(adminHooks.useDriverPerformance).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    } as any);

    renderPage();

    expect(
      screen.getByText("Loading driver performance analytics..."),
    ).toBeInTheDocument();
  });

  it("displays error state when fetch fails", () => {
    const mockRefetch = vi.fn();
    vi.mocked(adminHooks.useDriverPerformance).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Failed to fetch"),
      refetch: mockRefetch,
    } as any);

    renderPage();

    expect(
      screen.getByText("Failed to Load Driver Performance Analytics"),
    ).toBeInTheDocument();
    expect(screen.getByText("Failed to fetch")).toBeInTheDocument();
  });

  it("displays driver performance analytics data", async () => {
    vi.mocked(adminHooks.useDriverPerformance).mockReturnValue({
      data: mockDriverPerformanceData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByText("Driver Performance Analytics"),
      ).toBeInTheDocument();
    });

    // Check stats
    expect(screen.getByText("Total Drivers")).toBeInTheDocument();
    expect(screen.getByText("150")).toBeInTheDocument();
    expect(screen.getByText("Active Drivers")).toBeInTheDocument();
    expect(screen.getByText("85")).toBeInTheDocument();
    expect(screen.getByText("Avg Delivery Time")).toBeInTheDocument();
    expect(screen.getByText("On-Time Rate")).toBeInTheDocument();
    expect(screen.getByText("93%")).toBeInTheDocument(); // Rounded from 92.5
  });

  it("displays driver rankings by deliveries", async () => {
    vi.mocked(adminHooks.useDriverPerformance).mockReturnValue({
      data: mockDriverPerformanceData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Top by Deliveries")).toBeInTheDocument();
    });

    // Check that driver names appear (they appear in all 3 ranking sections)
    expect(screen.getAllByText("John Doe").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Jane Smith").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Bob Johnson").length).toBeGreaterThan(0);
  });

  it("displays driver rankings by rating", async () => {
    vi.mocked(adminHooks.useDriverPerformance).mockReturnValue({
      data: mockDriverPerformanceData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Top by Rating")).toBeInTheDocument();
    });

    // Jane Smith should be first (4.9 rating)
    const ratings = screen.getAllByText(/4\.[789]/);
    expect(ratings.length).toBeGreaterThan(0);
  });

  it("displays driver rankings by earnings", async () => {
    vi.mocked(adminHooks.useDriverPerformance).mockReturnValue({
      data: mockDriverPerformanceData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Top by Earnings")).toBeInTheDocument();
    });

    expect(screen.getByText("$5,000")).toBeInTheDocument();
    expect(screen.getByText("$4,800")).toBeInTheDocument();
  });

  it("displays driver availability by hour", async () => {
    vi.mocked(adminHooks.useDriverPerformance).mockReturnValue({
      data: mockDriverPerformanceData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByText("Driver Availability by Hour"),
      ).toBeInTheDocument();
    });

    expect(screen.getByText("8:00 AM")).toBeInTheDocument();
    expect(screen.getByText("12:00 PM")).toBeInTheDocument();
    expect(screen.getByText("6:00 PM")).toBeInTheDocument();
    expect(screen.getByText("8:00 PM")).toBeInTheDocument();
  });

  it("displays earnings distribution", async () => {
    vi.mocked(adminHooks.useDriverPerformance).mockReturnValue({
      data: mockDriverPerformanceData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Earnings Distribution")).toBeInTheDocument();
    });

    expect(screen.getByText("$0 - $1,000")).toBeInTheDocument();
    expect(screen.getByText("$1,000 - $3,000")).toBeInTheDocument();
    expect(screen.getByText("$3,000 - $5,000")).toBeInTheDocument();
    expect(screen.getByText("$5,000+")).toBeInTheDocument();
  });

  it("calls refetch when retry button is clicked", async () => {
    const mockRefetch = vi.fn();
    vi.mocked(adminHooks.useDriverPerformance).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Failed to fetch"),
      refetch: mockRefetch,
    } as any);

    renderPage();

    const retryButton = screen.getByText("Retry");
    retryButton.click();

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });
});
