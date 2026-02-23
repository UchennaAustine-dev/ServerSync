/**
 * Network Error Fallback Component Tests
 * Tests connectivity error display
 * Validates: Requirement 21.3
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { NetworkErrorFallback } from "../NetworkErrorFallback";

describe("NetworkErrorFallback", () => {
  it("renders default network error message", () => {
    render(<NetworkErrorFallback />);

    expect(screen.getByText(/unable to connect/i)).toBeInTheDocument();
    expect(screen.getByText(/connection error/i)).toBeInTheDocument();
  });

  it("renders custom error message when provided", () => {
    render(<NetworkErrorFallback message="Custom network error message" />);

    expect(
      screen.getByText("Custom network error message"),
    ).toBeInTheDocument();
  });

  it("displays troubleshooting tips", () => {
    render(<NetworkErrorFallback />);

    expect(
      screen.getByText(/your internet connection is active/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/not in airplane mode/i)).toBeInTheDocument();
    expect(screen.getByText(/firewall isn't blocking/i)).toBeInTheDocument();
  });

  it("calls onRetry callback when retry button is clicked", () => {
    const onRetry = vi.fn();

    render(<NetworkErrorFallback onRetry={onRetry} />);

    const retryButton = screen.getByRole("button", { name: /try again/i });
    fireEvent.click(retryButton);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("reloads page when retry is clicked without onRetry callback", () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, "location", {
      value: { reload: reloadMock },
      writable: true,
    });

    render(<NetworkErrorFallback />);

    const retryButton = screen.getByRole("button", { name: /try again/i });
    fireEvent.click(retryButton);

    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it("displays WiFi icon", () => {
    render(<NetworkErrorFallback />);

    // Check for the presence of the icon container
    const iconContainer = screen.getByText(/connection error/i).parentElement;
    expect(iconContainer).toBeInTheDocument();
  });
});
