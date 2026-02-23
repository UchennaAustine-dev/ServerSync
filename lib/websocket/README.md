# WebSocket Real-time Communication

This module provides real-time bidirectional communication between the ServeSync client and backend using Socket.io.

## Features

- ✅ Automatic connection management with authentication
- ✅ Exponential backoff reconnection strategy
- ✅ Real-time order status updates
- ✅ Driver location tracking
- ✅ Kitchen dashboard notifications
- ✅ Browser and sound notifications
- ✅ Connection state management with Zustand
- ✅ Type-safe event handling
- ✅ React hooks for easy integration

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   React Components                       │
│  (Order Tracking, Kitchen Dashboard, Driver Portal)     │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
    ┌────▼─────┐         ┌──────▼──────┐
    │  Hooks   │         │   Store     │
    │          │◄────────┤  (Zustand)  │
    └────┬─────┘         └─────────────┘
         │
    ┌────▼─────────────────────┐
    │   WebSocket Client       │
    │   (Socket.io)            │
    └────┬─────────────────────┘
         │
    ┌────▼─────────────────────┐
    │   Backend WebSocket      │
    │   Server                 │
    └──────────────────────────┘
```

## Core Components

### 1. WebSocket Client (`client.ts`)

The main WebSocket client manages the Socket.io connection lifecycle.

**Key Features:**

- Authentication via token in connection handshake
- Automatic reconnection with exponential backoff
- Event subscription management
- Channel-based subscriptions (orders, restaurants)
- Connection state tracking

**Usage:**

```typescript
import { wsClient } from "@/lib/websocket/client";

// Connect (usually done automatically via useWebSocket hook)
wsClient.connect(authToken);

// Subscribe to events
const unsubscribe = wsClient.on("order:status_updated", (data) => {
  console.log("Order status:", data.status);
});

// Emit events
wsClient.emit("driver:location", { orderId, latitude, longitude });

// Unsubscribe
unsubscribe();

// Disconnect
wsClient.disconnect();
```

### 2. Event Types (`events.ts`)

Type-safe event definitions for all WebSocket events.

**Event Categories:**

- **Connection Events**: Connection lifecycle events
- **Order Events**: Order status updates, driver assignment, location updates
- **Restaurant Events**: New orders, cancellations, menu updates
- **Driver Events**: Location updates, delivery assignments
- **Kitchen Events**: Order preparation, delays
- **Notification Events**: General notifications

**Usage:**

```typescript
import type { WebSocketEvents } from "@/lib/websocket/events";

// Type-safe event handler
const handleOrderUpdate = (data: WebSocketEvents["order:status_updated"]) => {
  console.log(`Order ${data.orderId} is now ${data.status}`);
};
```

### 3. React Hooks (`hooks.ts`)

Custom React hooks for WebSocket integration.

#### `useWebSocket()`

Main connection hook that manages WebSocket lifecycle.

```typescript
const { isConnected, status, client, reconnect } = useWebSocket();
```

#### `useWebSocketEvent(event, handler, deps)`

Subscribe to specific WebSocket events.

```typescript
useWebSocketEvent(
  "order:status_updated",
  (data) => {
    console.log("Order updated:", data);
  },
  [],
);
```

#### `useOrderTracking(orderId)`

Real-time order tracking for customers.

```typescript
const {
  orderStatus,
  driverInfo,
  driverLocation,
  lastUpdate,
  estimatedArrival,
} = useOrderTracking(orderId);
```

#### `useKitchenNotifications(restaurantId)`

Kitchen dashboard notifications for restaurant staff.

```typescript
const {
  newOrders,
  notificationCount,
  soundEnabled,
  browserNotificationsEnabled,
  clearNotifications,
  removeOrder,
  toggleSound,
} = useKitchenNotifications(restaurantId);
```

#### `useDriverLocationTracking(orderId, updateInterval)`

Automatic driver location tracking during deliveries.

```typescript
const { isTracking, lastLocation, error, startTracking, stopTracking } =
  useDriverLocationTracking(orderId);
```

#### `useNotifications()`

General notification management.

```typescript
const { notifications, unreadCount, markAsRead, clearAll } = useNotifications();
```

## Integration Examples

### Customer Order Tracking

```typescript
'use client';

import { useOrderTracking } from '@/lib/websocket/hooks';

export function OrderTrackingPage({ orderId }: { orderId: string }) {
  const {
    orderStatus,
    driverInfo,
    driverLocation,
    estimatedArrival
  } = useOrderTracking(orderId);

  return (
    <div>
      <h1>Order Status: {orderStatus}</h1>
      {driverInfo && (
        <div>
          <p>Driver: {driverInfo.name}</p>
          <p>Phone: {driverInfo.phone}</p>
          <p>ETA: {estimatedArrival} minutes</p>
        </div>
      )}
      {driverLocation && (
        <Map center={[driverLocation.lat, driverLocation.lng]} />
      )}
    </div>
  );
}
```

### Kitchen Dashboard

```typescript
'use client';

import { useKitchenNotifications } from '@/lib/websocket/hooks';

