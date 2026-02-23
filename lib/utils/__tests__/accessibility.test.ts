import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  announceToScreenReader,
  generateAriaId,
  trapFocus,
  getFocusableElements,
  restoreFocus,
  announceLoadingState,
  announceError,
  announceSuccess,
} from "../accessibility";

describe("Accessibility Utilities", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe("announceToScreenReader", () => {
    it("should create a live region with the message", () => {
      announceToScreenReader("Test message", "polite");

      const liveRegion = document.querySelector('[role="status"]');
      expect(liveRegion).toBeTruthy();
      expect(liveRegion?.textContent).toBe("Test message");
      expect(liveRegion?.getAttribute("aria-live")).toBe("polite");
    });

    it("should use assertive priority when specified", () => {
      announceToScreenReader("Urgent message", "assertive");

      const liveRegion = document.querySelector('[role="status"]');
      expect(liveRegion?.getAttribute("aria-live")).toBe("assertive");
    });

    it("should remove the announcement after timeout", () => {
      vi.useFakeTimers();
      announceToScreenReader("Test message");

      expect(document.querySelector('[role="status"]')).toBeTruthy();

      vi.advanceTimersByTime(1000);

      expect(document.querySelector('[role="status"]')).toBeFalsy();
      vi.useRealTimers();
    });
  });

  describe("generateAriaId", () => {
    it("should generate unique IDs", () => {
      const id1 = generateAriaId();
      const id2 = generateAriaId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^aria-/);
      expect(id2).toMatch(/^aria-/);
    });

    it("should use custom prefix", () => {
      const id = generateAriaId("custom");
      expect(id).toMatch(/^custom-/);
    });
  });

  describe("trapFocus", () => {
    it("should trap focus within container", () => {
      const container = document.createElement("div");
      const button1 = document.createElement("button");
      const button2 = document.createElement("button");
      const button3 = document.createElement("button");

      container.appendChild(button1);
      container.appendChild(button2);
      container.appendChild(button3);
      document.body.appendChild(container);

      const cleanup = trapFocus(container);

      // Focus should be on first element
      expect(document.activeElement).toBe(button1);

      cleanup();
    });

    it("should return cleanup function", () => {
      const container = document.createElement("div");
      const button = document.createElement("button");
      container.appendChild(button);
      document.body.appendChild(container);

      const cleanup = trapFocus(container);
      expect(typeof cleanup).toBe("function");

      cleanup();
    });
  });

  describe("getFocusableElements", () => {
    it("should find all focusable elements", () => {
      const container = document.createElement("div");
      container.innerHTML = `
        <button>Button</button>
        <a href="#">Link</a>
        <input type="text" />
        <button disabled>Disabled</button>
      `;
      document.body.appendChild(container);

      const focusable = getFocusableElements(container);

      expect(focusable).toHaveLength(3); // Excludes disabled button
    });
  });

  describe("restoreFocus", () => {
    it("should restore focus to element", () => {
      const button = document.createElement("button");
      document.body.appendChild(button);

      restoreFocus(button);

      expect(document.activeElement).toBe(button);
    });

    it("should handle null element gracefully", () => {
      expect(() => restoreFocus(null)).not.toThrow();
    });
  });

  describe("announceLoadingState", () => {
    it("should announce loading message", () => {
      announceLoadingState(true, "Loading data");

      const liveRegion = document.querySelector('[role="status"]');
      expect(liveRegion?.textContent).toBe("Loading data");
    });

    it("should announce completion", () => {
      announceLoadingState(false);

      const liveRegion = document.querySelector('[role="status"]');
      expect(liveRegion?.textContent).toBe("Content loaded");
    });
  });

  describe("announceError", () => {
    it("should announce error with assertive priority", () => {
      announceError("Something went wrong");

      const liveRegion = document.querySelector('[role="status"]');
      expect(liveRegion?.textContent).toBe("Error: Something went wrong");
      expect(liveRegion?.getAttribute("aria-live")).toBe("assertive");
    });
  });

  describe("announceSuccess", () => {
    it("should announce success message", () => {
      announceSuccess("Operation completed");

      const liveRegion = document.querySelector('[role="status"]');
      expect(liveRegion?.textContent).toBe("Operation completed");
      expect(liveRegion?.getAttribute("aria-live")).toBe("polite");
    });
  });
});
