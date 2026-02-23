/**
 * Driver Portal Page Tests
 *
 * Tests for the driver dashboard page including:
 * - Profile display
 * - Availability toggle
 * - Earnings summary
 * - Performance metrics
 *
 * Requirements: 12.1, 12.2, 14.4, 26.5
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DriverPortalPage from "../page";
import { useAuthStore } from "@/lib/store/auth.store";
import {
  useDriverProfile,
  useDriverEarnings,
  useDriverMetrics,
  useUpdateAvailability,
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

const mockDriverProfile = {
  id: "driver-1",
  userId: "user-1",
  name: "John Driver",
  email: "john@example.com",
  phone: "+1234567890",
  licenseNumber: "DL123456",
  vehicleType: "car",
  vehiclePlate: "ABC123",
  vehicleColor: "Black",
  status: "approved" as const,
  isAvailable: true,
  rating: 4.8,
  totalDeliveries: 150,
  documents: {},
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

const mockEarnings = {
  totalEarnings: 2500.5,
  completedDeliveries: 150,
  averagePerDelivery: 16.67,
  earningsByDate: [],
  earningsByWeek: [],
};

const mockMetrics = {
  totalDeliveries: 150,
  averageDeliveryTime: 25,
  onTimeDeliveryRate: 0.95,
  acceptanceRate: 0.9,
  averageRating: 4.8,
  earningsPerHour: 22.5,
  performanceTrend: [],
};

describe("DriverPortalPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: { name: "John Driver" },
    } as any);

    vi.mocked(useDriverProfile).mockReturnValue({
      data: mockDriverProfile,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useDriverEarnings).mockReturnValue({
      data: mockEarnings,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useDriverMetrics).mockReturnValue({
      data: mockMetrics,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useUpdateAvailability).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
    } as any);
  });

  describe("Profile Display", () => {
    it("should display driver profile information", () => {
      render(<DriverPortalPage />);

      expect(screen.getByText("Driver Dashboard")).toBeInTheDocument();
      expect(screen.getByText("John Driver")).toBeInTheDocument();
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
      expect(screen.getByText("+1234567890")).toBeInTheDocument();
      expect(screen.getByText("DL123456")).toBeInTheDocument();
    });

    it("should display vehicle information", () => {
      render(<DriverPortalPage />);

      expect(screen.getByText("ABC123")).toBeInTheDocument();
      expect(screen.getByText("Black")).toBeInTheDocument();
    });

    it("should display approved status badge", () => {
      render(<DriverPortalPage />);

      expect(screen.getByText("Approved")).toBeInTheDocument();
    });

    it("should display pending status for pending drivers", () => {
      vi.mocked(useDriverProfile).mockReturnValue({
        data: { ...mockDriverProfile, status: "pending" },
        isLoading: false,
        error: null,
      } as any);

      render(<DriverPortalPage />);

      expect(screen.getByText("Pending Review")).toBeInTheDocument();
      expect(screen.getByText("Registration Under Review")).toBeInTheDocument();
    });
  });

  describe("Availability Toggle - Requirement 14.4", () => {
    it("should display availability toggle for approved drivers", () => {
      render(<DriverPortalPage />);

      expect(screen.getByText("Availability Status")).toBeInTheDocument();
      expect(screen.getByRole("switch")).toBeInTheDocument();
    });

    it("should show current availability status", () => {
      render(<DriverPortalPage />);

      const switchElement = screen.getByRole("switch");
      expect(switchElement).toBeChecked();
      expect(screen.getByText("Available")).toBeInTheDocument();
    });

    it("should toggle availability when switch is clicked", async () => {
      const user = userEvent.setup();
      const mutateAsync = vi.fn().mockResolvedValue({});

      vi.mocked(useUpdateAvailability).mockReturnValue({
        mutateAsync,
        isPending: false,
      } as any);

      render(<DriverPortalPage />);

      const switchElement = screen.getByRole("switch");
      await user.click(switchElement);

      await waitFor(() => {
        expect(mutateAsync).toHaveBeenCalledWith({ isAvailable: false });
      });
    });

    it("should show success toast when availability is updated", async () => {
      const user = userEvent.setup();
      const mutateAsync = vi.fn().mockResolvedValue({});

      vi.mocked(useUpdateAvailability).mockReturnValue({
        mutateAsync,
        isPending: false,
      } as any);

      render(<DriverPortalPage />);

      const switchElement = screen.getByRole("switch");
      await user.click(switchElement);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
      });
    });

    it("should show error toast when availability update fails", async () => {
      const user = userEvent.setup();
      const mutateAsync = vi.fn().mockRejectedValue(new Error("Failed"));

      vi.mocked(useUpdateAvailability).mockReturnValue({
        mutateAsync,
        isPending: false,
      } as any);

      render(<DriverPortalPage />);

      const switchElement = screen.getByRole("switch");
      await user.click(switchElement);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "Failed to update availability. Please try again",
        );
      });
    });

    it("should not display availability toggle for pending drivers", () => {
      vi.mocked(useDriverProfile).mockReturnValue({
        data: { ...mockDriverProfile, status: "pending" },
        isLoading: false,
        error: null,
      } as any);

      render(<DriverPortalPage />);

      expect(screen.queryByText("Availability Status")).not.toBeInTheDocument();
    });
  });

  describe("Earnings Summary - Requirement 12.1", () => {
    it("should display earnings summary for approved drivers", () => {
      render(<DriverPortalPage />);

      expect(screen.getByText("Earnings Summary")).toBeInTheDocument();
      expect(screen.getByText("$2500.50")).toBeInTheDocument();
      expect(screen.getByText("150")).toBeInTheDocument();
      expect(screen.getByText("$16.67")).toBeInTheDocument();
    });

    it("should display earnings card labels", () => {
      render(<DriverPortalPage />);

      expect(screen.getByText("Total Earnings")).toBeInTheDocument();
      expect(screen.getByText("Completed Deliveries")).toBeInTheDocument();
      expect(screen.getByText("Average Per Delivery")).toBeInTheDocument();
    });

    it("should show loading state while earnings are loading", () => {
      vi.mocked(useDriverEarnings).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      render(<DriverPortalPage />);

      // Should show skeleton loaders
      expect(screen.getByText("Earnings Summary")).toBeInTheDocument();
    });

    it("should show message when no earnings data available", () => {
      vi.mocked(useDriverEarnings).mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      } as any);

      render(<DriverPortalPage />);

      expect(
        screen.getByText("No earnings data available"),
      ).toBeInTheDocument();
    });

    it("should not display earnings for pending drivers", () => {
      vi.mocked(useDriverProfile).mockReturnValue({
        data: { ...mockDriverProfile, status: "pending" },
        isLoading: false,
        error: null,
      } as any);

      render(<DriverPortalPage />);

      expect(screen.queryByText("Earnings Summary")).not.toBeInTheDocument();
    });
  });

  describe("Performance Metrics - Requirement 12.2", () => {
    it("should display performance metrics for approved drivers", () => {
      render(<DriverPortalPage />);

      expect(screen.getByText("Performance Metrics")).toBeInTheDocument();
      expect(screen.getByText("4.8")).toBeInTheDocument();
      expect(screen.getByText("25 min")).toBeInTheDocument();
      expect(screen.getByText("95%")).toBeInTheDocument();
      expect(screen.getByText("90%")).toBeInTheDocument(); // Acceptance rate
      expect(screen.getByText("$22.50")).toBeInTheDocument(); // Earnings per hour
    });

    it("should display all metrics card labels", () => {
      render(<DriverPortalPage />);

      expect(screen.getByText("Avg Delivery Time")).toBeInTheDocument();
      expect(screen.getByText("On-Time Rate")).toBeInTheDocument();
      expect(screen.getByText("Acceptance Rate")).toBeInTheDocument();
      expect(screen.getByText("Average Rating")).toBeInTheDocument();
      expect(screen.getByText("Earnings Per Hour")).toBeInTheDocument();
    });

    it("should display acceptance rate as percentage", () => {
      render(<DriverPortalPage />);

      // acceptanceRate is 0.9, should display as 90%
      expect(screen.getByText("90%")).toBeInTheDocument();
    });

    it("should display earnings per hour with currency formatting", () => {
      render(<DriverPortalPage />);

      // earningsPerHour is 22.5, should display as $22.50
      expect(screen.getByText("$22.50")).toBeInTheDocument();
    });

    it("should show loading state while metrics are loading", () => {
      vi.mocked(useDriverMetrics).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      render(<DriverPortalPage />);

      expect(screen.getByText("Performance Metrics")).toBeInTheDocument();
    });

    it("should show message when no metrics data available", () => {
      vi.mocked(useDriverMetrics).mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      } as any);

      render(<DriverPortalPage />);

      expect(screen.getByText("No metrics data available")).toBeInTheDocument();
    });

    it("should not display metrics for pending drivers", () => {
      vi.mocked(useDriverProfile).mockReturnValue({
        data: { ...mockDriverProfile, status: "pending" },
        isLoading: false,
        error: null,
      } as any);

      render(<DriverPortalPage />);

      expect(screen.queryByText("Performance Metrics")).not.toBeInTheDocument();
    });
  });

  describe("Mock Data Removal - Requirement 26.5", () => {
    it("should not display any hardcoded mock data", () => {
      vi.mocked(useDriverProfile).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      } as any);

      render(<DriverPortalPage />);

      // Should not show any profile data when API returns undefined
      expect(screen.queryByText("john@example.com")).not.toBeInTheDocument();
      expect(screen.queryByText("DL123456")).not.toBeInTheDocument();
    });

    it("should show error state instead of fallback data when API fails", () => {
      vi.mocked(useDriverProfile).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error("API Error"),
      } as any);

      render(<DriverPortalPage />);

      expect(
        screen.getByText("Failed to load driver profile. Please try again."),
      ).toBeInTheDocument();
    });
  });

  describe("Loading States", () => {
    it("should show loading skeleton when profile is loading", () => {
      vi.mocked(useDriverProfile).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      render(<DriverPortalPage />);

      // Should render loading state
      expect(screen.queryByText("Driver Dashboard")).not.toBeInTheDocument();
    });
  });

  describe("Error States", () => {
    it("should show error message when profile fails to load", () => {
      vi.mocked(useDriverProfile).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error("Failed to load"),
      } as any);

      render(<DriverPortalPage />);

      expect(
        screen.getByText("Failed to load driver profile. Please try again."),
      ).toBeInTheDocument();
    });
  });
});
