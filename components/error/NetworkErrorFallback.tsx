"use client";

/**
 * Network Error Fallback Component
 * Displays connectivity error messages
 * Validates: Requirement 21.3
 */

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WifiOff, RefreshCw } from "lucide-react";

interface NetworkErrorFallbackProps {
  onRetry?: () => void;
  message?: string;
}

/**
 * Specialized fallback for network connectivity errors
 */
export function NetworkErrorFallback({
  onRetry,
  message = "Unable to connect. Please check your internet connection.",
}: NetworkErrorFallbackProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-orange-100 p-3">
              <WifiOff className="h-6 w-6 text-orange-600" />
            </div>
            <CardTitle className="text-lg">Connection Error</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">{message}</p>

          <div className="space-y-2">
            <p className="text-xs text-gray-500">Please check:</p>
            <ul className="list-inside list-disc space-y-1 text-xs text-gray-500">
              <li>Your internet connection is active</li>
              <li>You're not in airplane mode</li>
              <li>Your firewall isn't blocking the connection</li>
            </ul>
          </div>

          <Button onClick={handleRetry} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
