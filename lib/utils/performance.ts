/**
 * Performance monitoring utilities for tracking key metrics
 * Implements requirement 22.2 and 22.3 for performance optimization
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  timestamp: number;
}

/**
 * Web Vitals thresholds based on Google's recommendations
 */
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
  FID: { good: 100, poor: 300 }, // First Input Delay
  CLS: { good: 0.1, poor: 0.25 }, // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
  TTFB: { good: 800, poor: 1800 }, // Time to First Byte
};

/**
 * Get rating based on metric value and thresholds
 */
function getRating(
  value: number,
  thresholds: { good: number; poor: number },
): "good" | "needs-improvement" | "poor" {
  if (value <= thresholds.good) return "good";
  if (value <= thresholds.poor) return "needs-improvement";
  return "poor";
}

/**
 * Measure and log Web Vitals metrics
 */
export function measureWebVitals(): void {
  if (typeof window === "undefined" || !("performance" in window)) {
    return;
  }

  // Measure LCP (Largest Contentful Paint)
  if ("PerformanceObserver" in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        const lcp = lastEntry.renderTime || lastEntry.loadTime;

        logMetric({
          name: "LCP",
          value: lcp,
          rating: getRating(lcp, THRESHOLDS.LCP),
          timestamp: Date.now(),
        });
      });

      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
    } catch (e) {
      console.warn("LCP measurement not supported");
    }

    // Measure FID (First Input Delay)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          const fid = entry.processingStart - entry.startTime;

          logMetric({
            name: "FID",
            value: fid,
            rating: getRating(fid, THRESHOLDS.FID),
            timestamp: Date.now(),
          });
        });
      });

      fidObserver.observe({ type: "first-input", buffered: true });
    } catch (e) {
      console.warn("FID measurement not supported");
    }

    // Measure CLS (Cumulative Layout Shift)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });

        logMetric({
          name: "CLS",
          value: clsValue,
          rating: getRating(clsValue, THRESHOLDS.CLS),
          timestamp: Date.now(),
        });
      });

      clsObserver.observe({ type: "layout-shift", buffered: true });
    } catch (e) {
      console.warn("CLS measurement not supported");
    }
  }

  // Measure FCP and TTFB using Navigation Timing API
  if (window.performance && window.performance.timing) {
    const timing = window.performance.timing;
    const navigationStart = timing.navigationStart;

    // FCP (First Contentful Paint)
    if ("PerformanceObserver" in window) {
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name === "first-contentful-paint") {
              logMetric({
                name: "FCP",
                value: entry.startTime,
                rating: getRating(entry.startTime, THRESHOLDS.FCP),
                timestamp: Date.now(),
              });
            }
          });
        });

        fcpObserver.observe({ type: "paint", buffered: true });
      } catch (e) {
        console.warn("FCP measurement not supported");
      }
    }

    // TTFB (Time to First Byte)
    window.addEventListener("load", () => {
      const ttfb = timing.responseStart - navigationStart;

      logMetric({
        name: "TTFB",
        value: ttfb,
        rating: getRating(ttfb, THRESHOLDS.TTFB),
        timestamp: Date.now(),
      });
    });
  }
}

/**
 * Log performance metric
 */
function logMetric(metric: PerformanceMetric): void {
  if (process.env.NODE_ENV === "development") {
    console.log(
      `[Performance] ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`,
    );
  }

  // In production, you could send metrics to an analytics service
  // Example: sendToAnalytics(metric);
}

/**
 * Measure custom performance marks
 */
export function measureCustomMetric(
  name: string,
  startMark: string,
  endMark: string,
): void {
  if (typeof window === "undefined" || !window.performance) {
    return;
  }

  try {
    window.performance.measure(name, startMark, endMark);
    const measure = window.performance.getEntriesByName(name)[0];

    if (measure) {
      logMetric({
        name,
        value: measure.duration,
        rating: "good", // Custom metrics don't have predefined thresholds
        timestamp: Date.now(),
      });
    }
  } catch (e) {
    console.warn(`Failed to measure ${name}:`, e);
  }
}

/**
 * Mark a performance point
 */
export function mark(name: string): void {
  if (typeof window === "undefined" || !window.performance) {
    return;
  }

  try {
    window.performance.mark(name);
  } catch (e) {
    console.warn(`Failed to mark ${name}:`, e);
  }
}

/**
 * Clear performance marks and measures
 */
export function clearMarks(name?: string): void {
  if (typeof window === "undefined" || !window.performance) {
    return;
  }

  try {
    if (name) {
      window.performance.clearMarks(name);
      window.performance.clearMeasures(name);
    } else {
      window.performance.clearMarks();
      window.performance.clearMeasures();
    }
  } catch (e) {
    console.warn("Failed to clear marks:", e);
  }
}

/**
 * Get current page load metrics
 */
export function getPageLoadMetrics(): Record<string, number> | null {
  if (
    typeof window === "undefined" ||
    !window.performance ||
    !window.performance.timing
  ) {
    return null;
  }

  const timing = window.performance.timing;
  const navigationStart = timing.navigationStart;

  return {
    dns: timing.domainLookupEnd - timing.domainLookupStart,
    tcp: timing.connectEnd - timing.connectStart,
    ttfb: timing.responseStart - navigationStart,
    download: timing.responseEnd - timing.responseStart,
    domInteractive: timing.domInteractive - navigationStart,
    domComplete: timing.domComplete - navigationStart,
    loadComplete: timing.loadEventEnd - navigationStart,
  };
}
