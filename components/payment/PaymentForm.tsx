"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { paymentService } from "@/lib/api/services/payment.service";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CreditCard, AlertCircle, CheckCircle } from "lucide-react";
import { getStripeKey } from "@/lib/config/env";

// Initialize Stripe
const stripeKey = getStripeKey();
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

interface PaymentFormProps {
  orderId: string;
  amount: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

function CheckoutForm({
  orderId,
  amount,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Step 1: Initiate payment on backend
      const { clientSecret, paymentIntentId } = await paymentService.initiate({
        orderId,
      });

      // Step 2: Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found");
      }

      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        });

      if (stripeError) {
        setError(stripeError.message || "Payment failed");
        setProcessing(false);
        onError?.(stripeError.message || "Payment failed");
        return;
      }

      // Step 3: Confirm payment on backend
      if (paymentIntent.status === "succeeded") {
        await paymentService.confirm({
          paymentIntentId,
          orderId,
        });

        setSucceeded(true);
        setProcessing(false);
        onSuccess?.();

        // Redirect to order confirmation page after a brief delay
        setTimeout(() => {
          router.push(`/orders/${orderId}`);
        }, 1500);
      }
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred during payment";
      setError(errorMessage);
      setProcessing(false);
      onError?.(errorMessage);
    }
  };

  if (succeeded) {
    return (
      <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-[32px] text-center space-y-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="font-heading text-2xl text-emerald-900">
          Payment Successful!
        </h3>
        <p className="text-sm text-emerald-700">Redirecting to your order...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-6 bg-white border border-gray-200 rounded-[24px] shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-heading text-lg text-secondary">Card Details</p>
            <p className="text-xs text-muted-foreground">
              Secure payment powered by Stripe
            </p>
          </div>
        </div>

        <div className="p-4 border border-gray-200 rounded-xl bg-gray-50/50">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#1a1a1a",
                  fontFamily:
                    'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  "::placeholder": {
                    color: "#9ca3af",
                  },
                  iconColor: "#f97316",
                },
                invalid: {
                  color: "#dc2626",
                  iconColor: "#dc2626",
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-[24px] flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900 text-sm">Payment Error</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <Button
          type="submit"
          disabled={!stripe || processing}
          className="w-full h-16 rounded-[24px] text-lg font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {processing ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing Payment...
            </div>
          ) : (
            `Pay $${amount.toFixed(2)}`
          )}
        </Button>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z" />
          </svg>
          <span>Secured by Stripe • Your payment information is encrypted</span>
        </div>
      </div>
    </form>
  );
}

export function PaymentForm(props: PaymentFormProps) {
  if (!stripePromise) {
    return (
      <div className="p-8 bg-amber-50 border border-amber-200 rounded-[32px] text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-amber-600" />
        </div>
        <h3 className="font-heading text-2xl text-amber-900">
          Payment Not Configured
        </h3>
        <p className="text-sm text-amber-700 max-w-md mx-auto">
          Stripe payment processing is not configured. Please set the
          NEXT_PUBLIC_STRIPE_KEY environment variable.
        </p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
}
