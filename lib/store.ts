/**
 * @deprecated This file is deprecated. Import stores from 'lib/store' instead.
 *
 * This file is kept for backward compatibility during migration.
 * All stores have been moved to separate files in lib/store/
 */

// Re-export stores for backward compatibility
export { useAuthStore } from "./store/auth.store";
export { useCartStore } from "./store/cart.store";
export { useUIStore } from "./store/ui.store";
export { useWebSocketStore } from "./store/websocket.store";

// Re-export types
export type { AuthState } from "./store/auth.store";
export type { CartItem, CartState } from "./store/cart.store";
export type { Toast, ToastType, UIState } from "./store/ui.store";
export type {
  ConnectionStatus,
  WebSocketEvent,
  WebSocketState,
} from "./store/websocket.store";
