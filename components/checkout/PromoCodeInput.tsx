"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CheckCircle, X, Loader2 } from "lucide-react";
import { orderService } from "@/lib/api/services/order.service";
import type { ValidatePromoResponse } from "@/lib/api/types/order.types";
import { useScreenReaderAnnouncement } from "@/lib/hooks/useAccessibility";

interface PromoCodeInputProps {
  restaurantId: string;
  subtotal: number;
  onPromoApplied: (promo: ValidatePromoResponse & { code: string }) => void;
  onPromoRemoved: () => void;
  appliedPromo?: ValidatePromoResponse & { code: string };
}

export function PromoCodeInput({
  restaurantId,
  subtotal,
  onPromoApplied,
  onPromoRemoved,
  appliedPromo,
}: PromoCodeInputProps) {
  const [promoCode, setPromoCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { announceSuccess, announceError } = useScreenReaderAnnouncement();

  const handleValidate = async () => {
    if (!promoCode.trim()) {
      const errorMsg = "Please enter a promo code";
      setError(errorMsg);
      announceError(errorMsg);
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const result = await orderService.validatePromo({
        promoCode: promoCode.trim(),
        restaurantId,
        subtotal,
      });

      if (result.valid) {
        onPromoApplied({ ...result, code: promoCode.trim() });
        announceSuccess(
          `Promo code applied! You saved $${result.discountAmount.toFixed(2)}`,
        );
        setPromoCode("");
      } else {
        const errorMsg = result.message || "Invalid promo code";
        setError(errorMsg);
        announceError(errorMsg);
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        "Failed to validate promo code. Please try again.";
      setError(errorMsg);
      announceError(errorMsg);
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemove = () => {
    onPromoRemoved();
    setPromoCode("");
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleValidate();
    }
  };

  if (appliedPromo) {
    return (
      <div className="space-y-4">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-4">
          Promo Code Applied
        </Label>
        <div
          className="flex items-center gap-4 p-6 bg-emerald-50/50 border border-emerald-200/50 rounded-2xl"
          role="status"
          aria-live="polite"
        >
          <CheckCircle
            className="w-6 h-6 text-emerald-600 shrink-0"
            aria-hidden="true"
          />
          <div className="flex-1 min-w-0">
            <p className="font-black text-secondary uppercase tracking-wider">
              {appliedPromo.code}
            </p>
            <p className="text-sm text-emerald-700 font-medium">
              You saved ${appliedPromo.discountAmount.toFixed(2)}!
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleRemove}
            className="shrink-0 hover:bg-emerald-100"
            aria-label="Remove promo code"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Label
        htmlFor="promoCode"
        className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-4"
      >
        Promo Code (Optional)
      </Label>
      <div className="flex gap-4">
        <Input
          id="promoCode"
          placeholder="Enter promo code"
          className="h-14 px-6 rounded-2xl bg-gray-50/50 border-transparent focus:bg-white focus:border-primary/20 transition-all text-base uppercase"
          value={promoCode}
          onChange={(e) => {
            setPromoCode(e.target.value.toUpperCase());
            setError(null);
          }}
          onKeyPress={handleKeyPress}
          disabled={isValidating}
          aria-invalid={!!error}
          aria-describedby={error ? "promo-error" : undefined}
        />
        <Button
          onClick={handleValidate}
          disabled={isValidating || !promoCode.trim()}
          className="h-14 px-8 rounded-2xl font-black shrink-0"
          aria-busy={isValidating}
        >
          {isValidating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Validating...</span>
            </>
          ) : (
            "Apply"
          )}
        </Button>
      </div>
      {error && (
        <p
          id="promo-error"
          className="text-xs text-destructive ml-4 flex items-center gap-2"
          role="alert"
        >
          <X className="w-3 h-3" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
