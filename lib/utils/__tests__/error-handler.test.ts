/**
 * Unit tests for error handling utilities
 * Tests error classification, message mapping, and toast integration
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { AxiosError } from "axios";
import {
  AppError,
  handleApiError,
  getErrorMessage,
  isClientError,
  isServerError,
  isNetworkError,
  shouldRetry,
  getRetrySuggestion,
  getFieldErrors,
  isErrorCode,
  isValidationError,
  isAuthError,
  showErrorToast,
  showSuccessToast,
  handleError,
} from "../error-handler";
import { useUIStore } from "../../store/ui.store";

// Mock the UI store
vi.mock("../../store/ui.store", () => ({
  useUIStore: {
    getState: vi.fn(() => ({
      addToast: vi.fn(),
    })),
  },
}));

describe("Error Handler Utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn(); // Mock console.error to avoid noise in tests
  });

  describe("AppError class", () => {
    it("should create AppError with all properties", () => {
      const error = new AppError("Test error", "TEST_CODE", 400, "email", {
        extra: "data",
      });

      expect(error.message).toBe("Test error");
      expect(error.code).toBe("TEST_CODE");
      expect(error.statusCode).toBe(400);
      expect(error.field).toBe("email");
      expect(error.details).toEqual({ extra: "data" });
      expect(error.name).toBe("AppError");
    });
  });

  describe("Error Classification", () => {
    describe("isClientError", () => {
      it("should identify 4xx status codes as client errors", () => {
        const error = new AppError("Bad request", "BAD_REQUEST", 400);
        expect(isClientError(error)).toBe(true);
      });

      it("should identify 404 as client error", () => {
        const error = new AppError("Not found", "NOT_FOUND", 404);
        expect(isClientError(error)).toBe(true);
      });

      it("should not identify 5xx as client error", () => {
        const error = new AppError("Server error", "SERVER_ERROR", 500);
        expect(isClientError(error)).toBe(false);
      });

      it("should handle AxiosError with 4xx status", () => {
        const axiosError = {
          isAxiosError: true,
          response: { status: 403 },
        } as AxiosError;

        expect(isClientError(axiosError)).toBe(true);
      });
    });

    describe("isServerError", () => {
      it("should identify 5xx status codes as server errors", () => {
        const error = new AppError("Server error", "SERVER_ERROR", 500);
        expect(isServerError(error)).toBe(true);
      });

      it("should identify 503 as server error", () => {
        const error = new AppError("Service unavailable", "UNAVAILABLE", 503);
        expect(isServerError(error)).toBe(true);
      });

      it("should not identify 4xx as server error", () => {
        const error = new AppError("Bad request", "BAD_REQUEST", 400);
        expect(isServerError(error)).toBe(false);
      });

      it("should handle AxiosError with 5xx status", () => {
        const axiosError = {
          isAxiosError: true,
          response: { status: 502 },
        } as AxiosError;

        expect(isServerError(axiosError)).toBe(true);
      });
    });

    describe("isNetworkError", () => {
      it("should identify network errors from AppError", () => {
        const error = new AppError("Network error", "NETWORK_ERROR");
        expect(isNetworkError(error)).toBe(true);
      });

      it("should identify AxiosError without response as network error", () => {
        const axiosError = {
          isAxiosError: true,
          response: undefined,
          code: "ERR_NETWORK",
        } as AxiosError;

        expect(isNetworkError(axiosError)).toBe(true);
      });

      it("should not identify timeout as network error", () => {
        const axiosError = {
          isAxiosError: true,
          response: undefined,
          code: "ECONNABORTED",
        } as AxiosError;

        expect(isNetworkError(axiosError)).toBe(false);
      });
    });
  });

  describe("handleApiError", () => {
    it("should convert AxiosError with API error response", () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 400,
          data: {
            message: "Validation failed",
            code: "VALIDATION_ERROR",
            field: "email",
            details: { email: "Invalid format" },
          },
        },
      } as AxiosError;

      const result = handleApiError(axiosError);

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe("Validation failed");
      expect(result.code).toBe("VALIDATION_ERROR");
      expect(result.statusCode).toBe(400);
      expect(result.field).toBe("email");
      expect(result.details).toEqual({ email: "Invalid format" });
    });

    it("should handle AxiosError without response (network error)", () => {
      const axiosError = {
        isAxiosError: true,
        response: undefined,
      } as AxiosError;

      const result = handleApiError(axiosError);

      expect(result.code).toBe("NETWORK_ERROR");
      expect(result.message).toContain("Network error");
    });

    it("should handle AxiosError with response but no structured error", () => {
      const axiosError = {
        isAxiosError: true,
        message: "Request failed",
        response: {
          status: 500,
          data: "Internal server error",
        },
      } as AxiosError;

      const result = handleApiError(axiosError);

      expect(result.code).toBe("HTTP_ERROR");
      expect(result.statusCode).toBe(500);
    });

    it("should handle AppError passthrough", () => {
      const appError = new AppError("Test", "TEST_CODE", 400);
      const result = handleApiError(appError);

      expect(result).toBe(appError);
    });

    it("should handle generic Error", () => {
      const error = new Error("Generic error");
      const result = handleApiError(error);

      expect(result.code).toBe("UNKNOWN_ERROR");
      expect(result.message).toBe("Generic error");
    });

    it("should handle unknown error types", () => {
      const result = handleApiError("string error");

      expect(result.code).toBe("UNKNOWN_ERROR");
      expect(result.message).toBe("An unexpected error occurred");
    });
  });

  describe("getErrorMessage", () => {
    it("should map NETWORK_ERROR to user-friendly message", () => {
      const error = new AppError("Network error", "NETWORK_ERROR");
      const message = getErrorMessage(error);

      expect(message).toBe(
        "Unable to connect. Please check your internet connection.",
      );
    });

    it("should map UNAUTHORIZED to user-friendly message", () => {
      const error = new AppError("Unauthorized", "UNAUTHORIZED", 401);
      const message = getErrorMessage(error);

      expect(message).toBe("Please log in to continue.");
    });

    it("should map VALIDATION_ERROR to user-friendly message", () => {
      const error = new AppError("Validation failed", "VALIDATION_ERROR", 400);
      const message = getErrorMessage(error);

      expect(message).toBe("Please check your input and try again.");
    });

    it("should return original message for unmapped error codes", () => {
      const error = new AppError("Custom error message", "CUSTOM_CODE");
      const message = getErrorMessage(error);

      expect(message).toBe("Custom error message");
    });

    it("should handle payment errors", () => {
      const error = new AppError("Payment failed", "PAYMENT_FAILED");
      const message = getErrorMessage(error);

      expect(message).toContain("Payment failed");
    });
  });

  describe("shouldRetry", () => {
    it("should return true for network errors", () => {
      const error = new AppError("Network error", "NETWORK_ERROR");
      expect(shouldRetry(error)).toBe(true);
    });

    it("should return true for server errors (5xx)", () => {
      const error = new AppError("Server error", "SERVER_ERROR", 500);
      expect(shouldRetry(error)).toBe(true);
    });

    it("should return false for client errors (4xx)", () => {
      const error = new AppError("Bad request", "BAD_REQUEST", 400);
      expect(shouldRetry(error)).toBe(false);
    });

    it("should return false for validation errors", () => {
      const error = new AppError("Validation failed", "VALIDATION_ERROR", 400);
      expect(shouldRetry(error)).toBe(false);
    });
  });

  describe("getRetrySuggestion", () => {
    it("should return suggestion for network errors", () => {
      const error = new AppError("Network error", "NETWORK_ERROR");
      const suggestion = getRetrySuggestion(error);

      expect(suggestion).toContain("internet connection");
    });

    it("should return suggestion for server errors", () => {
      const error = new AppError("Server error", "SERVER_ERROR", 500);
      const suggestion = getRetrySuggestion(error);

      expect(suggestion).toContain("temporary issue");
    });

    it("should return null for client errors", () => {
      const error = new AppError("Bad request", "BAD_REQUEST", 400);
      const suggestion = getRetrySuggestion(error);

      expect(suggestion).toBeNull();
    });
  });

  describe("getFieldErrors", () => {
    it("should extract field-specific error", () => {
      const error = new AppError(
        "Invalid email",
        "VALIDATION_ERROR",
        400,
        "email",
      );
      const fieldErrors = getFieldErrors(error);

      expect(fieldErrors).toEqual({ email: "Invalid email" });
    });

    it("should extract multiple field errors from details", () => {
      const error = new AppError(
        "Validation failed",
        "VALIDATION_ERROR",
        400,
        undefined,
        {
          email: "Invalid email format",
          password: "Password too short",
        },
      );
      const fieldErrors = getFieldErrors(error);

      expect(fieldErrors).toEqual({
        email: "Invalid email format",
        password: "Password too short",
      });
    });

    it("should return null when no field errors exist", () => {
      const error = new AppError("Server error", "SERVER_ERROR", 500);
      const fieldErrors = getFieldErrors(error);

      expect(fieldErrors).toBeNull();
    });
  });

  describe("Error Type Checks", () => {
    it("should check for specific error code", () => {
      const error = new AppError("Unauthorized", "UNAUTHORIZED", 401);
      expect(isErrorCode(error, "UNAUTHORIZED")).toBe(true);
      expect(isErrorCode(error, "NOT_FOUND")).toBe(false);
    });

    it("should identify validation errors", () => {
      expect(
        isValidationError(
          new AppError("Validation failed", "VALIDATION_ERROR"),
        ),
      ).toBe(true);
      expect(
        isValidationError(new AppError("Invalid input", "INVALID_INPUT")),
      ).toBe(true);
      expect(
        isValidationError(new AppError("Server error", "SERVER_ERROR")),
      ).toBe(false);
    });

    it("should identify authentication errors", () => {
      expect(isAuthError(new AppError("Unauthorized", "UNAUTHORIZED"))).toBe(
        true,
      );
      expect(isAuthError(new AppError("Token expired", "TOKEN_EXPIRED"))).toBe(
        true,
      );
      expect(
        isAuthError(new AppError("Invalid credentials", "INVALID_CREDENTIALS")),
      ).toBe(true);
      expect(isAuthError(new AppError("Not found", "NOT_FOUND"))).toBe(false);
    });
  });

  describe("Toast Integration", () => {
    it("should show error toast with correct parameters", () => {
      const mockAddToast = vi.fn();
      vi.mocked(useUIStore.getState).mockReturnValue({
        addToast: mockAddToast,
      } as any);

      const error = new AppError("Test error", "TEST_CODE");
      showErrorToast(error);

      expect(mockAddToast).toHaveBeenCalledWith({
        type: "error",
        message: "Test error",
        duration: 5000,
      });
    });

    it("should show success toast", () => {
      const mockAddToast = vi.fn();
      vi.mocked(useUIStore.getState).mockReturnValue({
        addToast: mockAddToast,
      } as any);

      showSuccessToast("Operation successful");

      expect(mockAddToast).toHaveBeenCalledWith({
        type: "success",
        message: "Operation successful",
        duration: 3000,
      });
    });

    it("should use custom duration for toasts", () => {
      const mockAddToast = vi.fn();
      vi.mocked(useUIStore.getState).mockReturnValue({
        addToast: mockAddToast,
      } as any);

      showSuccessToast("Success", 10000);

      expect(mockAddToast).toHaveBeenCalledWith({
        type: "success",
        message: "Success",
        duration: 10000,
      });
    });
  });

  describe("handleError", () => {
    it("should handle error with toast and logging", () => {
      const mockAddToast = vi.fn();
      vi.mocked(useUIStore.getState).mockReturnValue({
        addToast: mockAddToast,
      } as any);

      const error = new Error("Test error");
      const result = handleError(error);

      expect(result).toBeInstanceOf(AppError);
      expect(mockAddToast).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });

    it("should skip toast when showToast is false", () => {
      const mockAddToast = vi.fn();
      vi.mocked(useUIStore.getState).mockReturnValue({
        addToast: mockAddToast,
      } as any);

      const error = new Error("Test error");
      handleError(error, { showToast: false });

      expect(mockAddToast).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });

    it("should include context in error logging", () => {
      const mockAddToast = vi.fn();
      vi.mocked(useUIStore.getState).mockReturnValue({
        addToast: mockAddToast,
      } as any);

      const error = new Error("Test error");
      const context = {
        operation: "login",
        userId: "123",
        metadata: { attempt: 1 },
      };

      handleError(error, { context });

      expect(console.error).toHaveBeenCalledWith(
        "Application Error:",
        expect.objectContaining({
          context,
        }),
      );
    });
  });
});
