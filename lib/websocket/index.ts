/**
 * WebSocket Module Exports
 *
 * Central export point for all WebSocket-related functionality
 */

// Client
export { wsClient } from "./client";

// Event types
export type {
  WebSocketEvents,
  WebSocketEventHandler,
  WebSocketEventName,
  WebSocketEventData,
  OrderStatus,
  DriverInfo,
  LocationCoordinates,
} from "./events";

// Hooks
export {
  useWebSocket,
  useWebSocketEvent,
  useOrderTracking,
  useKitchenNotifications,
  useDriverLocationTracking,
  useNotifications,
} from "./hooks";
