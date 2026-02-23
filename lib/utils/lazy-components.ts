/**
 * Lazy-loaded components for code splitting
 * Implements requirement 22.2 for performance optimization
 */

import dynamic from "next/dynamic";

/**
 * Lazy load dialog components to reduce initial bundle size
 * Dialogs are only loaded when needed (on user interaction)
 */
export const LazyDialog = dynamic(
  () =>
    import("@/components/ui/dialog").then((mod) => ({ default: mod.Dialog })),
  {
    loading: () => null, // Dialogs don't need loading state as they're triggered by user action
    ssr: false,
  },
);

export const LazyDialogContent = dynamic(
  () =>
    import("@/components/ui/dialog").then((mod) => ({
      default: mod.DialogContent,
    })),
  {
    loading: () => null,
    ssr: false,
  },
);

/**
 * Lazy load chart components (if using recharts or similar heavy libraries)
 * Charts are typically below the fold and can be lazy-loaded
 *
 * TODO: Uncomment when chart component is created
 */
// export const LazyChart = dynamic(
//   () => import("@/components/ui/chart").then((mod) => ({ default: mod.Chart })),
//   {
//     loading: () => null,
//     ssr: false,
//   }
// );

/**
 * Example: Lazy load map components (Google Maps, Mapbox, etc.)
 * Maps are heavy and should be loaded on-demand
 *
 * TODO: Uncomment when map component is created
 */
// export const LazyMap = dynamic(
//   () => import("@/components/map/Map").then((mod) => ({ default: mod.Map })),
//   {
//     loading: () => null,
//     ssr: false,
//   }
// );

/**
 * Lazy load payment form (Stripe Elements)
 * Payment forms are only needed during checkout
 */
export const LazyPaymentForm = dynamic(
  () =>
    import("@/components/payment/PaymentForm").then((mod) => ({
      default: mod.PaymentForm,
    })),
  {
    loading: () => null, // Payment forms load quickly, no loading state needed
    ssr: false,
  },
);

/**
 * Usage example:
 *
 * Instead of:
 * import { Dialog, DialogContent } from "@/components/ui/dialog";
 *
 * Use:
 * import { LazyDialog, LazyDialogContent } from "@/lib/utils/lazy-components";
 *
 * The component will be loaded only when it's rendered, reducing initial bundle size.
 */
