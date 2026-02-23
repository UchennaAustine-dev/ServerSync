/**
 * WebSocket React Hooks
 *
 * Custom hooks for managing WebSocket connections and subscriptions
 * in React components
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { wsClient } from "./client";
import { useWebSocketStore } from "../store/websocket.store";
import { useAuthStore } from "../store/auth.store";
import type {
  WebSocketEvents,
  WebSocketEventName,
  OrderStatus,
  DriverInfo,
} from "./events";
import type { Order } from "../api/types/order.types";

/**
 * Main WebSocket connection hook
 * Manages connection lifecycle based on authentication state
 *
 * @returns Connection state and client instance
 */
export function useWebSocket() {
  const token = useAuthStore((state) => state.token);
  const isConnected = useWebSocketStore((state) => state.isConnected);
  const status = useWebSocketStore((state) => state.status);

  useEffect(() => {
    if (token && !wsClient.isConnected()) {
      // Connect when token is available
      wsClient.connect(token);
    } else if (!token && wsClient.isConnected()) {
      // Disconnect when token is removed (logout)
      wsClient.disconnect();
    }

    // Cleanup on unmount
    return () => {
      // Don't disconnect on unmount to maintain connection across navigation
      // Only disconnect on logout (handled above)
    };
  }, [token]);

  return {
    isConnected,
    status,
    client: wsClient,
    reconnect: wsClient.reconnect.bind(wsClient),
  };
}

/**
 * Subscribe to a specific WebSocket event
 *
 * @param event - Event name to subscribe to
 * @param handler - Callback function to handle the event
 * @param deps - Dependency array for the handler
 */
export function useWebSocketEvent<K extends WebSocketEventName>(
  event: K,
  handler: (data: WebSocketEvents[K]) => void,
  deps: any[] = [],
) {
  const handlerRef = useRef(handler);

  // Update handler ref when it changes
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    // Wrap handler to use the ref
    const wrappedHandler = (data: WebSocketEvents[K]) => {
      handlerRef.current(data);
    };

    const unsubscribe = wsClient.on(event, wrappedHandler);
    return unsubscribe;
  }, [event, ...deps]);
}

/**
 * Real-time order tracking hook
 * Subscribes to order updates and provides current order state
 *
 * @param orderId - Order ID to track (null to disable)
 * @returns Order tracking state
 */
export function useOrderTracking(orderId: string | null) {
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const [driverInfo, setDriverInfo] = useState<DriverInfo | null>(null);
  const [driverLocation, setDriverLocation] = useState<{
    lat: number;
    lng: number;
    timestamp?: string;
  } | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [estimatedArrival, setEstimatedArrival] = useState<number | null>(null);

  useEffect(() => {
    if (!orderId) {
      // Reset state when orderId is null
      setOrderStatus(null);
      setDriverInfo(null);
      setDriverLocation(null);
      setLastUpdate(null);
      setEstimatedArrival(null);
      return;
    }

    // Subscribe to order updates
    wsClient.subscribeToOrder(orderId);

    // Status updates
    const unsubscribeStatus = wsClient.on<
      WebSocketEvents["order:status_updated"]
    >("order:status_updated", (data) => {
      if (data.orderId === orderId) {
        setOrderStatus(data.status);
        setLastUpdate(data.timestamp);
      }
    });

    // Driver assignment
    const unsubscribeDriver = wsClient.on<
      WebSocketEvents["order:driver_assigned"]
    >("order:driver_assigned", (data) => {
      if (data.orderId === orderId) {
        setDriverInfo(data.driver);
        setLastUpdate(data.timestamp);
        if (data.estimatedArrival) {
          setEstimatedArrival(data.estimatedArrival);
        }
      }
    });

    // Location updates
    const unsubscribeLocation = wsClient.on<
      WebSocketEvents["order:location_updated"]
    >("order:location_updated", (data) => {
      if (data.orderId === orderId) {
        setDriverLocation({
          lat: data.latitude,
          lng: data.longitude,
          timestamp: data.timestamp,
        });
        setLastUpdate(data.timestamp);
      }
    });

    // Order completion
    const unsubscribeCompleted = wsClient.on<
      WebSocketEvents["order:completed"]
    >("order:completed", (data) => {
      if (data.orderId === orderId) {
        setOrderStatus("delivered");
        setLastUpdate(data.completedAt);
      }
    });

    // Order cancellation
    const unsubscribeCancelled = wsClient.on<
      WebSocketEvents["order:cancelled"]
    >("order:cancelled", (data) => {
      if (data.orderId === orderId) {
        setOrderStatus("cancelled");
        setLastUpdate(data.timestamp);
      }
    });

    // Cleanup
    return () => {
      wsClient.unsubscribeFromOrder(orderId);
      unsubscribeStatus();
      unsubscribeDriver();
      unsubscribeLocation();
      unsubscribeCompleted();
      unsubscribeCancelled();
    };
  }, [orderId]);

  return {
    orderStatus,
    driverInfo,
    driverLocation,
    lastUpdate,
    estimatedArrival,
  };
}

/**
 * Kitchen notifications hook for restaurant dashboard
 * Manages incoming order notifications with sound and browser notifications
 *
 * @param restaurantId - Restaurant ID to track (null to disable)
 * @returns Kitchen notification state and controls
 */
