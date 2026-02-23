# Comprehensive Logging System

This document describes the comprehensive logging system implemented for the ServeSync frontend application.

## Overview

The logging system provides structured logging with multiple log levels, contextual information, and different output formats for development vs production environments. It integrates with all critical parts of the application including API requests, WebSocket events, error handling, and state mutations.

## Features

- **Multiple Log Levels**: debug, info, warn, error
- **Contextual Logging**: Include component name, user ID, operation, and custom metadata
- **Environment-Aware**: Human-readable format in development, JSON format in production
- **Configurable**: Set log level via `NEXT_PUBLIC_LOG_LEVEL` environment variable
- **Specialized Methods**: Dedicated methods for API, WebSocket, auth, payment, and order events
- **Integration**: Integrated with Axios, WebSocket client, error handler, and error boundary

## Configuration

### Environment Variable

Set the log level using the `NEXT_PUBLIC_LOG_LEVEL` environment variable:

```bash
# .env.local
NEXT_PUBLIC_LOG_LEVEL=debug  # Options: debug, info, warn, error
```

### Log Levels

- **debug**: All logs including detailed debugging information (API requests/responses, WebSocket events, state mutations)
- **info**: Informational messages and above (auth events, payment events, order events)
- **warn**: Warnings and errors only (failed API responses, connection issues)
- **error**: Errors only (critical errors, exceptions)

### Default Behavior

- **Development**: Log level defaults to `info`, human-readable console output
- **Production**: Log level defaults to `info`, JSON-formatted output for log aggregation

## Usage

### Basic Logging

```typescript
import { logger } from "@/lib/utils/logger";

// Debug message
logger.debug("Detailed debugging information");

// Info message
logger.info("Informational message");

// Warning message
logger.warn("Warning message");

// Error message
logger.error("Error message", {}, new Error("Something went wrong"));
```

### Creating Logger with Context

```typescript
import { createLogger } from "@/lib/utils/logger";

const logger = createLogger({
  component: "CheckoutPage",
  userId: "user123",
});

logger.info("User started checkout");
// Output: [timestamp] [INFO] [CheckoutPage] User started checkout
```

### Child Loggers

```typescript
const parentLogger = createLogger({ component: "OrderService" });
const childLogger = parentLogger.child({ operation: "createOrder" });

childLogger.info("Creating order");
// Output: [timestamp] [INFO] [OrderService] [createOrder] Creating order
```

### Specialized Logging Methods

#### API Request/Response Logging

```typescript
// Log API request
logger.logRequest("POST", "/api/orders", {
  orderId: "order123",
});

// Log API response
logger.logResponse("POST", "/api/orders", 201, 150, {
  orderId: "order123",
});
```

#### WebSocket Event Logging

```typescript
logger.logWebSocketEvent("order:update", {
  orderId: "order123",
  status: "preparing",
});
```

#### State Mutation Logging

```typescript
logger.logStateMutation("cart", "addItem", {
  itemId: "item123",
});
```

#### Authentication Event Logging

```typescript
logger.logAuthEvent("login", {
  userId: "user123",
  method: "email",
});
```

#### Payment Event Logging

```typescript
logger.logPaymentEvent("confirmed", "order123", {
  amount: 29.99,
  method: "card",
});
```

#### Order Event Logging

```typescript
logger.logOrderEvent("created", "order123", {
  restaurantId: "rest123",
  total: 29.99,
});
```

## Integration Points

### 1. Axios Client (`lib/axios.ts`)

The Axios client automatically logs:

- All API requests with method, URL, and parameters
- All API responses with status code and duration
- Token refresh attempts and results
- Retry attempts with delay information
- Request/response errors

### 2. WebSocket Client (`lib/websocket/client.ts`)

The WebSocket client automatically logs:

- Connection establishment and disconnection
- Connection errors and reconnection attempts
- All incoming WebSocket events
- Outgoing event emissions
- Channel subscriptions and unsubscriptions
- Driver location updates

### 3. Error Handler (`lib/utils/error-handler.ts`)

The error handler uses the logger for:

