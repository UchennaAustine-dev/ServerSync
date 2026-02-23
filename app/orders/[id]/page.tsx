"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useOrder,
  useCancelOrder,
  useRateOrder,
} from "@/lib/hooks/order.hooks";
import { CancelOrderModal } from "@/components/order/CancelOrderModal";
import { RateOrderModal } from "@/components/order/RateOrderModal";
import { showSuccessToast, showErrorToast } from "@/lib/utils/error-handler";
import { useOrderTracking, useWebSocket } from "@/lib/websocket/hooks";
import {
  CheckCircle,
  ArrowLeft,
  MapPin,
  Phone,
  XCircle,
  Star,
  Truck,
  Clock,
  Navigation,
} from "lucide-react";
import type { OrderStatus } from "@/lib/api/types/order.types";

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const { data: order, isLoading, error } = useOrder(orderId);
  const cancelOrderMutation = useCancelOrder();
  const rateOrderMutation = useRateOrder();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);

  // WebSocket connection and real-time tracking
  const { isConnected } = useWebSocket();
  const {
    orderStatus: realtimeStatus,
    driverInfo,
    driverLocation,
    lastUpdate,
    estimatedArrival,
  } = useOrderTracking(orderId);

  // Use real-time status if available, otherwise fall back to order data
  const currentStatus = realtimeStatus || order?.status;

  // Determine if order can be cancelled
  const cancellableStatuses: OrderStatus[] = [
    "pending",
    "confirmed",
    "preparing",
  ];
  const canCancel =
    order && cancellableStatuses.includes(currentStatus as OrderStatus);

  // Determine if order can be rated (delivered and not yet rated)
  const canRate = order && currentStatus === "delivered" && !order.rating;

  const handleCancelOrder = async (reason: string) => {
    try {
      await cancelOrderMutation.mutateAsync({
        orderId,
        data: { reason },
      });

      showSuccessToast("Order cancelled successfully");
      setIsCancelModalOpen(false);
    } catch (error) {
      showErrorToast(error);
    }
  };

  const handleRateOrder = async (rating: number, review?: string) => {
    try {
      await rateOrderMutation.mutateAsync({
        orderId,
        data: { rating, review },
      });

      showSuccessToast("Thank you for your feedback!");
      setIsRateModalOpen(false);
    } catch (error) {
      showErrorToast(error);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !order) {
    return (
      <MainLayout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-heading text-secondary">
              Order Not Found
            </h2>
            <p className="text-muted-foreground">
              We couldn't find the order you're looking for.
            </p>
            <Button onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "confirmed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "preparing":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "ready":
        return "bg-green-50 text-green-700 border-green-200";
      case "out_for_delivery":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Order status timeline
  const statusSteps = [
    { status: "pending", label: "Order Placed", icon: CheckCircle },
    { status: "confirmed", label: "Confirmed", icon: CheckCircle },
    { status: "preparing", label: "Preparing", icon: Clock },
    { status: "ready", label: "Ready", icon: CheckCircle },
    { status: "out_for_delivery", label: "Out for Delivery", icon: Truck },
    { status: "delivered", label: "Delivered", icon: CheckCircle },
  ];

  const getStatusIndex = (status: string) => {
    return statusSteps.findIndex((step) => step.status === status);
  };

  const currentStatusIndex = getStatusIndex(currentStatus || "pending");
  const isCancelled = currentStatus === "cancelled";

  return (
    <MainLayout>
      <div className="min-h-[80vh] py-20 px-6">
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in zoom-in-95 duration-1000">
          {/* Success Icon */}
          <div className="relative inline-block group mx-auto block">
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full scale-150 animate-pulse" />
            <div className="relative w-32 h-32 rounded-[40px] bg-white shadow-2xl flex items-center justify-center border border-gray-50 mx-auto">
              <CheckCircle className="w-16 h-16 text-primary" strokeWidth={1} />
            </div>
          </div>

          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-6xl md:text-8xl font-heading text-secondary tracking-tighter">
              Order <span className="italic text-primary">Confirmed.</span>
            </h1>
            <p className="text-xl text-muted-foreground font-medium italic opacity-70">
              "Your culinary experience is now being carefully prepared."
            </p>
            {isConnected && (
              <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Live tracking active</span>
              </div>
            )}
          </div>

          {/* Real-time Status Timeline */}
          {!isCancelled && (
            <div className="bg-white/60 backdrop-blur-xl p-10 rounded-[40px] border border-white/40 shadow-sm">
              <div className="mb-6">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">
                  Order Status
                </p>
                {lastUpdate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Last updated: {new Date(lastUpdate).toLocaleTimeString()}
                  </p>
                )}
              </div>

              <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
                <div
                  className="absolute left-6 top-0 w-0.5 bg-primary transition-all duration-500"
                  style={{
                    height: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%`,
                  }}
                />

                {/* Status Steps */}
                <div className="space-y-8">
                  {statusSteps.map((step, index) => {
                    const isCompleted = index <= currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;
                    const StepIcon = step.icon;

                    return (
                      <div
                        key={step.status}
                        className="relative flex items-center gap-4"
                      >
                        {/* Icon */}
                        <div
                          className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isCompleted
                              ? "bg-primary text-white shadow-lg"
                              : "bg-gray-100 text-gray-400"
                          } ${isCurrent ? "ring-4 ring-primary/20 scale-110" : ""}`}
                        >
                          <StepIcon className="w-6 h-6" />
                        </div>

                        {/* Label */}
                        <div className="flex-1">
                          <p
                            className={`font-heading text-lg ${
                              isCompleted
                                ? "text-secondary"
                                : "text-muted-foreground"
                            }`}
                          >
                            {step.label}
                          </p>
                          {isCurrent && (
                            <p className="text-sm text-primary font-medium animate-pulse">
                              In progress...
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Driver Information & Location */}
          {driverInfo && (
            <div className="bg-white/60 backdrop-blur-xl p-10 rounded-[40px] border border-white/40 shadow-sm space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">
                  Your Driver
                </p>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Truck className="w-8 h-8 text-primary" />
                </div>

                <div className="flex-1 space-y-3">
                  <div>
                    <p className="font-heading text-xl text-secondary">
                      {driverInfo.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {driverInfo.vehicle}
                      {driverInfo.vehicleNumber &&
                        ` • ${driverInfo.vehicleNumber}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <a
                      href={`tel:${driverInfo.phone}`}
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Phone className="w-4 h-4" />
                      {driverInfo.phone}
                    </a>
                    {driverInfo.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-medium">
                          {driverInfo.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  {estimatedArrival && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Estimated arrival: {estimatedArrival} minutes</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Driver Location Map Placeholder */}
              {driverLocation && (
                <div className="pt-6 border-t border-gray-100">
                  <div className="bg-gray-100 rounded-2xl h-64 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10" />
                    <div className="relative z-10 text-center space-y-2">
                      <Navigation className="w-12 h-12 text-primary mx-auto animate-pulse" />
                      <p className="text-sm font-medium text-secondary">
                        Driver Location
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Lat: {driverLocation.lat.toFixed(6)}, Lng:{" "}
                        {driverLocation.lng.toFixed(6)}
                      </p>
                      <p className="text-xs text-muted-foreground italic">
                        Map integration coming soon
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Order Details */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Order Info Card */}
            <div className="bg-white/60 backdrop-blur-xl p-10 rounded-[40px] border border-white/40 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                    Order Reference
                  </p>
                  <p className="text-2xl font-heading text-secondary truncate">
                    #{order.id.slice(0, 12)}
                  </p>
                </div>
                <Badge
                  className={`${getStatusColor(currentStatus || order.status)} font-black px-4 h-8 rounded-xl`}
                >
                  {formatStatus(currentStatus || order.status)}
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                  <span>Total Amount</span>
                  <span className="text-xl font-heading text-secondary tabular-nums">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
                {order.estimatedDeliveryTime && (
                  <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                    <span>Estimated Delivery</span>
                    <span className="text-secondary font-bold">
                      {new Date(order.estimatedDeliveryTime).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </span>
                  </div>
                )}
                {order.rating && (
                  <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                    <span>Your Rating</span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < order.rating!
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Delivery Address */}
              <div className="pt-6 border-t border-gray-100 space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/40 mb-1">
                      Delivery Address
                    </p>
                    <p className="text-sm text-secondary">
                      {order.deliveryAddress.street}
                      <br />
                      {order.deliveryAddress.city},{" "}
                      {order.deliveryAddress.state}{" "}
                      {order.deliveryAddress.zipCode}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/40 mb-1">
                      Contact Number
                    </p>
                    <p className="text-sm text-secondary">
                      {order.contactPhone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Review Display */}
              {order.review && (
                <div className="pt-6 border-t border-gray-100">
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/40 mb-2">
                    Your Review
                  </p>
                  <p className="text-sm text-secondary italic">
                    "{order.review}"
                  </p>
                </div>
              )}
            </div>

            {/* Order Items Card */}
            <div className="bg-white/60 backdrop-blur-xl p-10 rounded-[40px] border border-white/40 shadow-sm space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">
                  Order Items
                </p>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-start gap-4 pb-4 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-heading text-secondary">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                      {item.specialInstructions && (
                        <p className="text-xs text-muted-foreground italic mt-1">
                          Note: {item.specialInstructions}
                        </p>
                      )}
                    </div>
                    <p className="font-heading text-secondary tabular-nums">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-100 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-secondary tabular-nums">
                    ${order.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="text-secondary tabular-nums">
                    ${order.deliveryFee.toFixed(2)}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-primary tabular-nums">
                      -${order.discount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-heading pt-2 border-t border-gray-100">
                  <span className="text-secondary">Total</span>
                  <span className="text-secondary tabular-nums">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              variant="outline"
              className="h-14 px-8 rounded-2xl font-black"
              onClick={() => router.push("/restaurants")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Order Again
            </Button>
            <Button
              className="h-14 px-8 rounded-2xl font-black"
              onClick={() => router.push("/dashboard")}
            >
              View My Orders
            </Button>
            {canRate && (
              <Button
                variant="outline"
                className="h-14 px-8 rounded-2xl font-black border-amber-200 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                onClick={() => setIsRateModalOpen(true)}
              >
                <Star className="w-4 h-4 mr-2" />
                Rate Order
              </Button>
            )}
            {canCancel && (
              <Button
                variant="outline"
                className="h-14 px-8 rounded-2xl font-black border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => setIsCancelModalOpen(true)}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancel Order
              </Button>
            )}
          </div>

          {/* Cancel Order Modal */}
          <CancelOrderModal
            isOpen={isCancelModalOpen}
            onClose={() => setIsCancelModalOpen(false)}
            onConfirm={handleCancelOrder}
            isLoading={cancelOrderMutation.isPending}
          />

          {/* Rate Order Modal */}
          <RateOrderModal
            isOpen={isRateModalOpen}
            onClose={() => setIsRateModalOpen(false)}
            onConfirm={handleRateOrder}
            isLoading={rateOrderMutation.isPending}
          />
        </div>
      </div>
    </MainLayout>
  );
}
