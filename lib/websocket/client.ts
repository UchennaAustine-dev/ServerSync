import { io, Socket } from "socket.io-client";
import { getWsUrl } from "../config/env";
import { useWebSocketStore } from "../store/websocket.store";
import { createLogger } from "../utils/logger";

// Create logger for WebSocket client
const logger = createLogger({ component: "WebSocketClient" });

/**
 * WebSocket Client for Real-time Communication
 *
 * Manages Socket.io connection with authentication, reconnection logic,
 * and event subscription management.
 */
class WebSocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private baseReconnectDelay = 1000;
  private eventHandlers: Map<string, Set<Function>> = new Map();
  private token: string | null = null;

  /**
   * Establish WebSocket connection with authentication
   * @param token - Authentication token for connection handshake
   */
  connect(token: string): void {
    if (this.socket?.connected) {
      logger.info("WebSocket already connected");
      return;
    }

    this.token = token;
    const wsUrl = getWsUrl();

    logger.info("Establishing WebSocket connection", { wsUrl });

    // Update store status
    useWebSocketStore.getState().setStatus("connecting");

    this.socket = io(wsUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.baseReconnectDelay,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    this.setupEventListeners();
  }

  /**
   * Set up Socket.io event listeners for connection management
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection successful
    this.socket.on("connect", () => {
      logger.info("WebSocket connected successfully");
      this.reconnectAttempts = 0;

      const store = useWebSocketStore.getState();
      store.setStatus("connected");
      store.setConnected(true);
      store.resetReconnectAttempts();

      this.notifyHandlers("connection:success", undefined);
    });

    // Connection lost
    this.socket.on("disconnect", (reason) => {
      logger.warn("WebSocket disconnected", { reason });

      const store = useWebSocketStore.getState();
      store.setStatus("disconnected");
      store.setConnected(false);

      this.notifyHandlers("connection:lost", reason);
    });

    // Connection error
    this.socket.on("connect_error", (error) => {
      logger.error(
        "WebSocket connection error",
        {
          message: error.message,
          attemptNumber: this.reconnectAttempts + 1,
          maxAttempts: this.maxReconnectAttempts,
        },
        error,
      );
      this.reconnectAttempts++;

      const store = useWebSocketStore.getState();
      store.setStatus("error");
      store.setLastError(error.message);
      store.incrementReconnectAttempts();

      this.notifyHandlers("connection:error", error);
    });

    // Reconnection attempt
    this.socket.io.on("reconnect_attempt", (attemptNumber) => {
      logger.info("WebSocket reconnection attempt", {
        attemptNumber,
        maxAttempts: this.maxReconnectAttempts,
      });

      const store = useWebSocketStore.getState();
      store.setStatus("reconnecting");
    });

    // Reconnection successful
    this.socket.io.on("reconnect", (attemptNumber) => {
      logger.info("WebSocket reconnected successfully", { attemptNumber });

      const store = useWebSocketStore.getState();
      store.setStatus("connected");
      store.setConnected(true);
      store.resetReconnectAttempts();

      this.notifyHandlers("connection:reconnected", attemptNumber);

      // Resubscribe to all active channels
      this.resubscribeToChannels();
    });

    // Reconnection failed
    this.socket.io.on("reconnect_failed", () => {
      logger.error("WebSocket reconnection failed after maximum attempts", {
        maxAttempts: this.maxReconnectAttempts,
      });

      const store = useWebSocketStore.getState();
      store.setStatus("error");
      store.setLastError("Reconnection failed after maximum attempts");

      this.notifyHandlers("connection:failed", undefined);
    });

    // Heartbeat/ping for connection health
    this.socket.on("ping", () => {
      // Socket.io handles pong automatically
      logger.debug("WebSocket ping received");
    });
  }

  /**
   * Resubscribe to all active channels after reconnection
   */
  private resubscribeToChannels(): void {
    const store = useWebSocketStore.getState();
    const subscriptions = Array.from(store.activeSubscriptions);

    logger.info("Resubscribing to active channels", {
      count: subscriptions.length,
    });

    subscriptions.forEach((channel) => {
      if (channel.startsWith("order:")) {
        const orderId = channel.replace("order:", "");
        this.subscribeToOrder(orderId);
      } else if (channel.startsWith("restaurant:")) {
        const restaurantId = channel.replace("restaurant:", "");
        this.subscribeToRestaurant(restaurantId);
      }
    });
  }

  /**
   * Disconnect WebSocket and clean up resources
   */
  disconnect(): void {
    if (this.socket) {
      logger.info("Disconnecting WebSocket");
      this.socket.disconnect();
      this.socket = null;
      this.token = null;
      this.eventHandlers.clear();

      const store = useWebSocketStore.getState();
      store.reset();
    }
  }

  /**
   * Subscribe to a specific event
   * @param event - Event name to subscribe to
   * @param handler - Callback function to handle the event
   * @returns Unsubscribe function
   */
  on<T = any>(event: string, handler: (data: T) => void): () => void {
    // Initialize handler set for this event if it doesn't exist
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());

      // Register with socket.io
      if (this.socket) {
        this.socket.on(event, (data: T) => {
          // Log WebSocket event
          logger.logWebSocketEvent(event, data);

          // Add event to store history
          useWebSocketStore.getState().addEvent({
            type: event,
            data,
            timestamp: Date.now(),
          });

          // Notify all handlers
          this.notifyHandlers(event, data);
        });
      }
    }

    const handlers = this.eventHandlers.get(event)!;
    handlers.add(handler);

    // Return unsubscribe function
    return () => {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(event);
        if (this.socket) {
          this.socket.off(event);
        }
      }
    };
  }

  /**
   * Notify all handlers for a specific event
   */
  private notifyHandlers<T = any>(event: string, data: T): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          logger.error(
            `Error in event handler for ${event}`,
            {
              event,
            },
            error as Error,
          );
        }
      });
    }
  }

  /**
   * Emit an event to the server
   * @param event - Event name
   * @param data - Event data
   */
  emit<T = any>(event: string, data?: T): void {
    if (this.socket?.connected) {
      logger.debug(`Emitting WebSocket event: ${event}`, { event, data });
      this.socket.emit(event, data);
    } else {
      logger.warn(`Cannot emit event "${event}": WebSocket not connected`, {
        event,
      });
    }
  }

  /**
   * Subscribe to order updates
   * @param orderId - Order ID to track
   */
  subscribeToOrder(orderId: string): void {
    const channel = `order:${orderId}`;
    const store = useWebSocketStore.getState();

    if (!store.isSubscribed(channel)) {
      this.emit("order:subscribe", { orderId });
      store.subscribe(channel);
      logger.info("Subscribed to order updates", { orderId });
    }
  }

  /**
   * Unsubscribe from order updates
   * @param orderId - Order ID to stop tracking
   */
  unsubscribeFromOrder(orderId: string): void {
    const channel = `order:${orderId}`;
    const store = useWebSocketStore.getState();

    if (store.isSubscribed(channel)) {
      this.emit("order:unsubscribe", { orderId });
      store.unsubscribe(channel);
      logger.info("Unsubscribed from order updates", { orderId });
    }
  }

  /**
   * Subscribe to restaurant updates (for kitchen dashboard)
   * @param restaurantId - Restaurant ID to track
   */
  subscribeToRestaurant(restaurantId: string): void {
    const channel = `restaurant:${restaurantId}`;
    const store = useWebSocketStore.getState();

    if (!store.isSubscribed(channel)) {
      this.emit("restaurant:subscribe", { restaurantId });
      store.subscribe(channel);
      logger.info("Subscribed to restaurant updates", { restaurantId });
    }
  }

  /**
   * Unsubscribe from restaurant updates
   * @param restaurantId - Restaurant ID to stop tracking
   */
  unsubscribeFromRestaurant(restaurantId: string): void {
    const channel = `restaurant:${restaurantId}`;
    const store = useWebSocketStore.getState();

    if (store.isSubscribed(channel)) {
      this.emit("restaurant:unsubscribe", { restaurantId });
      store.unsubscribe(channel);
      logger.info("Unsubscribed from restaurant updates", { restaurantId });
    }
  }

  /**
   * Update driver location (for active deliveries)
   * @param orderId - Order ID being delivered
   * @param latitude - Current latitude
   * @param longitude - Current longitude
   */
  updateDriverLocation(
    orderId: string,
    latitude: number,
    longitude: number,
  ): void {
    logger.debug("Updating driver location", { orderId, latitude, longitude });
    this.emit("driver:location", { orderId, latitude, longitude });
  }

  /**
   * Check if WebSocket is currently connected
   * @returns Connection status
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Get the current socket instance (for advanced usage)
   * @returns Socket instance or null
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Manually trigger reconnection
   */
  reconnect(): void {
    if (this.token) {
      logger.info("Manually triggering WebSocket reconnection");
      this.disconnect();
      this.connect(this.token);
    } else {
      logger.warn("Cannot reconnect: No authentication token available");
    }
  }
}

// Export singleton instance
export const wsClient = new WebSocketClient();
