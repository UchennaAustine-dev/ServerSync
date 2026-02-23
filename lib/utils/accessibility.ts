/**
 * Accessibility utilities for screen reader announcements and ARIA support
 */

/**
 * Announces a message to screen readers using a live region
 * @param message - The message to announce
 * @param priority - The priority level ('polite' or 'assertive')
 */
export function announceToScreenReader(
  message: string,
  priority: "polite" | "assertive" = "polite",
): void {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement is made
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Generates a unique ID for ARIA relationships
 * @param prefix - Optional prefix for the ID
 */
export function generateAriaId(prefix: string = "aria"): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Traps focus within a container (useful for modals)
 * @param container - The container element
 * @returns Cleanup function
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  container.addEventListener("keydown", handleKeyDown);

  // Focus first element
  firstElement?.focus();

  return () => {
    container.removeEventListener("keydown", handleKeyDown);
  };
}

/**
 * Gets all focusable elements within a container
 * @param container - The container element
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const elements = container.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  );
  return Array.from(elements);
}

/**
 * Restores focus to a previously focused element
 * @param element - The element to restore focus to
 */
export function restoreFocus(element: HTMLElement | null): void {
  if (element && typeof element.focus === "function") {
    element.focus();
  }
}

/**
 * Creates a visually hidden but screen reader accessible element
 */
export const srOnlyStyles = {
  position: "absolute" as const,
  width: "1px",
  height: "1px",
  padding: "0",
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap" as const,
  borderWidth: "0",
};

/**
 * Announces loading state to screen readers
 * @param isLoading - Whether content is loading
 * @param message - Custom loading message
 */
export function announceLoadingState(
  isLoading: boolean,
  message?: string,
): void {
  if (isLoading) {
    announceToScreenReader(message || "Loading content", "polite");
  } else {
    announceToScreenReader("Content loaded", "polite");
  }
}

/**
 * Announces error to screen readers
 * @param error - The error message
 */
export function announceError(error: string): void {
  announceToScreenReader(`Error: ${error}`, "assertive");
}

/**
 * Announces success to screen readers
 * @param message - The success message
 */
export function announceSuccess(message: string): void {
  announceToScreenReader(message, "polite");
}
