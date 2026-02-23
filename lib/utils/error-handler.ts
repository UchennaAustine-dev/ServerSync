/**
 * Error handling utilities for API errors and user feedback
 * Validates: Requirements 21.1, 21.2, 21.4, 21.5, 21.8
 */

import { AxiosError } from "axios";
import type { ApiError } from "../api/types/common.types";
import { useUIStore } from "../store/ui.store";
import { createLogger } from "./logger";

// Create logger for error handler
const logger = createLogger({ component: "ErrorHandler" });

/**
 * Custom application error class with additional context
 */
export class AppError extends Error {
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

/**
 * Error classification functions
 */

/**
 * Check if error is a client error (4xx status code)
 */
export function isClientError(error: unknown): boolean {
  if (error && typeof error === "object" && "isAxiosError" in error) {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status;
    return status !== undefined && status >= 400 && status < 500;
  }
  if (error instanceof AppError) {
    return (
      error.statusCode !== undefined &&
      error.statusCode >= 400 &&
      error.statusCode < 500
    );
  }
  return false;
}

/**
 * Check if error is a server error (5xx status code)
 */
export function isServerError(error: unknown): boolean {
  if (error && typeof error === "object" && "isAxiosError" in error) {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status;
    return status !== undefined && status >= 500;
  }
  if (error instanceof AppError) {
    return error.statusCode !== undefined && error.statusCode >= 500;
  }
  return false;
}

/**
 * Check if error is a network error (no response from server)
 */
export function isNetworkError(error: unknown): boolean {
  if (error && typeof error === "object" && "isAxiosError" in error) {
    const axiosError = error as AxiosError;
    return !axiosError.response && axiosError.code !== "ECONNABORTED";
  }
  if (error instanceof AppError) {
    return error.code === "NETWORK_ERROR";
  }
  return false;
}

/**
 * Convert any error to AppError with proper classification
 */
export function handleApiError(error: unknown): AppError {
  if (error && typeof error === "object" && "isAxiosError" in error) {
    const axiosError = error as AxiosError;
    const apiError = axiosError.response?.data as ApiError | undefined;
    const statusCode = axiosError.response?.status;

    // Backend returned structured error
    if (apiError && apiError.message && apiError.code) {
      return new AppError(
        apiError.message,
        apiError.code,
        statusCode,
        apiError.field,
        apiError.details,
      );
    }

    // Network error (no response)
    if (!axiosError.response) {
      return new AppError(
        "Network error. Please check your connection.",
        "NETWORK_ERROR",
      );
    }

    // Generic HTTP error with status code
    return new AppError(
      axiosError.message || "An error occurred",
      "HTTP_ERROR",
      statusCode,
    );
  }

  // Already an AppError
  if (error instanceof AppError) {
    return error;
  }

  // Generic Error
  if (error instanceof Error) {
    return new AppError(error.message, "UNKNOWN_ERROR");
  }

  // Unknown error type
  return new AppError("An unexpected error occurred", "UNKNOWN_ERROR");
}

/**
 * Map error codes and status codes to user-friendly messages
 */
export function getErrorMessage(error: unknown): string {
  const appError = handleApiError(error);

  // Map common error codes to user-friendly messages
  const errorMessages: Record<string, string> = {
    // Network errors
    NETWORK_ERROR: "Unable to connect. Please check your internet connection.",

    // Authentication errors
    UNAUTHORIZED: "Please log in to continue.",
    INVALID_CREDENTIALS: "Invalid email or password.",
    TOKEN_EXPIRED: "Your session has expired. Please log in again.",
    TOKEN_INVALID: "Your session is invalid. Please log in again.",

    // Authorization errors
    FORBIDDEN: "You do not have permission to perform this action.",
    ACCESS_DENIED: "Access denied. You don't have the required permissions.",

    // Resource errors
    NOT_FOUND: "The requested resource was not found.",
    RESOURCE_NOT_FOUND: "The requested item could not be found.",

    // Validation errors
    VALIDATION_ERROR: "Please check your input and try again.",
    INVALID_INPUT: "The provided information is invalid.",
    MISSING_REQUIRED_FIELD: "Please fill in all required fields.",

    // Business logic errors
    ITEM_UNAVAILABLE: "This item is currently unavailable.",
    RESTAURANT_CLOSED: "This restaurant is currently closed.",
    ORDER_ALREADY_ACCEPTED:
      "This order has already been accepted by another driver.",
    INSUFFICIENT_BALANCE: "Insufficient balance to complete this transaction.",
    PROMO_CODE_INVALID: "The promo code is invalid or has expired.",
    PROMO_CODE_EXPIRED: "This promo code has expired.",

    // Payment errors
    PAYMENT_FAILED:
      "Payment failed. Please try again or use a different payment method.",
    PAYMENT_DECLINED:
      "Your payment was declined. Please check your card details.",
    CARD_DECLINED: "Your card was declined. Please try a different card.",

    // Server errors
    SERVER_ERROR: "Something went wrong on our end. Please try again later.",
    INTERNAL_SERVER_ERROR:
      "An internal server error occurred. Please try again later.",
    SERVICE_UNAVAILABLE:
      "The service is temporarily unavailable. Please try again later.",

    // Rate limiting
    TOO_MANY_REQUESTS: "Too many requests. Please wait a moment and try again.",
    RATE_LIMIT_EXCEEDED:
      "You've made too many requests. Please try again later.",
  };

  // Return mapped message or original error message
  return errorMessages[appError.code] || appError.message;
}

/**
 * Determine if an error should trigger a retry
 */
export function shouldRetry(error: unknown): boolean {
  const appError = handleApiError(error);

  // Don't retry client errors (4xx) - these are user/input errors
  if (isClientError(error)) {
    return false;
  }

  // Retry network errors and server errors (5xx)
  return isNetworkError(error) || isServerError(error);
}

/**
 * Get retry suggestion message for user
 */
export function getRetrySuggestion(error: unknown): string | null {
  if (!shouldRetry(error)) {
    return null;
  }

  if (isNetworkError(error)) {
    return "Please check your internet connection and try again.";
  }

  if (isServerError(error)) {
    return "This appears to be a temporary issue. Please try again in a moment.";
  }

  return "Please try again.";
}

/**
 * Log error to console with context information
 * In production, this could be extended to send to error tracking service
 */
export function logError(
  error: unknown,
  context?: {
    operation?: string;
    userId?: string;
    metadata?: Record<string, any>;
  },
): void {
  const appError = handleApiError(error);

  // Use logger utility for structured logging
  logger.error(
    appError.message,
    {
      code: appError.code,
      statusCode: appError.statusCode,
      field: appError.field,
      details: appError.details,
      ...context,
    },
    appError,
  );

  // In production, send to error tracking service (e.g., Sentry)
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(appError, { contexts: { custom: context } });
  // }
}

/**
 * Display error as toast notification
 */
export function showErrorToast(error: unknown, duration?: number): void {
  const message = getErrorMessage(error);
  const { addToast } = useUIStore.getState();

  addToast({
    type: "error",
    message,
    duration: duration ?? 5000,
  });

  // Log error for debugging
  logError(error);
}

/**
 * Display success toast notification
 */
export function showSuccessToast(message: string, duration?: number): void {
  const { addToast } = useUIStore.getState();

  addToast({
    type: "success",
    message,
    duration: duration ?? 3000,
  });
}

/**
 * Display warning toast notification
 */
export function showWarningToast(message: string, duration?: number): void {
  const { addToast } = useUIStore.getState();

  addToast({
    type: "warning",
    message,
    duration: duration ?? 4000,
  });
}

/**
 * Display info toast notification
 */
export function showInfoToast(message: string, duration?: number): void {
  const { addToast } = useUIStore.getState();

  addToast({
    type: "info",
    message,
    duration: duration ?? 3000,
  });
}

/**
 * Handle error with automatic toast notification and logging
 * This is the main error handler to use throughout the application
 */
export function handleError(
  error: unknown,
  options?: {
    showToast?: boolean;
    context?: {
      operation?: string;
      userId?: string;
      metadata?: Record<string, any>;
    };
  },
): AppError {
  const appError = handleApiError(error);

  // Log error with context
  logError(appError, options?.context);

  // Show toast notification if requested (default: true)
  if (options?.showToast !== false) {
    showErrorToast(appError);
  }

  return appError;
}

/**
 * Extract field-specific validation errors from error details
 * Useful for displaying inline form validation errors
 */
export function getFieldErrors(error: unknown): Record<string, string> | null {
  const appError = handleApiError(error);

  // If error has a specific field, return it
  if (appError.field) {
    return {
      [appError.field]: appError.message,
    };
  }

  // If error details contain field-specific errors
  if (appError.details && typeof appError.details === "object") {
    const fieldErrors: Record<string, string> = {};

    for (const [field, message] of Object.entries(appError.details)) {
      if (typeof message === "string") {
        fieldErrors[field] = message;
      }
    }

    if (Object.keys(fieldErrors).length > 0) {
      return fieldErrors;
    }
  }

  return null;
}

/**
 * Check if error is a specific error code
 */
export function isErrorCode(error: unknown, code: string): boolean {
  const appError = handleApiError(error);
  return appError.code === code;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  return (
    isErrorCode(error, "VALIDATION_ERROR") ||
    isErrorCode(error, "INVALID_INPUT") ||
    isErrorCode(error, "MISSING_REQUIRED_FIELD")
  );
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  return (
    isErrorCode(error, "UNAUTHORIZED") ||
    isErrorCode(error, "TOKEN_EXPIRED") ||
    isErrorCode(error, "TOKEN_INVALID") ||
    isErrorCode(error, "INVALID_CREDENTIALS")
  );
}
