"use client";

/**
 * Error Fallback UI Component
 * Displays user-friendly error messages with recovery options
 * Validates: Requirements 21.3, 21.6
 */

import React, { ErrorInfo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Home, RefreshCw, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface ErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
  level: "root" | "page" | "section";
}

/**
 * Error fallback UI that displays different layouts based on error level
 */
export function ErrorFallback({
  error,
  errorInfo,
  onReset,
  level,
}: ErrorFallbackProps) {
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/");
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleRetry = () => {
    onReset();
    // Optionally reload the page for root-level errors
    if (level === "root") {
      window.location.reload();
    }
  };

  // Root-level error (full page)
  if (level === "root") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-red-100 p-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              We encountered an unexpected error. Our team has been notified and
              is working to fix the issue.
            </p>

            {process.env.NODE_ENV === "development" && (
              <div className="rounded-md bg-gray-100 p-4">
                <p className="mb-2 text-xs font-semibold text-gray-700">
                  Error Details (Development Only):
                </p>
                <p className="mb-2 text-xs text-gray-600">
                  {error.message || "Unknown error"}
                </p>
                {errorInfo?.componentStack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-gray-500">
                      Component Stack
                    </summary>
                    <pre className="mt-2 max-h-40 overflow-auto text-xs text-gray-500">
                      {errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                onClick={handleRetry}
                className="flex-1"
                variant="default"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button
                onClick={handleGoHome}
                className="flex-1"
                variant="outline"
              >
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Page-level error
  if (level === "page") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-red-100 p-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <CardTitle className="text-lg">Page Error</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              This page encountered an error. Please try refreshing or go back
              to continue.
            </p>

            {process.env.NODE_ENV === "development" && (
              <div className="rounded-md bg-gray-100 p-3">
                <p className="text-xs text-gray-600">
                  {error.message || "Unknown error"}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={handleRetry} className="flex-1" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
              <Button
                onClick={handleGoBack}
                className="flex-1"
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Section-level error (inline)
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-red-100 p-1.5">
          <AlertCircle className="h-4 w-4 text-red-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-900">
            Unable to load this section
          </h3>
          <p className="mt-1 text-xs text-red-700">
            {process.env.NODE_ENV === "development"
              ? error.message
              : "An error occurred while loading this content."}
          </p>
          <Button
            onClick={handleRetry}
            size="sm"
            variant="outline"
            className="mt-3 h-8 text-xs"
          >
            <RefreshCw className="mr-1.5 h-3 w-3" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
