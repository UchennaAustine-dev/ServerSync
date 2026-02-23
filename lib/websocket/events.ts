/**
 * WebSocket Event Type Definitions
 *
 * Defines all event types for real-time communication between
 * client and server via Socket.io
 */

import type { Order } from "../api/types/order.types";

// Order status types
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

// Driver information
export interface DriverInfo {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  vehicleNumber?: string;
  rating?: number;
}

// Location coordinates
export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  timestamp?: string;
}

/**
 * WebSocket Events Interface
 * Maps event names to their payload types
 */
export interface WebSocketEvents {
  // ============================================
  // Connection Events
  // ============================================
  "connection:success": void;
  "connection:lost": string;
  "connection:error": Error;
  "connection:reconnected": number;
  "connection:failed": void;

  // ============================================
  // Order Events (Customer & Restaurant)
  // ============================================

  // Subscription management
  "order:subscribe": { orderId: string };
  "order:unsubscribe": { orderId: string };

  // Order status updates
  "order:status_updated": {
    orderId: string;
    status: OrderStatus;
    timestamp: string;
    message?: string;
  };

  // Order confirmation
  "order:confirmed": {
    orderId: string;
    estimatedDeliveryTime: number;
    timestamp: string;
  };

  // Driver assignment
  "order:driver_assigned": {
    orderId: string;
    driver: DriverInfo;
    estimatedArrival?: number;
    timestamp: string;
  };

  // Driver location updates
  "order:location_updated": {
    orderId: string;
    latitude: number;
    longitude: number;
    timestamp: string;
    speed?: number;
    heading?: number;
  };

  // Order completion
  "order:completed": {
    orderId: string;
    completedAt: string;
    deliveryTime: number;
  };

  // Order cancellation
  "order:cancelled": {
    orderId: string;
    reason: string;
    cancelledBy: "customer" | "restaurant" | "admin";
    timestamp: string;
  };

  // ============================================
  // Restaurant Events (Kitchen Dashboard)
  // ============================================

  // Subscription management
  "restaurant:subscribe": { restaurantId: string };
  "restaurant:unsubscribe": { restaurantId: string };

  // New order notification
  "restaurant:new_order": {
    order: Order;
    sound: boolean;
    priority?: "normal" | "high" | "urgent";
  };

  // Order status change from kitchen
  "restaurant:order_status_changed": {
    orderId: string;
    status: OrderStatus;
    restaurantId: string;
    timestamp: string;
  };

  // Order cancellation notification
  "restaurant:order_cancelled": {
    orderId: string;
    reason: string;
    timestamp: string;
  };

  // Menu item availability change
  "restaurant:menu_updated": {
    restaurantId: string;
    itemId: string;
    isAvailable: boolean;
    timestamp: string;
  };

  // ============================================
  // Driver Events
  // ============================================

  // Driver location update (sent by driver)
  "driver:location": {
    orderId: string;
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp?: string;
  };

  // New delivery assignment
  "driver:new_delivery": {
    order: Order;
    pickupLocation: LocationCoordinates & { address: string };
    deliveryLocation: LocationCoordinates & { address: string };
    estimatedDistance: number;
    estimatedDuration: number;
  };

  // Delivery status update
  "driver:delivery_status": {
    orderId: string;
    status: "accepted" | "picked_up" | "in_transit" | "delivered";
    timestamp: string;
  };

  // ============================================
  // Kitchen Notification Events
  // ============================================

  // Kitchen order ready notification
  "kitchen:order_ready": {
    orderId: string;
    restaurantId: string;
    timestamp: string;
  };

  // Kitchen preparation started
  "kitchen:preparation_started": {
    orderId: string;
    restaurantId: string;
    estimatedReadyTime: number;
    timestamp: string;
  };

  // Kitchen delay notification
  "kitchen:delay": {
    orderId: string;
    restaurantId: string;
    delayMinutes: number;
    reason?: string;
    timestamp: string;
  };

  // ============================================
  // General Notification Events
  // ============================================

  // Generic notification
  "notification:new": {
    id: string;
    type: "info" | "success" | "warning" | "error";
    title: string;
    message: string;
    timestamp: string;
    actionUrl?: string;
    actionLabel?: string;
  };

  // Notification read
  "notification:read": {
    notificationId: string;
    timestamp: string;
  };

  // ============================================
  // System Events
  // ============================================

  // Server maintenance notification
  "system:maintenance": {
    message: string;
    scheduledAt?: string;
    duration?: number;
  };

  // Server message
  "system:message": {
    message: string;
    type: "info" | "warning" | "error";
    timestamp: string;
  };
}

/**
 * Type helper for event handlers
 */
export type WebSocketEventHandler<K extends keyof WebSocketEvents> = (
  data: WebSocketEvents[K],
) => void;

/**
 * Type helper for event names
 */
export type WebSocketEventName = keyof WebSocketEvents;

/**
 * Type helper for event data
 */
export type WebSocketEventData<K extends keyof WebSocketEvents> =
  WebSocketEvents[K];
