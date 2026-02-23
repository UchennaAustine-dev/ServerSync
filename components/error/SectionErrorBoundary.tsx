"use client";

/**
 * Section-level Error Boundary Wrapper
 * Wraps component sections with error boundary for granular error catching
 * Validates: Requirements 21.3, 21.6
 */

import React, { ReactNode } from "react";
import { ErrorBoundary } from "./ErrorBoundary";

interface SectionErrorBoundaryProps {
  children: ReactNode;
  sectionName?: string;
  fallback?: ReactNode;
}

/**
 * Wrapper component for section-level error boundaries
 * Use this to wrap individual sections or complex components
 */
export function SectionErrorBoundary({
  children,
  sectionName,
  fallback,
}: SectionErrorBoundaryProps) {
  return (
    <ErrorBoundary
      level="section"
      fallback={fallback}
      onError={(error, errorInfo) => {
        // Additional section-level error handling
        console.error(`Error in section: ${sectionName || "Unknown"}`, {
          error,
          errorInfo,
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
