# Zustand Stores

This directory contains all Zustand stores for client-side state management in the ServeSync application.

## Store Organization

### `auth.store.ts` - Authentication State

Manages user authentication state, tokens, and session persistence.

**State:**

- `user`: Current user object (from API)
- `token`: JWT access token
- `refreshToken`: JWT refresh token
- `isAuthenticated`: Boolean flag for auth status
- `isLoading`: Loading state for auth operations

**Actions:**

- `setAuth(user, token, refreshToken)`: Set complete auth state after login
- `setUser(user)`: Update user profile
- `setTokens(token, refreshToken)`: Update tokens after refresh
- `clearAuth()`: Clear all auth state on logout
- `setLoading(isLoading)`: Set loading state

**Persistence:** Uses Zustand persist middleware with localStorage

### `cart.store.ts` - Shopping Cart State

Manages shopping cart items with validation against real menu data.

**State:**

- `items`: Array of cart items
- `restaurantId`: Current restaurant (enforces single-restaurant cart)

**Actions:**

- `addToCart(item)`: Add item to cart (clears cart if different restaurant)
- `removeFromCart(menuItemId)`: Remove item from cart
- `updateQuantity(menuItemId, quantity)`: Update item quantity
- `updateSpecialInstructions(menuItemId, instructions)`: Update item instructions
- `clearCart()`: Clear all items
- `validateCart(menuItems)`: Validate cart against current menu data
- `getTotal()`: Calculate total price
- `getSubtotal()`: Calculate subtotal
- `getItemCount()`: Get total item count
- `canAddItem(restaurantId)`: Check if item from restaurant can be added

**Persistence:** Uses Zustand persist middleware with localStorage

### `ui.store.ts` - UI State

Manages global UI state including loading indicators, errors, toasts, and modals.

**State:**

- `isGlobalLoading`: Global loading flag
- `loadingOperations`: Set of active loading operations
- `globalError`: Global error message
- `toasts`: Array of toast notifications
- `isModalOpen`: Modal open state
- `modalContent`: Current modal content
- `isSidebarOpen`: Sidebar open state

**Actions:**

- `setGlobalLoading(isLoading)`: Set global loading state
- `startLoading(operation)`: Start loading for specific operation
- `stopLoading(operation)`: Stop loading for specific operation
- `isLoading(operation)`: Check if operation is loading
- `setGlobalError(error)`: Set global error
- `clearGlobalError()`: Clear global error
- `addToast(toast)`: Add toast notification (auto-removes after duration)
- `removeToast(id)`: Remove specific toast
- `clearToasts()`: Clear all toasts
- `openModal(content)`: Open modal with content
- `closeModal()`: Close modal
- `toggleSidebar()`: Toggle sidebar
- `setSidebarOpen(isOpen)`: Set sidebar state

**Persistence:** None (ephemeral UI state)

### `websocket.store.ts` - WebSocket Connection State

Manages WebSocket connection state, events, and subscriptions.

**State:**

- `status`: Connection status (disconnected, connecting, connected, reconnecting, error)
- `isConnected`: Boolean connection flag
- `reconnectAttempts`: Number of reconnection attempts
- `lastError`: Last connection error
- `lastEvent`: Most recent WebSocket event
- `eventHistory`: Array of recent events (max 50)
- `activeSubscriptions`: Set of active channel subscriptions

**Actions:**

- `setStatus(status)`: Set connection status
- `setConnected(isConnected)`: Set connection state
- `incrementReconnectAttempts()`: Increment reconnect counter
- `resetReconnectAttempts()`: Reset reconnect counter
- `setLastError(error)`: Set last error
- `addEvent(event)`: Add event to history
- `clearEventHistory()`: Clear event history
- `subscribe(channel)`: Subscribe to channel
- `unsubscribe(channel)`: Unsubscribe from channel
- `isSubscribed(channel)`: Check if subscribed to channel
- `clearSubscriptions()`: Clear all subscriptions
- `reset()`: Reset all state

**Persistence:** None (ephemeral connection state)

## Usage

### Importing Stores

```typescript
// Import individual stores
import { useAuthStore } from "@/lib/store/auth.store";
import { useCartStore } from "@/lib/store/cart.store";
import { useUIStore } from "@/lib/store/ui.store";
import { useWebSocketStore } from "@/lib/store/websocket.store";

// Or import from index
import {
  useAuthStore,
  useCartStore,
  useUIStore,
  useWebSocketStore,
} from "@/lib/store";
```

### Using Stores in Components

```typescript
function MyComponent() {
  // Select specific state
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Select actions
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  // Or get entire store
  const authStore = useAuthStore();

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.name}</p>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
```

### Integration with API Services

```typescript
// In a React Query mutation
const loginMutation = useMutation({
  mutationFn: authService.login,
  onSuccess: (data) => {
    // Update auth store with API response
    useAuthStore.getState().setAuth(data.user, data.token, data.refreshToken);
  },
  onError: (error) => {
    // Show error toast
    useUIStore.getState().addToast({
      type: "error",
      message: "Login failed. Please try again.",
    });
  },
});
```

## Design Principles

1. **Separation of Concerns**: Each store manages a specific domain
2. **Type Safety**: All stores use TypeScript with proper type definitions
3. **Persistence**: Auth and cart stores persist to localStorage
4. **Integration**: Stores integrate with API types from `lib/api/types/`
5. **Computed Values**: Stores provide computed getters (e.g., `getTotal()`)
6. **Validation**: Cart store validates against real menu data
7. **Immutability**: All state updates use immutable patterns

## Migration from Old Store

The old `lib/store.ts` file has been deprecated and now re-exports from the new store files for backward compatibility. Update imports to use the new store files:

```typescript
// Old (deprecated)
import { useAuthStore, useCartStore } from "@/lib/store";

// New (recommended)
import { useAuthStore } from "@/lib/store/auth.store";
import { useCartStore } from "@/lib/store/cart.store";

// Or from index
import { useAuthStore, useCartStore } from "@/lib/store";
```
