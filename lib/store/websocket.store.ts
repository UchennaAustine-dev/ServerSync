import { create } from "zustand";

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "error";

export interface WebSocketEvent {
  type: string;
  data: any;
  timestamp: number;
}

export interface WebSocketState {
  // Connection state
  status: ConnectionStatus;
  isConnected: boolean;
  reconnectAttempts: number;
  lastError: string | null;

  // Event tracking
  lastEvent: WebSocketEvent | null;
  eventHistory: WebSocketEvent[];

  // Subscriptions
  activeSubscriptions: Set<string>;

  // Actions
  setStatus: (status: ConnectionStatus) => void;
  setConnected: (isConnected: boolean) => void;
  incrementReconnectAttempts: () => void;
  resetReconnectAttempts: () => void;
  setLastError: (error: string | null) => void;

  addEvent: (event: WebSocketEvent) => void;
  clearEventHistory: () => void;

  subscribe: (channel: string) => void;
  unsubscribe: (channel: string) => void;
  isSubscribed: (channel: string) => boolean;
  clearSubscriptions: () => void;

  reset: () => void;
}

const MAX_EVENT_HISTORY = 50;

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  // Initial state
  status: "disconnected",
  isConnected: false,
  reconnectAttempts: 0,
  lastError: null,
  lastEvent: null,
  eventHistory: [],
  activeSubscriptions: new Set(),

  // Connection actions
  setStatus: (status) => {
    set({ status });

    // Update isConnected based on status
    if (status === "connected") {
      set({ isConnected: true, lastError: null });
    } else if (status === "disconnected" || status === "error") {
      set({ isConnected: false });
    }
  },

  setConnected: (isConnected) => {
    set({
      isConnected,
      status: isConnected ? "connected" : "disconnected",
    });

    if (isConnected) {
      set({ lastError: null });
      get().resetReconnectAttempts();
    }
  },

  incrementReconnectAttempts: () => {
    set({ reconnectAttempts: get().reconnectAttempts + 1 });
  },

  resetReconnectAttempts: () => {
    set({ reconnectAttempts: 0 });
  },

  setLastError: (error) => {
    set({ lastError: error });
    if (error) {
      set({ status: "error" });
    }
  },

  // Event actions
  addEvent: (event) => {
    const { eventHistory } = get();

    // Add event to history, keeping only the last MAX_EVENT_HISTORY events
    const newHistory = [event, ...eventHistory].slice(0, MAX_EVENT_HISTORY);

    set({
      lastEvent: event,
      eventHistory: newHistory,
    });
  },

  clearEventHistory: () => {
    set({ eventHistory: [], lastEvent: null });
  },

  // Subscription actions
  subscribe: (channel) => {
    const activeSubscriptions = new Set(get().activeSubscriptions);
    activeSubscriptions.add(channel);
    set({ activeSubscriptions });
  },

  unsubscribe: (channel) => {
    const activeSubscriptions = new Set(get().activeSubscriptions);
    activeSubscriptions.delete(channel);
    set({ activeSubscriptions });
  },

  isSubscribed: (channel) => {
    return get().activeSubscriptions.has(channel);
  },

  clearSubscriptions: () => {
    set({ activeSubscriptions: new Set() });
  },

  // Reset all state
  reset: () => {
    set({
      status: "disconnected",
      isConnected: false,
      reconnectAttempts: 0,
      lastError: null,
      lastEvent: null,
      eventHistory: [],
      activeSubscriptions: new Set(),
    });
  },
}));
