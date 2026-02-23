"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth.store";
import {
  useActiveOrders,
  useUpdateDeliveryStatus,
  useDriverProfile,
} from "@/lib/hooks/driver.hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MapPin,
  Store,
  DollarSign,
  Clock,
  Navigation,
  AlertCircle,
  Package,
  CheckCircle,
} from "lucide-react";
import { toast } from "@/lib/utils/toast";
import type { DriverOrder } from "@/lib/api/types/driver.types";

/**
 * Active Orders Page for Drivers
 *
 * Displays currently assigned orders with:
 * - Restaurant and customer information
 * - Order items summary
 * - Current delivery status
 * - Status update controls with confirmation dialogs
 * - Navigation to pickup/delivery locations
 *
 * Requirements: 12.6, 12.7, 12.8
 */
export default function ActiveOrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { data: profile } = useDriverProfile();
  const { data: ordersData, isLoading, error } = useActiveOrders();
  const updateStatus = useUpdateDeliveryStatus();
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    orderId: string;
    status: "accepted" | "picked_up" | "in_transit" | "delivered";
    orderNumber: string;
  } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: "accepted" | "picked_up" | "in_transit" | "delivered",
  ) => {
    try {
      await updateStatus.mutateAsync({
        orderId,
        data: { status: newStatus },
      });

      const statusMessages = {
        accepted: "Order accepted",
        picked_up: "Order marked as picked up",
        in_transit: "Order marked as in transit",
        delivered: "Order marked as delivered",
      };

      toast.success(statusMessages[newStatus]);

      // Close confirmation dialog if open
      setConfirmDialog(null);
    } catch (error: any) {
      toast.error("Failed to update delivery status. Please try again");
    }
  };

  const handleStatusButtonClick = (
    orderId: string,
    newStatus: "accepted" | "picked_up" | "in_transit" | "delivered",
    orderNumber: string,
  ) => {
    // Show confirmation dialog for "delivered" status
    if (newStatus === "delivered") {
      setConfirmDialog({
        open: true,
        orderId,
        status: newStatus,
        orderNumber,
      });
    } else {
      // For other statuses, update immediately
      handleStatusUpdate(orderId, newStatus);
    }
  };

  const getNextStatus = (
    currentStatus: string,
  ): "accepted" | "picked_up" | "in_transit" | "delivered" | null => {
    const statusFlow = {
      pending: "accepted" as const,
      confirmed: "accepted" as const,
      preparing: "accepted" as const,
      ready: "picked_up" as const,
      out_for_delivery: "in_transit" as const,
      accepted: "picked_up" as const,
      picked_up: "in_transit" as const,
      in_transit: "delivered" as const,
    };

    return statusFlow[currentStatus as keyof typeof statusFlow] || null;
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      pending: "Pending",
      confirmed: "Confirmed",
      preparing: "Preparing",
      ready: "Ready for Pickup",
      accepted: "Accepted",
      picked_up: "Picked Up",
      out_for_delivery: "Out for Delivery",
      in_transit: "In Transit",
      delivered: "Delivered",
    };

    return labels[status] || status;
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      pending: "bg-gray-100 text-gray-700 border-gray-200",
      confirmed: "bg-blue-50 text-blue-700 border-blue-200",
      preparing: "bg-yellow-50 text-yellow-700 border-yellow-200",
      ready: "bg-green-50 text-green-700 border-green-200",
      accepted: "bg-blue-50 text-blue-700 border-blue-200",
      picked_up: "bg-purple-50 text-purple-700 border-purple-200",
      out_for_delivery: "bg-indigo-50 text-indigo-700 border-indigo-200",
      in_transit: "bg-indigo-50 text-indigo-700 border-indigo-200",
      delivered: "bg-green-50 text-green-700 border-green-200",
    };

    return colors[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getNextStatusLabel = (nextStatus: string): string => {
    const labels: Record<string, string> = {
      accepted: "Mark as Accepted",
      picked_up: "Mark as Picked Up",
      in_transit: "Mark as In Transit",
      delivered: "Mark as Delivered",
    };

    return labels[nextStatus] || "Update Status";
  };

  const getGoogleMapsUrl = (address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  }): string => {
    const fullAddress = `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
  };

  if (!isAuthenticated) {
    return null;
  }

  const isApproved = profile?.status === "approved";

  if (!isApproved) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-yellow-600">
                <AlertCircle className="h-5 w-5" />
                <p>
                  Your driver account must be approved before you can view
                  active orders.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-secondary">
                Active Deliveries
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your currently assigned orders
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/driver-portal")}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        ) : error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <p>Failed to load active orders. Please try again.</p>
              </div>
            </CardContent>
          </Card>
        ) : ordersData?.data && ordersData.data.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {ordersData.data.length} active delivery
                {ordersData.data.length !== 1 ? "ies" : ""}
              </p>
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                Auto-refreshing every 10s
              </Badge>
            </div>

            {ordersData.data.map((order: DriverOrder) => {
              const nextStatus = getNextStatus(order.status);

              return (
                <Card
                  key={order.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-xl">
                          Order #{order.id.slice(0, 8)}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className={getStatusColor(order.status)}
                        >
                          {getStatusLabel(order.status)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-green-600">
                          ${order.deliveryFee.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Delivery fee
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Restaurant Information */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <Store className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="font-bold text-secondary">
                              Pickup Location
                            </p>
                            <p className="text-base font-medium mt-1">
                              {order.restaurant.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.pickupLocation.street}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.pickupLocation.city},{" "}
                              {order.pickupLocation.state}{" "}
                              {order.pickupLocation.zipCode}
                            </p>
                            {order.restaurant.phone && (
                              <p className="text-sm text-muted-foreground mt-1">
                                📞 {order.restaurant.phone}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(
                              getGoogleMapsUrl(order.pickupLocation),
                              "_blank",
                            )
                          }
                        >
                          <Navigation className="h-4 w-4 mr-2" />
                          Navigate
                        </Button>
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="font-bold text-secondary">
                              Delivery Address
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {order.deliveryLocation.street}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.deliveryLocation.city},{" "}
                              {order.deliveryLocation.state}{" "}
                              {order.deliveryLocation.zipCode}
                            </p>
                            {order.contactPhone && (
                              <p className="text-sm text-muted-foreground mt-1">
                                📞 {order.contactPhone}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(
                              getGoogleMapsUrl(order.deliveryLocation),
                              "_blank",
                            )
                          }
                        >
                          <Navigation className="h-4 w-4 mr-2" />
                          Navigate
                        </Button>
                      </div>
                    </div>

                    {/* Distance and Duration Estimates */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Navigation className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Distance
                          </p>
                          <p className="font-bold text-secondary">
                            {order.estimatedDistance.toFixed(1)} mi
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Est. Duration
                          </p>
                          <p className="font-bold text-secondary">
                            {order.estimatedDuration} min
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Order Items Summary */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">Order Items</p>
                      </div>
                      <div className="pl-6 space-y-1">
                        {order.items.map((item, index) => (
                          <p
                            key={index}
                            className="text-sm text-muted-foreground"
                          >
                            {item.quantity}x {item.name}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Special Instructions */}
                    {order.specialInstructions && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs font-medium text-blue-900 mb-1">
                          Special Instructions
                        </p>
                        <p className="text-sm text-blue-700">
                          {order.specialInstructions}
                        </p>
                      </div>
                    )}

                    {/* Order Total */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">Order Total</p>
                      </div>
                      <p className="font-bold text-secondary">
                        ${order.total.toFixed(2)}
                      </p>
                    </div>

                    {/* Status Update Button */}
                    {nextStatus && (
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={() =>
                          handleStatusButtonClick(
                            order.id,
                            nextStatus,
                            order.id.slice(0, 8),
                          )
                        }
                        disabled={updateStatus.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {getNextStatusLabel(nextStatus)}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-bold text-secondary mb-2">
                  No Active Deliveries
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  You don't have any active deliveries at the moment.
                </p>
                <Button
                  onClick={() => router.push("/driver-portal/available-orders")}
                >
                  View Available Orders
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Confirmation Dialog for Delivered Status */}
      <Dialog
        open={confirmDialog?.open || false}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmDialog(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delivery Completion</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark Order #{confirmDialog?.orderNumber}{" "}
              as delivered? This action confirms that the order has been
              successfully delivered to the customer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog(null)}
              disabled={updateStatus.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (confirmDialog) {
                  handleStatusUpdate(
                    confirmDialog.orderId,
                    confirmDialog.status,
                  );
                }
              }}
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending ? "Confirming..." : "Confirm Delivery"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
