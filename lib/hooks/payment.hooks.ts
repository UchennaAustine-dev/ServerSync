import { useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentService } from "../api/services/payment.service";
import type {
  InitiatePaymentRequest,
  InitiatePaymentResponse,
  ConfirmPaymentRequest,
  ConfirmPaymentResponse,
} from "../api/types/payment.types";
import { useUIStore } from "../store";

/**
 * Hook for initiating a payment
 * Creates a payment intent on the backend and returns the client secret
 */
export function useInitiatePayment() {
  const { addToast } = useUIStore();

  return useMutation<InitiatePaymentResponse, Error, InitiatePaymentRequest>({
    mutationFn: (data) => paymentService.initiate(data),
    onError: (error) => {
      console.error("Payment initiation error:", error);
      addToast({
        type: "error",
        message: error.message || "Failed to initiate payment",
      });
    },
  });
}

/**
 * Hook for confirming a payment
 * Confirms the payment on the backend after Stripe confirmation
 */
export function useConfirmPayment() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation<ConfirmPaymentResponse, Error, ConfirmPaymentRequest>({
    mutationFn: (data) => paymentService.confirm(data),
    onSuccess: (data) => {
      // Invalidate order queries to refresh order status
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", data.order.id] });

      addToast({
        type: "success",
        message: "Payment confirmed successfully!",
      });
    },
    onError: (error) => {
      console.error("Payment confirmation error:", error);
      addToast({
        type: "error",
        message: error.message || "Failed to confirm payment",
      });
    },
  });
}
