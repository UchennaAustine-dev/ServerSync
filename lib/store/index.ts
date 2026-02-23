/**
 * Zustand stores for client-side state management
 *
 * Store organization:
 * - auth.store.ts: Authentication state and user session
 * - cart.store.ts: Shopping cart state and validation
 * - ui.store.ts: UI state (loading, errors, toasts, modals)
 * - websocket.store.ts: WebSocket connection state and events
 */

export { useAuthStore } from "./auth.store";
export type { AuthState } from "./auth.store";

export { useCartStore } from "./cart.store";
export type { CartItem, CartState, CartValidationResult } from "./cart.store";

export { useUIStore } from "./ui.store";
export type { Toast, ToastType, UIState } from "./ui.store";

export { useWebSocketStore } from "./websocket.store";
export type {
  ConnectionStatus,
  WebSocketEvent,
  WebSocketState,
} from "./websocket.store";
