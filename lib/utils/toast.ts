import { useUIStore } from "@/lib/store/ui.store";

export const toast = {
  success: (message: string, duration?: number) => {
    useUIStore.getState().addToast({ type: "success", message, duration });
  },
  error: (message: string, duration?: number) => {
    useUIStore.getState().addToast({ type: "error", message, duration });
  },
  warning: (message: string, duration?: number) => {
    useUIStore.getState().addToast({ type: "warning", message, duration });
  },
  info: (message: string, duration?: number) => {
    useUIStore.getState().addToast({ type: "info", message, duration });
  },
};