- Structured error logging with context
- Error classification and details
- Stack traces in development

### 4. Error Boundary (`components/error/ErrorBoundary.tsx`)

The error boundary logs:

- Component errors caught by the boundary
- Component stack traces
- Error boundary level (root, page, section)

## Output Formats

### Development Format (Human-Readable)

```
[2024-01-15T10:30:45.123Z] [INFO] [CheckoutPage] [createOrder] Creating order for user
[2024-01-15T10:30:45.234Z] [DEBUG] [AxiosClient] API Request: POST /api/orders
[2024-01-15T10:30:45.456Z] [DEBUG] [AxiosClient] API Response: POST /api/orders - 201 (222ms)
```

### Production Format (JSON)

```json
{
  "level": "info",
  "message": "Creating order for user",
  "timestamp": "2024-01-15T10:30:45.123Z",
  "context": {
    "component": "CheckoutPage",
    "operation": "createOrder",
    "userId": "user123"
  }
}
```

## Best Practices

### 1. Use Appropriate Log Levels

- **debug**: Detailed information for debugging (API calls, state changes)
- **info**: Important business events (user actions, order creation)
- **warn**: Recoverable issues (retry attempts, validation warnings)
- **error**: Critical errors requiring attention (exceptions, failures)

### 2. Include Contextual Information

Always include relevant context:

```typescript
logger.info("Order created", {
  orderId: "order123",
  userId: "user123",
  restaurantId: "rest123",
  total: 29.99,
});
```

### 3. Use Component-Specific Loggers

Create loggers with component context:

```typescript
const logger = createLogger({ component: "PaymentForm" });
```

### 4. Log Critical Operations

Always log:

- Authentication flows (login, logout, token refresh)
- Order placement and updates
- Payment processing
- WebSocket connections and events
- State mutations
- Error conditions

### 5. Avoid Logging Sensitive Data

Never log:

- Passwords or authentication credentials
- Credit card numbers or CVV codes
- Personal identification numbers
- API keys or secrets

Instead, log sanitized versions:

```typescript
logger.info("Payment processed", {
  cardLast4: "4242",
  amount: 29.99,
  // Don't log full card number or CVV
});
```

## Testing

The logger includes comprehensive unit tests covering:

- Log level filtering
- Context propagation
- Specialized logging methods
- Error logging with error objects
- Timestamp inclusion

Run tests:

```bash
npm test lib/utils/__tests__/logger.test.ts
```

## Production Considerations

### Log Aggregation

In production, logs are output in JSON format for easy ingestion by log aggregation services like:

- AWS CloudWatch
- Google Cloud Logging
- Datadog
- Splunk
- ELK Stack

### Error Tracking

The logger can be extended to send errors to error tracking services:

```typescript
// In logError function
if (process.env.NODE_ENV === "production") {
  Sentry.captureException(error, { contexts: { custom: context } });
}
```

### Performance

The logger is designed for minimal performance impact:

- Log level filtering prevents unnecessary string formatting
- Structured logging avoids complex string concatenation
- Async operations don't block the main thread

## Troubleshooting

### Logs Not Appearing

1. Check log level configuration:

   ```typescript
   import { getLogLevel } from "@/lib/utils/logger";
   console.log("Current log level:", getLogLevel());
   ```

2. Ensure log level is appropriate:
   - If set to `error`, only errors will appear
   - Set to `debug` to see all logs

### Too Many Logs

1. Increase log level to reduce verbosity:

   ```bash
   NEXT_PUBLIC_LOG_LEVEL=warn
   ```

2. Use component-specific filtering in production log aggregation

### Missing Context

Ensure you're using a logger with context:

```typescript
// Bad: No context
logger.info("Something happened");

// Good: With context
const logger = createLogger({ component: "MyComponent" });
logger.info("Something happened", { userId: "user123" });
```

## Future Enhancements

Potential improvements:

- Log sampling for high-volume production environments
- Log buffering and batching for performance
- Integration with APM (Application Performance Monitoring) tools
- Custom log formatters for different environments
- Log filtering by component or operation
- Log search and analysis tools
