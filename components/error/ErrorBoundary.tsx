"use client";

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the component tree
 * Validates: Requirements 21.3, 21.6
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import { logError } from "@/lib/utils/error-handler";
import { createLogger } from "@/lib/utils/logger";
import { ErrorFallback } from "./ErrorFallback";

// Create logger for error boundary
const logger = createLogger({ component: "ErrorBoundary" });

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: "root" | "page" | "section";
  resetKeys?: Array<string | number>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component that catches errors in child components
 * and displays a fallback UI instead of crashing the entire app
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error using structured logger
    logger.error(
      "Component error caught by ErrorBoundary",
      {
        level: this.props.level || "section",
        componentStack: errorInfo.componentStack,
        errorName: error.name,
        errorMessage: error.message,
      },
      error,
    );

    // Also use error handler for additional logging
    logError(error, {
      operation: "ErrorBoundary.componentDidCatch",
      metadata: {
        componentStack: errorInfo.componentStack,
        level: this.props.level || "section",
      },
    });

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Reset error boundary when resetKeys change
    if (this.state.hasError && this.props.resetKeys) {
      const prevKeys = prevProps.resetKeys || [];
      const currentKeys = this.props.resetKeys;

      // Check if any reset key has changed
      const hasResetKeyChanged =
        prevKeys.length !== currentKeys.length ||
        prevKeys.some((key, index) => key !== currentKeys[index]);

      if (hasResetKeyChanged) {
        this.reset();
      }
    }
  }

  reset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Use default fallback UI
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.reset}
          level={this.props.level || "section"}
        />
      );
    }

    return this.props.children;
  }
}
