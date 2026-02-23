/**
 * RateOrderModal Component Tests
 *
 * Tests for the order rating modal component
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RateOrderModal } from "../RateOrderModal";

describe("RateOrderModal", () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when isOpen is false", () => {
    const { container } = render(
      <RateOrderModal
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("should render when isOpen is true", () => {
    render(
      <RateOrderModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />,
    );

    expect(screen.getByText("Rate Your Order")).toBeInTheDocument();
    expect(screen.getByText(/How was your experience/i)).toBeInTheDocument();
  });

  it("should display 5 star buttons", () => {
    render(
      <RateOrderModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />,
    );

    const starButtons = screen.getAllByRole("button").filter((button) => {
      const svg = button.querySelector("svg");
      return svg?.classList.contains("lucide-star");
    });

    expect(starButtons).toHaveLength(5);
  });

  it("should update rating when star is clicked", () => {
    render(
      <RateOrderModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />,
    );

    const starButtons = screen.getAllByRole("button").filter((button) => {
      const svg = button.querySelector("svg");
      return svg?.classList.contains("lucide-star");
    });

    // Click the 4th star
    fireEvent.click(starButtons[3]);

    // Check if "Very Good" label appears
    expect(screen.getByText("Very Good")).toBeInTheDocument();
  });

  it("should allow entering review text", () => {
    render(
      <RateOrderModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />,
    );

    const textarea = screen.getByPlaceholderText(
      /Tell us more about your experience/i,
    );
    fireEvent.change(textarea, { target: { value: "Great food!" } });

    expect(textarea).toHaveValue("Great food!");
  });

  it("should call onConfirm with rating and review when submitted", async () => {
    render(
      <RateOrderModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />,
    );

    // Select 5 stars
    const starButtons = screen.getAllByRole("button").filter((button) => {
      const svg = button.querySelector("svg");
      return svg?.classList.contains("lucide-star");
    });
    fireEvent.click(starButtons[4]);

    // Enter review
    const textarea = screen.getByPlaceholderText(
      /Tell us more about your experience/i,
    );
    fireEvent.change(textarea, { target: { value: "Excellent service!" } });

    // Submit form
    const submitButton = screen.getByText("Submit Rating");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledWith(5, "Excellent service!");
    });
  });

  it("should call onConfirm with rating only when review is empty", async () => {
    render(
      <RateOrderModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />,
    );

    // Select 3 stars
    const starButtons = screen.getAllByRole("button").filter((button) => {
      const svg = button.querySelector("svg");
      return svg?.classList.contains("lucide-star");
    });
    fireEvent.click(starButtons[2]);

    // Submit without review
    const submitButton = screen.getByText("Submit Rating");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledWith(3, undefined);
    });
  });

  it("should disable submit button when no rating is selected", () => {
    render(
      <RateOrderModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />,
    );

    const submitButton = screen.getByText("Submit Rating");
    expect(submitButton).toBeDisabled();
  });

  it("should call onClose when cancel button is clicked", () => {
    render(
      <RateOrderModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />,
    );

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("should call onClose when close icon is clicked", () => {
    render(
      <RateOrderModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />,
    );

    const closeButtons = screen.getAllByRole("button");
    const closeIcon = closeButtons.find((button) => {
      const svg = button.querySelector("svg");
      return svg?.classList.contains("lucide-x");
    });

    if (closeIcon) {
      fireEvent.click(closeIcon);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it("should disable all interactions when isLoading is true", () => {
    render(
      <RateOrderModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isLoading={true}
      />,
    );

    // Check if star buttons are disabled
    const starButtons = screen.getAllByRole("button").filter((button) => {
      const svg = button.querySelector("svg");
      return svg?.classList.contains("lucide-star");
    });
    starButtons.forEach((button) => {
      expect(button).toBeDisabled();
    });

    // Check if textarea is disabled
    const textarea = screen.getByPlaceholderText(
      /Tell us more about your experience/i,
    );
    expect(textarea).toBeDisabled();

    // Check if submit button shows loading state
    expect(screen.getByText("Submitting...")).toBeInTheDocument();
  });

  it("should enforce 500 character limit on review", () => {
    render(
      <RateOrderModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />,
    );

    const textarea = screen.getByPlaceholderText(
      /Tell us more about your experience/i,
    ) as HTMLTextAreaElement;

    expect(textarea.maxLength).toBe(500);
  });
});
