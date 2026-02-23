/**
 * Error Boundary Component Tests
 * Tests error catching and fallback UI rendering
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  vi,
  beforeEach,
} from "vitest";
import { ErrorBoundary } from "../ErrorBoundary";
import { ErrorFallback } from "../ErrorFallback";

// Mock Next.js router
const mockPush = vi.fn();
const mockBack = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

// Component that throws an error
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>No error</div>;
}

describe("ErrorBoundary", () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  beforeEach(() => {
    mockPush.mockClear();
    mockBack.mockClear();
  });

  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>,
    );

    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("renders fallback UI when error is caught", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(
      screen.getByText(/unable to load this section/i),
    ).toBeInTheDocument();
  });

  it("renders custom fallback when provided", () => {
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Custom fallback")).toBeInTheDocument();
  });

  it("calls onError callback when error occurs", () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(onError).toHaveBeenCalled();
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
  });

  it("resets error state when reset is called", () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    // Error fallback should be shown
    expect(
      screen.getByText(/unable to load this section/i),
    ).toBeInTheDocument();

    // Click retry button to reset
    const retryButton = screen.getByRole("button", { name: /try again/i });
    fireEvent.click(retryButton);

    // Rerender with no error and reset key to trigger reset
    rerender(
      <ErrorBoundary resetKeys={["reset"]}>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>,
    );

    // Should show content again
    expect(screen.getByText("No error")).toBeInTheDocument();
  });

  it("renders different UI based on error level", () => {
    const { rerender } = render(
      <ErrorBoundary level="section">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    // Section level should show inline error
    expect(
      screen.getByText(/unable to load this section/i),
    ).toBeInTheDocument();

    rerender(
      <ErrorBoundary level="page">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    // Page level should show page error
    expect(screen.getByText(/page error/i)).toBeInTheDocument();
  });

  it("resets when resetKeys change", () => {
    const { rerender } = render(
      <ErrorBoundary resetKeys={["key1"]}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    // Error should be shown
    expect(
      screen.getByText(/unable to load this section/i),
    ).toBeInTheDocument();

    // Change reset key
    rerender(
      <ErrorBoundary resetKeys={["key2"]}>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>,
    );

    // Should reset and show content
    expect(screen.getByText("No error")).toBeInTheDocument();
  });
});

describe("ErrorFallback", () => {
  const mockError = new Error("Test error message");
  const mockErrorInfo = {
    componentStack: "at Component\n  at ErrorBoundary",
  };
  const mockOnReset = vi.fn();

  beforeEach(() => {
    mockOnReset.mockClear();
  });

  it("renders section-level error fallback", () => {
    render(
      <ErrorFallback
        error={mockError}
        errorInfo={mockErrorInfo}
        onReset={mockOnReset}
        level="section"
      />,
    );

    expect(
      screen.getByText(/unable to load this section/i),
    ).toBeInTheDocument();
  });

  it("renders page-level error fallback", () => {
    render(
      <ErrorFallback
        error={mockError}
        errorInfo={mockErrorInfo}
        onReset={mockOnReset}
        level="page"
      />,
    );

    expect(screen.getByText(/page error/i)).toBeInTheDocument();
  });

  it("renders root-level error fallback", () => {
    render(
      <ErrorFallback
        error={mockError}
        errorInfo={mockErrorInfo}
        onReset={mockOnReset}
        level="root"
      />,
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it("calls onReset when retry button is clicked", () => {
    render(
      <ErrorFallback
        error={mockError}
        errorInfo={mockErrorInfo}
        onReset={mockOnReset}
        level="section"
      />,
    );

    const retryButton = screen.getByRole("button", { name: /try again/i });
    fireEvent.click(retryButton);

    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });

  it("shows error details in development mode", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    render(
      <ErrorFallback
        error={mockError}
        errorInfo={mockErrorInfo}
        onReset={mockOnReset}
        level="root"
      />,
    );

    expect(screen.getByText(/test error message/i)).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it("provides navigation options for page and root levels", () => {
    render(
      <ErrorFallback
        error={mockError}
        errorInfo={mockErrorInfo}
        onReset={mockOnReset}
        level="page"
      />,
    );

    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /go back/i }),
    ).toBeInTheDocument();
  });
});
