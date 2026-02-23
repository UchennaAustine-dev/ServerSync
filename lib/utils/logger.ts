/**
 * Comprehensive Logging Utility
 * Validates: Requirements 21.8
 *
 * Provides structured logging with multiple log levels, contextual information,
 * and different output formats for development vs production environments.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  userId?: string;
  component?: string;
  operation?: string;
  timestamp?: string;
  [key: string]: any;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: string;
  error?: Error;
}

/**
 * Logger configuration
 */
class LoggerConfig {
  private static instance: LoggerConfig;
  private logLevel: LogLevel = "info";
  private isDevelopment: boolean = process.env.NODE_ENV === "development";

  private constructor() {
    // Initialize log level from environment variable
    const envLogLevel = process.env.NEXT_PUBLIC_LOG_LEVEL?.toLowerCase();
    if (this.isValidLogLevel(envLogLevel)) {
      this.logLevel = envLogLevel as LogLevel;
    }
  }

  static getInstance(): LoggerConfig {
    if (!LoggerConfig.instance) {
      LoggerConfig.instance = new LoggerConfig();
    }
    return LoggerConfig.instance;
  }

  private isValidLogLevel(level: string | undefined): level is LogLevel {
    return (
      level === "debug" ||
      level === "info" ||
      level === "warn" ||
      level === "error"
    );
  }

  getLogLevel(): LogLevel {
    return this.logLevel;
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  isDev(): boolean {
    return this.isDevelopment;
  }
}

/**
 * Log level priority for filtering
 */
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Check if a log should be output based on current log level
 */
function shouldLog(level: LogLevel): boolean {
  const config = LoggerConfig.getInstance();
  const currentLevel = config.getLogLevel();
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[currentLevel];
}

/**
 * Format log entry for console output
 */
function formatLogEntry(entry: LogEntry): string {
  const config = LoggerConfig.getInstance();

  if (config.isDev()) {
    // Development: Human-readable format
    const parts = [`[${entry.timestamp}]`, `[${entry.level.toUpperCase()}]`];

    if (entry.context?.component) {
      parts.push(`[${entry.context.component}]`);
    }

    if (entry.context?.operation) {
      parts.push(`[${entry.context.operation}]`);
    }

    parts.push(entry.message);

    return parts.join(" ");
  } else {
    // Production: JSON format for log aggregation
    return JSON.stringify({
      level: entry.level,
      message: entry.message,
      timestamp: entry.timestamp,
      context: entry.context,
      error: entry.error
        ? {
            name: entry.error.name,
            message: entry.error.message,
            stack: entry.error.stack,
          }
        : undefined,
    });
  }
}

/**
 * Output log entry to console
 */
function outputLog(entry: LogEntry): void {
  const formatted = formatLogEntry(entry);
  const config = LoggerConfig.getInstance();

  if (config.isDev()) {
    // Development: Use console methods with styling
    switch (entry.level) {
      case "debug":
        console.debug(formatted, entry.context || "");
        break;
      case "info":
        console.info(formatted, entry.context || "");
        break;
      case "warn":
        console.warn(formatted, entry.context || "");
        if (entry.error) {
          console.warn(entry.error);
        }
        break;
      case "error":
        console.error(formatted, entry.context || "");
        if (entry.error) {
          console.error(entry.error);
        }
        break;
    }
  } else {
    // Production: Use console.log for all levels (for log aggregation)
    console.log(formatted);
  }
}

/**
 * Create a log entry
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: Error,
): LogEntry {
  return {
    level,
    message,
    context: {
      ...context,
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
    error,
  };
}

/**
 * Main Logger class
 */
export class Logger {
  private context: LogContext;

  constructor(context?: LogContext) {
    this.context = context || {};
  }

  /**
   * Create a child logger with additional context
   */
  child(additionalContext: LogContext): Logger {
    return new Logger({
      ...this.context,
      ...additionalContext,
    });
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: LogContext): void {
    if (!shouldLog("debug")) return;

    const entry = createLogEntry("debug", message, {
      ...this.context,
      ...context,
    });
    outputLog(entry);
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    if (!shouldLog("info")) return;

    const entry = createLogEntry("info", message, {
      ...this.context,
      ...context,
    });
    outputLog(entry);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext, error?: Error): void {
    if (!shouldLog("warn")) return;

    const entry = createLogEntry(
      "warn",
      message,
      {
        ...this.context,
        ...context,
      },
      error,
    );
    outputLog(entry);
  }

  /**
   * Log error message
   */
  error(message: string, context?: LogContext, error?: Error): void {
    if (!shouldLog("error")) return;

    const entry = createLogEntry(
      "error",
      message,
      {
        ...this.context,
        ...context,
      },
      error,
    );
    outputLog(entry);
  }

  /**
   * Log API request
   */
  logRequest(method: string, url: string, context?: LogContext): void {
    this.debug(`API Request: ${method} ${url}`, {
      ...context,
      type: "api_request",
      method,
      url,
    });
  }

  /**
   * Log API response
   */
  logResponse(
    method: string,
    url: string,
    status: number,
    duration?: number,
    context?: LogContext,
  ): void {
    const level = status >= 400 ? "warn" : "debug";
    const message = `API Response: ${method} ${url} - ${status}${duration ? ` (${duration}ms)` : ""}`;

    if (level === "warn") {
      this.warn(message, {
        ...context,
        type: "api_response",
        method,
        url,
        status,
        duration,
      });
    } else {
      this.debug(message, {
        ...context,
        type: "api_response",
        method,
        url,
        status,
        duration,
      });
    }
  }

  /**
   * Log WebSocket event
   */
  logWebSocketEvent(event: string, data?: any, context?: LogContext): void {
    this.debug(`WebSocket Event: ${event}`, {
      ...context,
      type: "websocket_event",
      event,
      data,
    });
  }

  /**
   * Log state mutation
   */
  logStateMutation(store: string, action: string, context?: LogContext): void {
    this.debug(`State Mutation: ${store}.${action}`, {
      ...context,
      type: "state_mutation",
      store,
      action,
    });
  }

  /**
   * Log authentication event
   */
  logAuthEvent(
    event: "login" | "logout" | "register" | "token_refresh" | "token_expired",
    context?: LogContext,
  ): void {
    this.info(`Auth Event: ${event}`, {
      ...context,
      type: "auth_event",
      event,
    });
  }

  /**
   * Log payment event
   */
  logPaymentEvent(
    event: "initiated" | "confirmed" | "failed",
    orderId?: string,
    context?: LogContext,
  ): void {
    this.info(`Payment Event: ${event}`, {
      ...context,
      type: "payment_event",
      event,
      orderId,
    });
  }

  /**
   * Log order event
   */
  logOrderEvent(
    event: "created" | "updated" | "cancelled" | "completed",
    orderId: string,
    context?: LogContext,
  ): void {
    this.info(`Order Event: ${event}`, {
      ...context,
      type: "order_event",
      event,
      orderId,
    });
  }
}

/**
 * Default logger instance
 */
export const logger = new Logger();

/**
 * Create a logger with specific context
 */
export function createLogger(context: LogContext): Logger {
  return new Logger(context);
}

/**
 * Set global log level
 */
export function setLogLevel(level: LogLevel): void {
  LoggerConfig.getInstance().setLogLevel(level);
}

/**
 * Get current log level
 */
export function getLogLevel(): LogLevel {
  return LoggerConfig.getInstance().getLogLevel();
}
