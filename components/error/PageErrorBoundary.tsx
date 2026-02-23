"use client";

/**
 * Page-level Error Boundary Wrapper
 * Wraps page content with error boundary for page-level error catching
 * Validates: Requirements 21.3, 21.6
 */

import React, { ReactNode } from "react";
import { ErrorBoundary } from "./ErrorBoundary";

interface PageErrorBoundaryProps {
  children: ReactNode;
  pageName?: string;
}

/**
 * Wrapper component for page-level error boundaries
 * Use this to wrap entire page content
 */
export function PageErrorBoundary({
  children,
  pageName,
}: PageErrorBoundaryProps) {
  return (
    <ErrorBoundary
      level="page"
      onError={(error, errorInfo) => {
        // Additional page-level error handling
        console.error(`Error in page: ${pageName || "Unknown"}`, {
          error,
          errorInfo,
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
