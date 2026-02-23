import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NotificationPreferencesPage from "../page";
import * as customerHooks from "@/lib/hooks/customer.hooks";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock the hooks
vi.mock("@/lib/hooks/customer.hooks");

// Mock MainLayout
vi.mock("@/components/layout/MainLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="main-layout">{children}</div>
  ),
}));

// Mock UI components
vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: string;
    className?: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      className={className}
    >
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/switch", () => ({
  Switch: ({
    id,
    checked,
    onCheckedChange,
    disabled,
  }: {
    id?: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
  }) => (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      disabled={disabled}
      data-testid={`switch-${id}`}
    />
  ),
}));

vi.mock("@/components/ui/label", () => ({
  Label: ({
    children,
    htmlFor,
    className,
  }: {
    children: React.ReactNode;
    htmlFor?: string;
    className?: string;
  }) => (
    <label htmlFor={htmlFor} className={className}>
      {children}
    </label>
  ),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const mockPreferences = {
  email: true,
  sms: false,
  push: true,
  orderUpdates: true,
  promotions: true,
  newsletter: false,
  restaurantUpdates: false,
  driverUpdates: true,
};

describe("NotificationPreferencesPage", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  const renderPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <NotificationPreferencesPage />
      </QueryClientProvider>,
    );
  };

  it("displays loading state while fetching preferences", () => {
    vi.mocked(customerHooks.useNotificationPreferences).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    vi.mocked(customerHooks.useUpdateNotificationPreferences).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    renderPage();

    expect(screen.getByTestId("main-layout")).toBeInTheDocument();
    // Loading skeleton should be present
    const pulseElements = document.querySelectorAll(".animate-pulse");
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it("displays error state when preferences fail to load", () => {
    vi.mocked(customerHooks.useNotificationPreferences).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Failed to load"),
    } as any);

    vi.mocked(customerHooks.useUpdateNotificationPreferences).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    renderPage();

    expect(screen.getByText("Failed to load preferences")).toBeInTheDocument();
    expect(
      screen.getByText(/We couldn't load your notification preferences/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  it("renders notification preferences with correct initial values", () => {
    vi.mocked(customerHooks.useNotificationPreferences).mockReturnValue({
      data: mockPreferences,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(customerHooks.useUpdateNotificationPreferences).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    renderPage();

    expect(screen.getByText("Notification")).toBeInTheDocument();
    expect(screen.getByText("Preferences.")).toBeInTheDocument();

    // Check all notification types are rendered
    expect(screen.getByText("Order Updates")).toBeInTheDocument();
    expect(screen.getByText("Promotions & Offers")).toBeInTheDocument();
    expect(screen.getByText("Restaurant Updates")).toBeInTheDocument();
    expect(screen.getByText("Driver Updates")).toBeInTheDocument();

    // Check switches reflect initial values
    expect(screen.getByTestId("switch-orderUpdates")).toBeChecked();
    expect(screen.getByTestId("switch-promotions")).toBeChecked();
    expect(screen.getByTestId("switch-restaurantUpdates")).not.toBeChecked();
    expect(screen.getByTestId("switch-driverUpdates")).toBeChecked();
  });

  it("toggles notification preference when switch is clicked", async () => {
    const user = userEvent.setup();

    vi.mocked(customerHooks.useNotificationPreferences).mockReturnValue({
      data: mockPreferences,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(customerHooks.useUpdateNotificationPreferences).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    renderPage();

    const promotionsSwitch = screen.getByTestId("switch-promotions");
    expect(promotionsSwitch).toBeChecked();

    await user.click(promotionsSwitch);

    expect(promotionsSwitch).not.toBeChecked();
    // Should show unsaved changes banner
    expect(screen.getByText("You have unsaved changes")).toBeInTheDocument();
  });

  it("shows save and cancel buttons when changes are made", async () => {
    const user = userEvent.setup();

    vi.mocked(customerHooks.useNotificationPreferences).mockReturnValue({
      data: mockPreferences,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(customerHooks.useUpdateNotificationPreferences).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    renderPage();

    // Initially, no save/cancel buttons
    expect(screen.queryByText("Save Preferences")).not.toBeInTheDocument();
    expect(screen.queryByText("Cancel")).not.toBeInTheDocument();

    // Toggle a switch
    const restaurantSwitch = screen.getByTestId("switch-restaurantUpdates");
    await user.click(restaurantSwitch);

    // Now save/cancel buttons should appear
    expect(screen.getByText("Save Preferences")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("saves preferences when save button is clicked", async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockResolvedValue({});

    vi.mocked(customerHooks.useNotificationPreferences).mockReturnValue({
      data: mockPreferences,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(customerHooks.useUpdateNotificationPreferences).mockReturnValue({
      mutateAsync,
      isPending: false,
    } as any);

    renderPage();

    // Toggle a switch
    const promotionsSwitch = screen.getByTestId("switch-promotions");
    await user.click(promotionsSwitch);

    // Click save
    const saveButton = screen.getByText("Save Preferences");
    await user.click(saveButton);

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        orderUpdates: true,
        promotions: false, // Changed from true to false
        restaurantUpdates: false,
        driverUpdates: true,
      });
    });
  });

  it("resets preferences when cancel button is clicked", async () => {
    const user = userEvent.setup();

    vi.mocked(customerHooks.useNotificationPreferences).mockReturnValue({
      data: mockPreferences,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(customerHooks.useUpdateNotificationPreferences).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    renderPage();

    // Toggle a switch
    const promotionsSwitch = screen.getByTestId("switch-promotions");
    await user.click(promotionsSwitch);
    expect(promotionsSwitch).not.toBeChecked();

    // Click cancel
    const cancelButton = screen.getByText("Cancel");
    await user.click(cancelButton);

    // Switch should be back to original state
    await waitFor(() => {
      expect(promotionsSwitch).toBeChecked();
    });

    // Unsaved changes banner should disappear
    expect(
      screen.queryByText("You have unsaved changes"),
    ).not.toBeInTheDocument();
  });

  it("displays loading state on save button while saving", async () => {
    const user = userEvent.setup();
    const mutateAsync = vi
      .fn()
      .mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000)),
      );

    vi.mocked(customerHooks.useNotificationPreferences).mockReturnValue({
      data: mockPreferences,
      isLoading: false,
      error: null,
    } as any);

    // First render with isPending: false
    const mockUpdate = vi
      .mocked(customerHooks.useUpdateNotificationPreferences)
      .mockReturnValue({
        mutateAsync,
        isPending: false,
      } as any);

    const { rerender } = renderPage();

    // Toggle a switch
    const orderSwitch = screen.getByTestId("switch-orderUpdates");
    await user.click(orderSwitch);

    // Update mock to return isPending: true
    mockUpdate.mockReturnValue({
      mutateAsync,
      isPending: true,
    } as any);

    // Click save
    const saveButton = screen.getByText("Save Preferences");
    await user.click(saveButton);

    // Rerender to reflect isPending state
    rerender(
      <QueryClientProvider client={queryClient}>
        <NotificationPreferencesPage />
      </QueryClientProvider>,
    );

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText("Saving...")).toBeInTheDocument();
    });
  });

  it("displays all notification type descriptions", () => {
    vi.mocked(customerHooks.useNotificationPreferences).mockReturnValue({
      data: mockPreferences,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(customerHooks.useUpdateNotificationPreferences).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    renderPage();

    expect(
      screen.getByText(/Get notified about order status changes/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Receive special deals, discounts/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/New menu items, special events/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Real-time delivery tracking/i),
    ).toBeInTheDocument();
  });

  it("displays info banner about notifications", () => {
    vi.mocked(customerHooks.useNotificationPreferences).mockReturnValue({
      data: mockPreferences,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(customerHooks.useUpdateNotificationPreferences).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    renderPage();

    expect(screen.getByText("About Notifications")).toBeInTheDocument();
    expect(
      screen.getByText(/You can customize your notification preferences/i),
    ).toBeInTheDocument();
  });

  it("handles multiple toggle changes before saving", async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockResolvedValue({});

    vi.mocked(customerHooks.useNotificationPreferences).mockReturnValue({
      data: mockPreferences,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(customerHooks.useUpdateNotificationPreferences).mockReturnValue({
      mutateAsync,
      isPending: false,
    } as any);

    renderPage();

    // Toggle multiple switches
    await user.click(screen.getByTestId("switch-promotions"));
    await user.click(screen.getByTestId("switch-restaurantUpdates"));
    await user.click(screen.getByTestId("switch-driverUpdates"));

    // Click save
    await user.click(screen.getByText("Save Preferences"));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        orderUpdates: true,
        promotions: false, // Changed
        restaurantUpdates: true, // Changed
        driverUpdates: false, // Changed
      });
    });
  });
});
