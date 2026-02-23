import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AddressesPage from "../page";
import * as customerHooks from "@/lib/hooks/customer.hooks";

// Mock the hooks
vi.mock("@/lib/hooks/customer.hooks");
vi.mock("@/lib/store", () => ({
  useUIStore: () => ({
    addToast: vi.fn(),
  }),
}));

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock MainLayout
vi.mock("@/components/layout/MainLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <main>{children}</main>
  ),
}));

describe("AddressesPage", () => {
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
        <AddressesPage />
      </QueryClientProvider>,
    );
  };

  it("renders loading state initially", () => {
    vi.mocked(customerHooks.useAddresses).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);

    vi.mocked(customerHooks.useCreateAddress).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(customerHooks.useUpdateAddress).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(customerHooks.useDeleteAddress).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    renderPage();

    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("renders empty state when no addresses", async () => {
    vi.mocked(customerHooks.useAddresses).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    vi.mocked(customerHooks.useCreateAddress).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(customerHooks.useUpdateAddress).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(customerHooks.useDeleteAddress).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/No addresses saved yet/i)).toBeInTheDocument();
    });
  });

  it("renders addresses list when addresses exist", async () => {
    const mockAddresses = [
      {
        id: "1",
        customerId: "user1",
        label: "Home",
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "United States",
        isDefault: true,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      },
      {
        id: "2",
        customerId: "user1",
        label: "Work",
        street: "456 Office Blvd",
        city: "New York",
        state: "NY",
        zipCode: "10002",
        country: "United States",
        isDefault: false,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      },
    ];

    vi.mocked(customerHooks.useAddresses).mockReturnValue({
      data: mockAddresses,
      isLoading: false,
    } as any);

    vi.mocked(customerHooks.useCreateAddress).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(customerHooks.useUpdateAddress).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(customerHooks.useDeleteAddress).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Work")).toBeInTheDocument();
      expect(screen.getByText("123 Main St")).toBeInTheDocument();
      expect(screen.getByText("456 Office Blvd")).toBeInTheDocument();
    });
  });

  it("displays default badge for default address", async () => {
    const mockAddresses = [
      {
        id: "1",
        customerId: "user1",
        label: "Home",
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "United States",
        isDefault: true,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      },
    ];

    vi.mocked(customerHooks.useAddresses).mockReturnValue({
      data: mockAddresses,
      isLoading: false,
    } as any);

    vi.mocked(customerHooks.useCreateAddress).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(customerHooks.useUpdateAddress).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(customerHooks.useDeleteAddress).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Default")).toBeInTheDocument();
    });
  });
});
