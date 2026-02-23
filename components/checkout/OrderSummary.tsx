"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { CartItem } from "@/lib/store/cart.store";

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  discount?: number;
  total: number;
  showItems?: boolean;
}

export function OrderSummary({
  items,
  subtotal,
  deliveryFee,
  serviceFee,
  discount = 0,
  total,
  showItems = true,
}: OrderSummaryProps) {
  return (
    <div className="bg-white/95 backdrop-blur-3xl p-8 rounded-[40px] border border-white/40 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-8">
        <h2 className="font-heading text-2xl text-secondary">
          Order <span className="italic text-primary">Details.</span>
        </h2>
        <Badge
          variant="outline"
          className="bg-primary/5 text-primary border-primary/20 font-black px-3 rounded-lg"
        >
          {items.length} {items.length === 1 ? "Element" : "Elements"}
        </Badge>
      </div>

      {showItems && (
        <>
          <div className="space-y-6 mb-10 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
            {items.map((item) => (
              <div
                key={item.menuItemId}
                className="flex justify-between items-start gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-secondary truncate">
                    {item.name}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mt-1">
                    Qty: {item.quantity}
                  </p>
                  {item.specialInstructions && (
                    <p className="text-xs text-muted-foreground/70 mt-1 italic">
                      {item.specialInstructions}
                    </p>
                  )}
                </div>
                <span className="text-sm font-heading font-normal text-secondary tabular-nums shrink-0">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <Separator className="mb-6" />
        </>
      )}

      <div className="space-y-4 mb-10">
        <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-muted-foreground/60">
          <span>Subtotal</span>
          <span className="text-secondary tabular-nums">
            ${subtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-muted-foreground/60">
          <span>Delivery Concierge</span>
          <span className="text-secondary tabular-nums">
            ${deliveryFee.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-muted-foreground/60">
          <span>Global Service</span>
          <span className="text-secondary tabular-nums">
            ${serviceFee.toFixed(2)}
          </span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-emerald-600">
            <span>Discount</span>
            <span className="tabular-nums">-${discount.toFixed(2)}</span>
          </div>
        )}
      </div>

      <Separator className="mb-6" />

      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
            Total Investment
          </p>
          <p className="text-4xl font-heading font-black text-secondary tabular-nums tracking-tighter">
            ${total.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
