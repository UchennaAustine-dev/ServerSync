import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PromoCodeInput } from "../PromoCodeInput";
import { orderService } from "@/lib/api/services/order.service";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock the order service
vi.mock("@/lib/api/services/order.service", () => ({
  orderService: {
    validatePromo: vi.fn(),
  },
}));

describe("PromoCodeInput", () => {
  const mockOnPromoApplied = vi.fn();
  const mockOnPromoRemoved = vi.fn();
  const defaultProps = {
    restaurantId: "restaurant-123",
    subtotal: 50.0,
    onPromoApplied: mockOnPromoApplied,
    onPromoRemoved: mockOnPromoRemoved,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Initial State", () => {
    it("should render promo code input field", () => {
      render(<PromoCodeInput {...defaultProps} />);
      expect(
        screen.getByPlaceholderText("Enter promo code"),
      ).toBeInTheDocument();
    });

    it("should render apply button", () => {
      render(<PromoCodeInput {...defaultProps} />);
      expect(
        screen.getByRole("button", { name: /apply/i }),
      ).toBeInTheDocument();
    });

    it("should have apply button disabled when input is empty", () => {
      render(<PromoCodeInput {...defaultProps} />);
      const applyButton = screen.getByRole("button", { name: /apply/i });
      expect(applyButton).toBeDisabled();
    });
  });

  describe("Promo Code Validation", () => {
    it("should validate promo code on apply button click", async () => {
      const mockResponse = {
        valid: true,
        discountAmount: 5.0,
        message: "Promo code applied successfully",
      };
      vi.mocked(orderService.validatePromo).mockResolvedValue(mockResponse);

      render(<PromoCodeInput {...defaultProps} />);

      const input = screen.getByPlaceholderText("Enter promo code");
      const applyButton = screen.getByRole("button", { name: /apply/i });

      fireEvent.change(input, { target: { value: "SAVE10" } });
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(orderService.validatePromo).toHaveBeenCalledWith({
          promoCode: "SAVE10",
          restaurantId: "restaurant-123",
          subtotal: 50.0,
        });
      });

      await waitFor(() => {
        expect(mockOnPromoApplied).toHaveBeenCalledWith({
          ...mockResponse,
          code: "SAVE10",
        });
      });
    });

    it("should convert promo code to uppercase", async () => {
      const mockResponse = {
        valid: true,
        discountAmount: 5.0,
      };
      vi.mocked(orderService.validatePromo).mockResolvedValue(mockResponse);

      render(<PromoCodeInput {...defaultProps} />);

      const input = screen.getByPlaceholderText("Enter promo code");
      fireEvent.change(input, { target: { value: "save10" } });

      expect(input).toHaveValue("SAVE10");
    });

    it("should validate promo code on Enter key press", async () => {
      const mockResponse = {
        valid: true,
        discountAmount: 5.0,
      };
      vi.mocked(orderService.validatePromo).mockResolvedValue(mockResponse);

      render(<PromoCodeInput {...defaultProps} />);

      const input = screen.getByPlaceholderText("Enter promo code");
      fireEvent.change(input, { target: { value: "SAVE10" } });
      fireEvent.keyPress(input, { key: "Enter", code: "Enter", charCode: 13 });

      await waitFor(() => {
        expect(orderService.validatePromo).toHaveBeenCalled();
      });
    });

    it("should show loading state during validation", async () => {
      vi.mocked(orderService.validatePromo).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );

      render(<PromoCodeInput {...defaultProps} />);

      const input = screen.getByPlaceholderText("Enter promo code");
      const applyButton = screen.getByRole("button", { name: /apply/i });

      fireEvent.change(input, { target: { value: "SAVE10" } });
      fireEvent.click(applyButton);

      expect(screen.getByText(/validating/i)).toBeInTheDocument();
      expect(applyButton).toBeDisabled();
    });
  });

  describe("Error Handling", () => {
    it("should display error message for invalid promo code", async () => {
      const mockResponse = {
        valid: false,
        discountAmount: 0,
        message: "Invalid promo code",
      };
      vi.mocked(orderService.validatePromo).mockResolvedValue(mockResponse);

      render(<PromoCodeInput {...defaultProps} />);

      const input = screen.getByPlaceholderText("Enter promo code");
      const applyButton = screen.getByRole("button", { name: /apply/i });

      fireEvent.change(input, { target: { value: "INVALID" } });
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(screen.getByText("Invalid promo code")).toBeInTheDocument();
      });

      expect(mockOnPromoApplied).not.toHaveBeenCalled();
    });

    it("should display error message for expired promo code", async () => {
      const mockResponse = {
        valid: false,
        discountAmount: 0,
        message: "Promo code has expired",
      };
      vi.mocked(orderService.validatePromo).mockResolvedValue(mockResponse);

      render(<PromoCodeInput {...defaultProps} />);

      const input = screen.getByPlaceholderText("Enter promo code");
      const applyButton = screen.getByRole("button", { name: /apply/i });

      fireEvent.change(input, { target: { value: "EXPIRED" } });
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(screen.getByText("Promo code has expired")).toBeInTheDocument();
      });
    });

    it("should display error when validation request fails", async () => {
      const mockError = {
        response: {
          data: {
            message: "Failed to validate promo code",
          },
        },
      };
      vi.mocked(orderService.validatePromo).mockRejectedValue(mockError);

      render(<PromoCodeInput {...defaultProps} />);

      const input = screen.getByPlaceholderText("Enter promo code");
      const applyButton = screen.getByRole("button", { name: /apply/i });

      fireEvent.change(input, { target: { value: "SAVE10" } });
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(
          screen.getByText("Failed to validate promo code"),
        ).toBeInTheDocument();
      });
    });

    it("should display generic error when validation fails without message", async () => {
      vi.mocked(orderService.validatePromo).mockRejectedValue(new Error());

      render(<PromoCodeInput {...defaultProps} />);

      const input = screen.getByPlaceholderText("Enter promo code");
      const applyButton = screen.getByRole("button", { name: /apply/i });

      fireEvent.change(input, { target: { value: "SAVE10" } });
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(
          screen.getByText(/failed to validate promo code/i),
        ).toBeInTheDocument();
      });
    });

    it("should show error when trying to apply empty promo code", async () => {
      render(<PromoCodeInput {...defaultProps} />);

      const applyButton = screen.getByRole("button", { name: /apply/i });

      // Input is empty, button should be disabled
      expect(applyButton).toBeDisabled();
    });

    it("should clear error when user types after error", async () => {
      const mockResponse = {
        valid: false,
        discountAmount: 0,
        message: "Invalid promo code",
      };
      vi.mocked(orderService.validatePromo).mockResolvedValue(mockResponse);

      render(<PromoCodeInput {...defaultProps} />);

      const input = screen.getByPlaceholderText("Enter promo code");
      const applyButton = screen.getByRole("button", { name: /apply/i });

      // Apply invalid code
      fireEvent.change(input, { target: { value: "INVALID" } });
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(screen.getByText("Invalid promo code")).toBeInTheDocument();
      });

      // Type new code
      fireEvent.change(input, { target: { value: "NEWCODE" } });

      // Error should be cleared
      expect(screen.queryByText("Invalid promo code")).not.toBeInTheDocument();
    });
  });

  describe("Applied Promo Code Display", () => {
    it("should display applied promo code with discount amount", () => {
      const appliedPromo = {
        valid: true,
        discountAmount: 5.0,
        code: "SAVE10",
      };

      render(<PromoCodeInput {...defaultProps} appliedPromo={appliedPromo} />);

      expect(screen.getByText("SAVE10")).toBeInTheDocument();
      expect(screen.getByText(/you saved \$5\.00/i)).toBeInTheDocument();
    });

    it("should show remove button for applied promo code", () => {
      const appliedPromo = {
        valid: true,
        discountAmount: 5.0,
        code: "SAVE10",
      };

      render(<PromoCodeInput {...defaultProps} appliedPromo={appliedPromo} />);

      const removeButton = screen.getByRole("button");
      expect(removeButton).toBeInTheDocument();
    });

    it("should call onPromoRemoved when remove button is clicked", () => {
      const appliedPromo = {
        valid: true,
        discountAmount: 5.0,
        code: "SAVE10",
      };

      render(<PromoCodeInput {...defaultProps} appliedPromo={appliedPromo} />);

      const removeButton = screen.getByRole("button");
      fireEvent.click(removeButton);

      expect(mockOnPromoRemoved).toHaveBeenCalled();
    });

    it("should not show input field when promo is applied", () => {
      const appliedPromo = {
        valid: true,
        discountAmount: 5.0,
        code: "SAVE10",
      };

      render(<PromoCodeInput {...defaultProps} appliedPromo={appliedPromo} />);

      expect(
        screen.queryByPlaceholderText("Enter promo code"),
      ).not.toBeInTheDocument();
    });
  });

  describe("Discount Calculation", () => {
    it("should display correct discount amount for valid promo", async () => {
      const mockResponse = {
        valid: true,
        discountAmount: 10.5,
      };
      vi.mocked(orderService.validatePromo).mockResolvedValue(mockResponse);

      render(<PromoCodeInput {...defaultProps} />);

      const input = screen.getByPlaceholderText("Enter promo code");
      const applyButton = screen.getByRole("button", { name: /apply/i });

      fireEvent.change(input, { target: { value: "SAVE20" } });
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(mockOnPromoApplied).toHaveBeenCalledWith(
          expect.objectContaining({
            discountAmount: 10.5,
          }),
        );
      });
    });

    it("should handle zero discount amount", async () => {
      const mockResponse = {
        valid: true,
        discountAmount: 0,
      };
      vi.mocked(orderService.validatePromo).mockResolvedValue(mockResponse);

      render(<PromoCodeInput {...defaultProps} />);

      const input = screen.getByPlaceholderText("Enter promo code");
      const applyButton = screen.getByRole("button", { name: /apply/i });

      fireEvent.change(input, { target: { value: "NODISCOUNT" } });
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(mockOnPromoApplied).toHaveBeenCalledWith(
          expect.objectContaining({
            discountAmount: 0,
          }),
        );
      });
    });
  });
});
