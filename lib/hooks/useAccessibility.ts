import { useEffect, useRef } from "react";
import {
  announceToScreenReader,
  trapFocus,
  restoreFocus,
  announceLoadingState,
  announceError,
  announceSuccess,
} from "../utils/accessibility";

/**
 * Hook for announcing messages to screen readers
 */
export function useScreenReaderAnnouncement() {
  return {
    announce: announceToScreenReader,
    announceLoading: announceLoadingState,
    announceError,
    announceSuccess,
  };
}

/**
 * Hook for managing focus trap in modals/dialogs
 * @param isOpen - Whether the modal is open
 */
export function useFocusTrap(isOpen: boolean) {
  const containerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    // Store previously focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Trap focus
    const cleanup = trapFocus(containerRef.current);

    return () => {
      cleanup();
      // Restore focus when modal closes
      restoreFocus(previousFocusRef.current);
    };
  }, [isOpen]);

  return containerRef;
}

/**
 * Hook for announcing loading states
 * @param isLoading - Whether content is loading
 * @param message - Custom loading message
 */
export function useLoadingAnnouncement(isLoading: boolean, message?: string) {
  const hasAnnouncedRef = useRef(false);

  useEffect(() => {
    if (isLoading && !hasAnnouncedRef.current) {
      announceLoadingState(true, message);
      hasAnnouncedRef.current = true;
    } else if (!isLoading && hasAnnouncedRef.current) {
      announceLoadingState(false);
      hasAnnouncedRef.current = false;
    }
  }, [isLoading, message]);
}

/**
 * Hook for announcing errors
 * @param error - The error message
 */
export function useErrorAnnouncement(error: string | null | undefined) {
  const previousErrorRef = useRef<string | null>(null);

  useEffect(() => {
    if (error && error !== previousErrorRef.current) {
      announceError(error);
      previousErrorRef.current = error;
    }
  }, [error]);
}

/**
 * Hook for managing keyboard navigation
 * @param onEscape - Callback for Escape key
 * @param onEnter - Callback for Enter key
 */
export function useKeyboardNavigation(
  onEscape?: () => void,
  onEnter?: () => void,
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onEscape) {
        onEscape();
      } else if (e.key === "Enter" && onEnter) {
        onEnter();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onEscape, onEnter]);
}
