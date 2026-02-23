/**
 * Tests for Logger Utility
 * Validates: Requirements 21.8
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  Logger,
  createLogger,
  setLogLevel,
  getLogLevel,
  logger,
} from "../logger";

describe("Logger", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // In production/test mode, logger uses console.log for all levels
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    // Reset log level to default
    setLogLevel("info");
  });

  afterEach(() => {
    // Restore console methods
    consoleLogSpy.mockRestore();
  });

  describe("Log Levels", () => {
    it("should respect log level filtering", () => {
      setLogLevel("warn");

      logger.debug("Debug message");
      logger.info("Info message");
      logger.warn("Warning message");
      logger.error("Error message");

      // Should only log warn and error (2 calls)
      expect(consoleLogSpy).toHaveBeenCalledTimes(2);
    });

    it("should log all levels when set to debug", () => {
      setLogLevel("debug");

      logger.debug("Debug message");
      logger.info("Info message");
      logger.warn("Warning message");
      logger.error("Error message");

      // Should log all 4 levels
      expect(consoleLogSpy).toHaveBeenCalledTimes(4);
    });

    it("should only log errors when set to error level", () => {
      setLogLevel("error");

      logger.debug("Debug message");
      logger.info("Info message");
      logger.warn("Warning message");
      logger.error("Error message");

      // Should only log error (1 call)
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("Context", () => {
    it("should create logger with context", () => {
      const contextLogger = createLogger({
        component: "TestComponent",
        userId: "user123",
      });

      contextLogger.info("Test message");

      expect(consoleLogSpy).toHaveBeenCalled();
      const logCall = consoleLogSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);
      expect(logData.context.component).toBe("TestComponent");
      expect(logData.context.userId).toBe("user123");
    });

    it("should create child logger with additional context", () => {
      const parentLogger = createLogger({ component: "Parent" });
      const childLogger = parentLogger.child({ operation: "childOp" });

      childLogger.info("Child message");

      expect(consoleLogSpy).toHaveBeenCalled();
      const logCall = consoleLogSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);
      expect(logData.context.component).toBe("Parent");
      expect(logData.context.operation).toBe("childOp");
    });
  });

  describe("Specialized Logging Methods", () => {
    beforeEach(() => {
      setLogLevel("debug");
    });

    it("should log API requests", () => {
      logger.logRequest("GET", "/api/users");

      expect(consoleLogSpy).toHaveBeenCalled();
      const logCall = consoleLogSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);
      expect(logData.message).toContain("API Request");
      expect(logData.message).toContain("GET");
      expect(logData.context.type).toBe("api_request");
    });

    it("should log API responses", () => {
      logger.logResponse("POST", "/api/orders", 201, 150);

      expect(consoleLogSpy).toHaveBeenCalled();
      const logCall = consoleLogSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);
      expect(logData.message).toContain("API Response");
      expect(logData.context.status).toBe(201);
      expect(logData.context.duration).toBe(150);
    });

    it("should log failed API responses as warnings", () => {
      logger.logResponse("GET", "/api/users", 404);

      expect(consoleLogSpy).toHaveBeenCalled();
      const logCall = consoleLogSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);
      expect(logData.level).toBe("warn");
      expect(logData.context.status).toBe(404);
    });

    it("should log WebSocket events", () => {
      logger.logWebSocketEvent("order:update", { orderId: "123" });

      expect(consoleLogSpy).toHaveBeenCalled();
      const logCall = consoleLogSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);
      expect(logData.message).toContain("WebSocket Event");
      expect(logData.context.event).toBe("order:update");
    });

    it("should log state mutations", () => {
      logger.logStateMutation("cart", "addItem");

      expect(consoleLogSpy).toHaveBeenCalled();
      const logCall = consoleLogSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);
      expect(logData.message).toContain("State Mutation");
      expect(logData.context.store).toBe("cart");
      expect(logData.context.action).toBe("addItem");
    });

    it("should log authentication events", () => {
      logger.logAuthEvent("login", { userId: "user123" });

      expect(consoleLogSpy).toHaveBeenCalled();
      const logCall = consoleLogSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);
      expect(logData.message).toContain("Auth Event");
      expect(logData.context.event).toBe("login");
    });

    it("should log payment events", () => {
      logger.logPaymentEvent("confirmed", "order123");

      expect(consoleLogSpy).toHaveBeenCalled();
      const logCall = consoleLogSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);
      expect(logData.message).toContain("Payment Event");
      expect(logData.context.orderId).toBe("order123");
    });

    it("should log order events", () => {
      logger.logOrderEvent("created", "order123");

      expect(consoleLogSpy).toHaveBeenCalled();
      const logCall = consoleLogSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);
      expect(logData.message).toContain("Order Event");
      expect(logData.context.orderId).toBe("order123");
    });
  });

  describe("Error Logging", () => {
    it("should log errors with error objects", () => {
      const error = new Error("Test error");
      logger.error("An error occurred", {}, error);

      expect(consoleLogSpy).toHaveBeenCalled();
      const logCall = consoleLogSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);
      expect(logData.level).toBe("error");
      expect(logData.error).toBeDefined();
      expect(logData.error.message).toBe("Test error");
    });

    it("should log warnings with error objects", () => {
      const error = new Error("Test warning");
      logger.warn("A warning occurred", {}, error);

      expect(consoleLogSpy).toHaveBeenCalled();
      const logCall = consoleLogSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);
      expect(logData.level).toBe("warn");
      expect(logData.error).toBeDefined();
    });
  });

  describe("Log Level Configuration", () => {
    it("should get and set log level", () => {
      setLogLevel("debug");
      expect(getLogLevel()).toBe("debug");

      setLogLevel("error");
      expect(getLogLevel()).toBe("error");
    });
  });

  describe("Timestamp", () => {
    it("should include timestamp in log entries", () => {
      logger.info("Test message");

      expect(consoleLogSpy).toHaveBeenCalled();
      const logCall = consoleLogSpy.mock.calls[0][0];
      const logData = JSON.parse(logCall);
      expect(logData.timestamp).toBeDefined();
      // Check for ISO timestamp format
      expect(logData.timestamp).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });
});
