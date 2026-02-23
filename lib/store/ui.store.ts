import { create } from "zustand";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export interface UIState {
  // Loading states
  isGlobalLoading: boolean;
  loadingOperations: Set<string>;

  // Error states
  globalError: string | null;

  // Toast notifications
  toasts: Toast[];

  // Modal states
  isModalOpen: boolean;
  modalContent: React.ReactNode | null;

  // Sidebar state
  isSidebarOpen: boolean;

  // Actions
  setGlobalLoading: (isLoading: boolean) => void;
  startLoading: (operation: string) => void;
  stopLoading: (operation: string) => void;
  isLoading: (operation: string) => boolean;

  setGlobalError: (error: string | null) => void;
  clearGlobalError: () => void;

  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;

  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  // Initial state
  isGlobalLoading: false,
  loadingOperations: new Set(),
  globalError: null,
  toasts: [],
  isModalOpen: false,
  modalContent: null,
  isSidebarOpen: false,

  // Loading actions
  setGlobalLoading: (isLoading) => {
    set({ isGlobalLoading: isLoading });
  },

  startLoading: (operation) => {
    const loadingOperations = new Set(get().loadingOperations);
    loadingOperations.add(operation);
    set({ loadingOperations });
  },

  stopLoading: (operation) => {
    const loadingOperations = new Set(get().loadingOperations);
    loadingOperations.delete(operation);
    set({ loadingOperations });
  },

  isLoading: (operation) => {
    return get().loadingOperations.has(operation);
  },

  // Error actions
  setGlobalError: (error) => {
    set({ globalError: error });
  },

  clearGlobalError: () => {
    set({ globalError: null });
  },

  // Toast actions
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: Toast = { ...toast, id };

    set({ toasts: [...get().toasts, newToast] });

    // Auto-remove toast after duration (default 5 seconds)
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
  },

  removeToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },

  clearToasts: () => {
    set({ toasts: [] });
  },

  // Modal actions
  openModal: (content) => {
    set({ isModalOpen: true, modalContent: content });
  },

  closeModal: () => {
    set({ isModalOpen: false, modalContent: null });
  },

  // Sidebar actions
  toggleSidebar: () => {
    set({ isSidebarOpen: !get().isSidebarOpen });
  },

  setSidebarOpen: (isOpen) => {
    set({ isSidebarOpen: isOpen });
  },
}));
