"use client";

/**
 * Error Handler Hook
 * Provides utilities for handling errors in React components
 * Validates: Requirements 21.3, 21.6
 */

import { useCallback, useState } from "react";
import {
  handleError as handleErrorUtil,
  getFieldErrors,
  isNetworkError,
  AppError,
} from "@/lib/utils/error-handler";

interface UseErrorHandlerOptions {
  onError?: (error: AppError) => void;
  showToast?: boolean;
}

interface UseErrorHandlerReturn {
  error: AppError | null;
  fieldErrors: Record<string, string> | null;
  isNetworkError: boolean;
  handleError: (error: unknown) => void;
  clearError: () => void;
  setFieldError: (field: string, message: string) => void;
  clearFieldError: (field: string) => void;
}

/**
 * Hook for handling errors in components
 * Provides error state management and field-level error handling
 */
export function useErrorHandler(
  options: UseErrorHandlerOptions = {},
): UseErrorHandlerReturn {
  const [error, setError] = useState<AppError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(
    null,
  );

  const handleError = useCallback(
    (err: unknown) => {
      const appError = handleErrorUtil(err, {
        showToast: options.showToast,
      });

      setError(appError);

      // Extract field-specific errors
      const fields = getFieldErrors(err);
      if (fields) {
        setFieldErrors(fields);
      }

      // Call custom error handler if provided
      if (options.onError) {
        options.onError(appError);
      }
    },
    [options],
  );

  const clearError = useCallback(() => {
    setError(null);
    setFieldErrors(null);
  }, []);

  const setFieldError = useCallback((field: string, message: string) => {
    setFieldErrors((prev) => ({
      ...prev,
      [field]: message,
    }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      if (!prev) return null;
      const { [field]: _, ...rest } = prev;
      return Object.keys(rest).length > 0 ? rest : null;
    });
  }, []);

  return {
    error,
    fieldErrors,
    isNetworkError: error ? isNetworkError(error) : false,
    handleError,
    clearError,
    setFieldError,
    clearFieldError,
  };
}