export function KitchenDashboard({ restaurantId }: { restaurantId: string }) {
  const {
    newOrders,
    notificationCount,
    soundEnabled,
    toggleSound
  } = useKitchenNotifications(restaurantId);

  return (
    <div>
      <div>
        <h1>Kitchen Dashboard</h1>
        <button onClick={toggleSound}>
          {soundEnabled ? 'Mute' : 'Unmute'} Notifications
        </button>
        {notificationCount > 0 && (
          <span>{notificationCount} new orders</span>
        )}
      </div>
      <div>
        {newOrders.map(order => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}
```

### Driver Location Tracking

```typescript
'use client';

import { useDriverLocationTracking } from '@/lib/websocket/hooks';

export function DriverDelivery({ orderId }: { orderId: string }) {
  const {
    isTracking,
    lastLocation,
    error
  } = useDriverLocationTracking(orderId);

  return (
    <div>
      <h1>Active Delivery</h1>
      <p>Status: {isTracking ? 'Tracking' : 'Not tracking'}</p>
      {lastLocation && (
        <p>
          Location: {lastLocation.lat.toFixed(6)}, {lastLocation.lng.toFixed(6)}
        </p>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

## Event Flow

### Order Status Update Flow

```
1. Kitchen updates order status in backend
2. Backend emits 'order:status_updated' event
3. WebSocket client receives event
4. Event handler updates Zustand store
5. React components re-render with new status
6. Customer sees real-time update
```

### Driver Location Update Flow

```
1. Driver's browser gets geolocation
2. useDriverLocationTracking hook sends location via WebSocket
3. Backend receives 'driver:location' event
4. Backend emits 'order:location_updated' to customer
5. Customer's useOrderTracking hook receives update
6. Map component updates driver marker position
```

### Kitchen Notification Flow

```
1. Customer places order via API
2. Backend creates order and emits 'restaurant:new_order'
3. Kitchen dashboard receives event via WebSocket
4. useKitchenNotifications hook processes event
5. Sound notification plays
6. Browser notification shows
7. Order appears in kitchen dashboard
```

## Configuration

### Environment Variables

```env
NEXT_PUBLIC_WS_URL=wss://servesync-84s1.onrender.com
```

### Connection Options

The WebSocket client is configured with:

- **Transports**: WebSocket (primary), Polling (fallback)
- **Reconnection**: Enabled
- **Max Reconnection Attempts**: 5
- **Reconnection Delay**: 1000ms (exponential backoff)
- **Max Reconnection Delay**: 5000ms
- **Timeout**: 10000ms

## State Management

WebSocket state is managed using Zustand store (`websocket.store.ts`):

```typescript
interface WebSocketState {
  status: ConnectionStatus;
  isConnected: boolean;
  reconnectAttempts: number;
  lastError: string | null;
  lastEvent: WebSocketEvent | null;
  eventHistory: WebSocketEvent[];
  activeSubscriptions: Set<string>;
}
```

## Error Handling

The WebSocket client handles various error scenarios:

1. **Connection Errors**: Automatic reconnection with exponential backoff
2. **Authentication Errors**: Disconnect and redirect to login
3. **Network Errors**: Retry with backoff
4. **Event Handler Errors**: Caught and logged without disrupting connection

## Testing

### Manual Testing

1. **Connection Test**:

   ```typescript
   import { wsClient } from "@/lib/websocket/client";
   wsClient.connect(token);
   console.log("Connected:", wsClient.isConnected());
   ```

2. **Event Test**:

   ```typescript
   wsClient.on("order:status_updated", (data) => {
     console.log("Received event:", data);
   });
   ```

3. **Reconnection Test**:
   - Disconnect network
   - Wait for reconnection attempts
   - Reconnect network
   - Verify automatic reconnection

### Browser Notification Testing

1. Grant notification permissions in browser
2. Place a test order
3. Verify browser notification appears
4. Check notification sound plays

## Performance Considerations

- **Event Throttling**: Location updates are throttled to every 10 seconds
- **Event History**: Limited to last 50 events to prevent memory leaks
- **Subscription Management**: Automatic cleanup on component unmount
- **Connection Pooling**: Single WebSocket connection shared across app

## Security

- **Authentication**: Token-based authentication in connection handshake
- **Channel Isolation**: Users only receive events for their subscribed channels
- **Token Refresh**: Automatic reconnection with refreshed token on expiry
- **HTTPS/WSS**: Secure WebSocket connection (wss://)

## Troubleshooting

### Connection Issues

**Problem**: WebSocket won't connect
**Solutions**:

- Check NEXT_PUBLIC_WS_URL is set correctly
- Verify authentication token is valid
- Check browser console for errors
- Verify backend WebSocket server is running

### No Events Received

**Problem**: Not receiving WebSocket events
**Solutions**:

- Verify subscription to correct channel
- Check connection status with `isConnected`
- Verify backend is emitting events
- Check event handler is registered correctly

### Location Tracking Not Working

**Problem**: Driver location not updating
**Solutions**:

- Grant location permissions in browser
- Verify geolocation API is supported
- Check network connectivity
- Verify orderId is correct

### Notifications Not Showing

**Problem**: Browser notifications not appearing
**Solutions**:

- Grant notification permissions
- Check Notification.permission status
- Verify notification sound file exists
- Check browser notification settings

## Future Enhancements

- [ ] Add WebSocket connection health monitoring
- [ ] Implement message queuing for offline support
- [ ] Add WebSocket analytics and metrics
- [ ] Support for WebSocket compression
- [ ] Add end-to-end encryption for sensitive events
- [ ] Implement WebSocket connection pooling per user role
- [ ] Add support for WebSocket binary messages
- [ ] Implement WebSocket rate limiting on client side

## Resources

- [Socket.io Client Documentation](https://socket.io/docs/v4/client-api/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Notification API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
