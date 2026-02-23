/**
 * useErrorHandler Hook Tests
 * Tests error handling hook functionality
 */

import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useErrorHandler } from "../useErrorHandler";

// Mock the error handler utility
vi.mock("@/lib/utils/error-handler", async () => {
  const actual = await vi.importActual("@/lib/utils/error-handler");

  class MockAppError extends Error {
    constructor(
      message: string,
      public code: string,
      public statusCode?: number,
      public field?: string,
      public details?: Record<string, any>,
    ) {
      super(message);
      this.name = "AppError";
    }
  }

  return {
    ...actual,
    AppError: MockAppError,
    handleError: vi.fn((error) => {
      if (error instanceof Error) {
        return new MockAppError(error.message, "TEST_ERROR");
      }
      return new MockAppError("Unknown error", "UNKNOWN_ERROR");
    }),
    getFieldErrors: vi.fn((error) => {
      if (error instanceof Error && error.message.includes("validation")) {
        return { email: "Invalid email" };
      }
      return null;
    }),
    isNetworkError: vi.fn((error) => {
      return error instanceof Error && error.message.includes("network");
    }),
  };
});

describe("useErrorHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with null error and fieldErrors", () => {
    const { result } = renderHook(() => useErrorHandler());

    expect(result.current.error).toBeNull();
    expect(result.current.fieldErrors).toBeNull();
    expect(result.current.isNetworkError).toBe(false);
  });

  it("handles error and sets error state", () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handleError(new Error("Test error"));
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.error?.message).toBe("Test error");
  });

  it("extracts field errors from validation errors", () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handleError(new Error("validation error"));
    });

    expect(result.current.fieldErrors).toEqual({ email: "Invalid email" });
  });

  it("detects network errors", () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handleError(new Error("network error"));
    });

    expect(result.current.isNetworkError).toBe(true);
  });

  it("clears error state", () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handleError(new Error("Test error"));
    });

    expect(result.current.error).not.toBeNull();

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.fieldErrors).toBeNull();
  });

  it("sets field error", () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.setFieldError("username", "Username is required");
    });

    expect(result.current.fieldErrors).toEqual({
      username: "Username is required",
    });
  });

  it("clears specific field error", () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.setFieldError("username", "Username is required");
      result.current.setFieldError("email", "Email is required");
    });

    expect(result.current.fieldErrors).toEqual({
      username: "Username is required",
      email: "Email is required",
    });

    act(() => {
      result.current.clearFieldError("username");
    });

    expect(result.current.fieldErrors).toEqual({
      email: "Email is required",
    });
  });

  it("clears all field errors when last field is cleared", () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.setFieldError("username", "Username is required");
    });

    act(() => {
      result.current.clearFieldError("username");
    });

    expect(result.current.fieldErrors).toBeNull();
  });

  it("calls custom onError callback", () => {
    const onError = vi.fn();
    const { result } = renderHook(() => useErrorHandler({ onError }));

    act(() => {
      result.current.handleError(new Error("Test error"));
    });

    expect(onError).toHaveBeenCalledTimes(1);
  });

  it("respects showToast option", () => {
    const { result } = renderHook(() => useErrorHandler({ showToast: false }));

    act(() => {
      result.current.handleError(new Error("Test error"));
    });

    // Error should still be set
    expect(result.current.error).not.toBeNull();
  });
});
