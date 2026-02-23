import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import CheckoutPage from "../page";
import { useCartStore, useAuthStore } from "@/lib/store";
import { useCreateOrder } from "@/lib/hooks/order.hooks";
import { useAddresses } from "@/lib/hooks/customer.hooks";
import { orderService } from "@/lib/api/services/order.service";

// Mock dependencies
vi.mock("@/lib/store", () => ({
  useCartStore: vi.fn(),
  useAuthStore: vi.fn(),
  useUIStore: vi.fn(() => ({
    addToast: vi.fn(),
  })),
}));

vi.mock("@/lib/hooks/order.hooks", () => ({
  useCreateOrder: vi.fn(),
}));

vi.mock("@/lib/hooks/customer.hooks", () => ({
  useAddresses: vi.fn(),
}));

vi.mock("@/lib/api/services/order.service", () => ({
  orderService: {
    validatePromo: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/components/layout/MainLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/components/payment/PaymentForm", () => ({
  PaymentForm: () => <div>Payment Form</div>,
}));

describe("Checkout Page - Promo Code Integration", () => {
  const mockCartItems = [
    {
      menuItemId: "item-1",
      restaurantId: "restaurant-123",
      name: "Burger",
      price: 10.0,
      quantity: 2,
      image: "",
      specialInstructions: "",
    },
    {
      menuItemId: "item-2",
      restaurantId: "restaurant-123",
      name: "Fries",
      price: 5.0,
      quantity: 1,
      image: "",
      specialInstructions: "",
    },
  ];

  const mockCreateOrder = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCartStore).mockReturnValue({
      items: mockCartItems,
      getTotal: () => 25.0,
      removeFromCart: vi.fn(),
      updateQuantity: vi.fn(),
      clearCart: vi.fn(),
      restaurantId: "restaurant-123",
      addToCart: vi.fn(),
      getItemCount: vi.fn(),
    });

    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: "user-123", email: "test@example.com", role: "customer" },
      token: "mock-token",
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      setUser: vi.fn(),
    });

    vi.mocked(useCreateOrder).mockReturnValue({
      mutateAsync: mockCreateOrder,
      isPending: false,
      isError: false,
      error: null,
      data: undefined,
      mutate: vi.fn(),
      reset: vi.fn(),
      isIdle: true,
      isSuccess: false,
      status: "idle",
      variables: undefined,
      context: undefined,
      failureCount: 0,
      failureReason: null,
      isPaused: false,
      submittedAt: 0,
    } as any);

    vi.mocked(useAddresses).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);
  });

  describe("Promo Code in Order Summary", () => {
    it("should display discount in order summary when promo is applied", async () => {
      const mockPromoResponse = {
        valid: true,
        discountAmount: 5.0,
        message: "Promo code applied",
      };
      vi.mocked(orderService.validatePromo).mockResolvedValue(
        mockPromoResponse,
      );

      render(<CheckoutPage />);

      // Navigate to details step
      const proceedButton = screen.getByRole("button", {
        name: /proceed to delivery/i,
      });
      fireEvent.click(proceedButton);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText("Enter promo code"),
        ).toBeInTheDocument();
      });

      // Apply promo code
      const promoInput = screen.getByPlaceholderText("Enter promo code");
      const applyButton = screen.getByRole("button", { name: /apply/i });

      fireEvent.change(promoInput, { target: { value: "SAVE10" } });
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(orderService.validatePromo).toHaveBeenCalledWith({
          promoCode: "SAVE10",
          restaurantId: "restaurant-123",
          subtotal: 25.0,
        });
      });

      // Check if discount is displayed in order summary
      await waitFor(() => {
        expect(screen.getByText(/discount/i)).toBeInTheDocument();
        expect(screen.getByText("-$5.00")).toBeInTheDocument();
      });
    });

    it("should update total when promo code is applied", async () => {
      const mockPromoResponse = {
        valid: true,
        discountAmount: 5.0,
      };
      vi.mocked(orderService.validatePromo).mockResolvedValue(
        mockPromoResponse,
      );

      render(<CheckoutPage />);

      // Navigate to details step
      const proceedButton = screen.getByRole("button", {
        name: /proceed to delivery/i,
      });
      fireEvent.click(proceedButton);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText("Enter promo code"),
        ).toBeInTheDocument();
      });

      // Original total: 25 (subtotal) + 4.99 (delivery) + 2.5 (service) = 32.49
      const originalTotal = 32.49;

      // Apply promo code
      const promoInput = screen.getByPlaceholderText("Enter promo code");
      const applyButton = screen.getByRole("button", { name: /apply/i });

      fireEvent.change(promoInput, { target: { value: "SAVE10" } });
      fireEvent.click(applyButton);

      await waitFor(() => {
        // New total: 32.49 - 5.00 = 27.49
        const expectedTotal = (originalTotal - 5.0).toFixed(2);
        expect(screen.getByText(`$${expectedTotal}`)).toBeInTheDocument();
      });
    });

    it("should remove discount when promo code is removed", async () => {
      const mockPromoResponse = {
        valid: true,
        discountAmount: 5.0,
      };
      vi.mocked(orderService.validatePromo).mockResolvedValue(
        mockPromoResponse,
      );

      render(<CheckoutPage />);

      // Navigate to details step
      const proceedButton = screen.getByRole("button", {
        name: /proceed to delivery/i,
      });
      fireEvent.click(proceedButton);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText("Enter promo code"),
        ).toBeInTheDocument();
      });

      // Apply promo code
      const promoInput = screen.getByPlaceholderText("Enter promo code");
      const applyButton = screen.getByRole("button", { name: /apply/i });

      fireEvent.change(promoInput, { target: { value: "SAVE10" } });
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(screen.getByText(/you saved/i)).toBeInTheDocument();
      });

      // Remove promo code
      const removeButtons = screen.getAllByRole("button");
      const removeButton = removeButtons.find((btn) =>
        btn.querySelector("svg"),
      );
      if (removeButton) {
        fireEvent.click(removeButton);
      }

      await waitFor(() => {
        expect(screen.queryByText(/discount/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("Promo Code in Order Creation", () => {
    it("should include promo code in order creation payload", async () => {
      const mockPromoResponse = {
        valid: true,
        discountAmount: 5.0,
      };
      vi.mocked(orderService.validatePromo).mockResolvedValue(
        mockPromoResponse,
      );

      mockCreateOrder.mockResolvedValue({
        id: "order-123",
        total: 27.49,
      });

      render(<CheckoutPage />);

      // Navigate to details step
      const proceedButton = screen.getByRole("button", {
        name: /proceed to delivery/i,
      });
      fireEvent.click(proceedButton);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText("Enter promo code"),
        ).toBeInTheDocument();
      });

      // Fill in required fields
      const streetInput = screen.getByPlaceholderText(/street address/i);
      const cityInput = screen.getByPlaceholderText(/city/i);
      const stateInput = screen.getByPlaceholderText(/state/i);
      const zipInput = screen.getByPlaceholderText(/zip code/i);
      const phoneInput = screen.getByPlaceholderText(/phone number/i);

      fireEvent.change(streetInput, { target: { value: "123 Main St" } });
      fireEvent.change(cityInput, { target: { value: "New York" } });
      fireEvent.change(stateInput, { target: { value: "NY" } });
      fireEvent.change(zipInput, { target: { value: "10001" } });
      fireEvent.change(phoneInput, { target: { value: "555-0123" } });

      // Apply promo code
      const promoInput = screen.getByPlaceholderText("Enter promo code");
      const applyButton = screen.getByRole("button", { name: /apply/i });

      fireEvent.change(promoInput, { target: { value: "SAVE10" } });
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(screen.getByText(/you saved/i)).toBeInTheDocument();
      });

      // Proceed to payment
      const paymentButton = screen.getByRole("button", {
        name: /proceed to payment/i,
      });
      fireEvent.click(paymentButton);

      await waitFor(() => {
        expect(mockCreateOrder).toHaveBeenCalledWith(
          expect.objectContaining({
            promoCode: "SAVE10",
          }),
        );
      });
    });

    it("should not include promo code if none is applied", async () => {
      mockCreateOrder.mockResolvedValue({
        id: "order-123",
        total: 32.49,
      });

      render(<CheckoutPage />);

      // Navigate to details step
      const proceedButton = screen.getByRole("button", {
        name: /proceed to delivery/i,
      });
      fireEvent.click(proceedButton);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText("Enter promo code"),
        ).toBeInTheDocument();
      });

      // Fill in required fields
      const streetInput = screen.getByPlaceholderText(/street address/i);
      const cityInput = screen.getByPlaceholderText(/city/i);
      const stateInput = screen.getByPlaceholderText(/state/i);
      const zipInput = screen.getByPlaceholderText(/zip code/i);
      const phoneInput = screen.getByPlaceholderText(/phone number/i);

      fireEvent.change(streetInput, { target: { value: "123 Main St" } });
      fireEvent.change(cityInput, { target: { value: "New York" } });
      fireEvent.change(stateInput, { target: { value: "NY" } });
      fireEvent.change(zipInput, { target: { value: "10001" } });
      fireEvent.change(phoneInput, { target: { value: "555-0123" } });

      // Proceed to payment without applying promo
      const paymentButton = screen.getByRole("button", {
        name: /proceed to payment/i,
      });
      fireEvent.click(paymentButton);

      await waitFor(() => {
        expect(mockCreateOrder).toHaveBeenCalledWith(
          expect.not.objectContaining({
            promoCode: expect.anything(),
          }),
        );
      });
    });
  });

  describe("Promo Code Error Scenarios", () => {
    it("should handle invalid promo code gracefully", async () => {
      const mockPromoResponse = {
        valid: false,
        discountAmount: 0,
        message: "Invalid promo code",
      };
      vi.mocked(orderService.validatePromo).mockResolvedValue(
        mockPromoResponse,
      );

      render(<CheckoutPage />);

      // Navigate to details step
      const proceedButton = screen.getByRole("button", {
        name: /proceed to delivery/i,
      });
      fireEvent.click(proceedButton);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText("Enter promo code"),
        ).toBeInTheDocument();
      });

      // Apply invalid promo code
      const promoInput = screen.getByPlaceholderText("Enter promo code");
      const applyButton = screen.getByRole("button", { name: /apply/i });

      fireEvent.change(promoInput, { target: { value: "INVALID" } });
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(screen.getByText("Invalid promo code")).toBeInTheDocument();
      });

      // Discount should not be applied
      expect(screen.queryByText(/you saved/i)).not.toBeInTheDocument();
    });

    it("should allow order creation even if promo validation fails", async () => {
      vi.mocked(orderService.validatePromo).mockRejectedValue(
        new Error("Network error"),
      );

      mockCreateOrder.mockResolvedValue({
        id: "order-123",
        total: 32.49,
      });

      render(<CheckoutPage />);

      // Navigate to details step
      const proceedButton = screen.getByRole("button", {
        name: /proceed to delivery/i,
      });
      fireEvent.click(proceedButton);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText("Enter promo code"),
        ).toBeInTheDocument();
      });

      // Fill in required fields
      const streetInput = screen.getByPlaceholderText(/street address/i);
      const cityInput = screen.getByPlaceholderText(/city/i);
      const stateInput = screen.getByPlaceholderText(/state/i);
      const zipInput = screen.getByPlaceholderText(/zip code/i);
      const phoneInput = screen.getByPlaceholderText(/phone number/i);

      fireEvent.change(streetInput, { target: { value: "123 Main St" } });
      fireEvent.change(cityInput, { target: { value: "New York" } });
      fireEvent.change(stateInput, { target: { value: "NY" } });
      fireEvent.change(zipInput, { target: { value: "10001" } });
      fireEvent.change(phoneInput, { target: { value: "555-0123" } });

      // Try to apply promo code (will fail)
      const promoInput = screen.getByPlaceholderText("Enter promo code");
      const applyButton = screen.getByRole("button", { name: /apply/i });

      fireEvent.change(promoInput, { target: { value: "SAVE10" } });
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(
          screen.getByText(/failed to validate promo code/i),
        ).toBeInTheDocument();
      });

      // Should still be able to proceed to payment
      const paymentButton = screen.getByRole("button", {
        name: /proceed to payment/i,
      });
      expect(paymentButton).not.toBeDisabled();
    });
  });
});
