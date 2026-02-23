"use client";

import { useEffect } from "react";
import { measureWebVitals } from "@/lib/utils/performance";

/**
 * Client component that initializes performance monitoring
 * Implements requirement 22.2 and 22.3 for performance tracking
 */
export function PerformanceMonitor() {
  useEffect(() => {
    // Initialize Web Vitals measurement
    measureWebVitals();
  }, []);

  return null;
}