export function useKitchenNotifications(restaurantId: string | null) {
  const [newOrders, setNewOrders] = useState<Order[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] =
    useState(false);

  // Request browser notification permission
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        setBrowserNotificationsEnabled(true);
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          setBrowserNotificationsEnabled(permission === "granted");
        });
      }
    }
  }, []);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (soundEnabled && typeof window !== "undefined") {
      try {
        const audio = new Audio("/sounds/notification.mp3");
        audio.volume = 0.5;
        audio.play().catch((error) => {
          console.warn("Failed to play notification sound:", error);
        });
      } catch (error) {
        console.warn("Audio not supported:", error);
      }
    }
  }, [soundEnabled]);

  // Show browser notification
  const showBrowserNotification = useCallback(
    (order: Order) => {
      if (browserNotificationsEnabled && typeof window !== "undefined") {
        try {
          new Notification("New Order Received", {
            body: `Order #${order.id.slice(0, 8)} - ${order.items.length} items`,
            icon: "/logo.png",
            badge: "/logo.png",
            tag: `order-${order.id}`,
            requireInteraction: true,
          });
        } catch (error) {
          console.warn("Failed to show browser notification:", error);
        }
      }
    },
    [browserNotificationsEnabled],
  );

  useEffect(() => {
    if (!restaurantId) {
      // Reset state when restaurantId is null
      setNewOrders([]);
      setNotificationCount(0);
      return;
    }

    // Subscribe to restaurant updates
    wsClient.subscribeToRestaurant(restaurantId);

    // New order notification
    const unsubscribeNewOrder = wsClient.on<
      WebSocketEvents["restaurant:new_order"]
    >("restaurant:new_order", (data) => {
      setNewOrders((prev) => [data.order, ...prev]);
      setNotificationCount((prev) => prev + 1);

      // Play sound if enabled
      if (data.sound) {
        playNotificationSound();
      }

      // Show browser notification
      showBrowserNotification(data.order);
    });

    // Order status changed
    const unsubscribeStatusChanged = wsClient.on<
      WebSocketEvents["restaurant:order_status_changed"]
    >("restaurant:order_status_changed", (data) => {
      if (data.restaurantId === restaurantId) {
        // Update order in the list
        setNewOrders((prev) =>
          prev.map((order) =>
            order.id === data.orderId
              ? { ...order, status: data.status }
              : order,
          ),
        );
      }
    });

    // Order cancelled
    const unsubscribeCancelled = wsClient.on<
      WebSocketEvents["restaurant:order_cancelled"]
    >("restaurant:order_cancelled", (data) => {
      // Remove cancelled order from new orders list
      setNewOrders((prev) => prev.filter((order) => order.id !== data.orderId));
    });

    // Cleanup
    return () => {
      wsClient.unsubscribeFromRestaurant(restaurantId);
      unsubscribeNewOrder();
      unsubscribeStatusChanged();
      unsubscribeCancelled();
    };
  }, [restaurantId, playNotificationSound, showBrowserNotification]);

  const clearNotifications = useCallback(() => {
    setNotificationCount(0);
  }, []);

  const removeOrder = useCallback((orderId: string) => {
    setNewOrders((prev) => prev.filter((order) => order.id !== orderId));
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, []);

  return {
    newOrders,
    notificationCount,
    soundEnabled,
    browserNotificationsEnabled,
    clearNotifications,
    removeOrder,
    toggleSound,
  };
}

/**
 * Driver location tracking hook
 * Automatically sends location updates while delivery is active
 *
 * @param orderId - Active delivery order ID (null to disable)
 * @param updateInterval - Location update interval in milliseconds (default: 10000)
 * @returns Location tracking state and controls
 */
export function useDriverLocationTracking(
  orderId: string | null,
  updateInterval: number = 10000,
) {
  const [isTracking, setIsTracking] = useState(false);
  const [lastLocation, setLastLocation] = useState<{
    lat: number;
    lng: number;
    timestamp: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTracking = useCallback(() => {
    if (
      !orderId ||
      typeof window === "undefined" ||
      !("geolocation" in navigator)
    ) {
      setError("Geolocation not supported");
      return;
    }

    setIsTracking(true);
    setError(null);

    // Request location permission and start watching
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: new Date().toISOString(),
        };

        setLastLocation(location);
        setError(null);

        // Send location update to server
        wsClient.updateDriverLocation(orderId, location.lat, location.lng);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setError(error.message);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      },
    );
  }, [orderId]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsTracking(false);
  }, []);

  // Auto-start/stop tracking based on orderId
  useEffect(() => {
    if (orderId) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => {
      stopTracking();
    };
  }, [orderId, startTracking, stopTracking]);

  return {
    isTracking,
    lastLocation,
    error,
    startTracking,
    stopTracking,
  };
}

/**
 * Generic notification hook
 * Listens for general notification events
 *
 * @returns Notifications state and controls
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<
    Array<WebSocketEvents["notification:new"]>
  >([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useWebSocketEvent("notification:new", (data) => {
    setNotifications((prev) => [data, ...prev]);
    setUnreadCount((prev) => prev + 1);
  });

  const markAsRead = useCallback((notificationId: string) => {
    wsClient.emit("notification:read", {
      notificationId,
      timestamp: new Date().toISOString(),
    });
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    clearAll,
  };
}
