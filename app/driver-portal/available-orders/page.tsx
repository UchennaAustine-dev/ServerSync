"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth.store";
import {
  useAvailableOrders,
  useAcceptOrder,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Store,
  DollarSign,
  Clock,
  Navigation,
  AlertCircle,
  Package,
} from "lucide-react";
import { toast } from "@/lib/utils/toast";

/**
 * Available Orders Page for Drivers
 *
 * Displays orders available for pickup with:
 * - Restaurant information
 * - Delivery address
 * - Delivery fee
 * - Distance and duration estimates
 * - Accept order functionality with estimated pickup time input
 *
 * Requirements: 12.2, 12.3, 12.4, 12.5, 12.6
 */
export default function AvailableOrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { data: profile } = useDriverProfile();
  const { data: ordersData, isLoading, error } = useAvailableOrders();
  const acceptOrder = useAcceptOrder();

  // Dialog state for accepting orders
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [estimatedPickupMinutes, setEstimatedPickupMinutes] = useState("15");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const handleOpenAcceptDialog = (orderId: string) => {
    setSelectedOrderId(orderId);
    setEstimatedPickupMinutes("15"); // Reset to default
    setIsDialogOpen(true);
  };

  const handleAcceptOrder = async () => {
    if (!selectedOrderId) return;

    try {
      // Calculate estimated pickup time based on minutes input
      const minutes = parseInt(estimatedPickupMinutes, 10);
      if (isNaN(minutes) || minutes < 1 || minutes > 120) {
        toast.error(
          "Please enter a valid pickup time between 1 and 120 minutes",
        );
        return;
      }

      const estimatedPickupTime = new Date(
        Date.now() + minutes * 60 * 1000,
      ).toISOString();

      await acceptOrder.mutateAsync({
        orderId: selectedOrderId,
        data: { estimatedPickupTime },
      });

      toast.success(
        "Order accepted! Navigate to Active Deliveries to manage it.",
      );

      // Close dialog and reset state
      setIsDialogOpen(false);
      setSelectedOrderId(null);

      // Navigate to active orders
      router.push("/driver-portal/active-orders");
    } catch (error: any) {
      // Handle case where another driver accepted first
      if (error.response?.status === 409) {
        toast.error("This order was just accepted by another driver");
        setIsDialogOpen(false);
        setSelectedOrderId(null);
      } else {
        toast.error("Failed to accept order. Please try again");
      }
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  // Check if driver is approved and available
  const isApproved = profile?.status === "approved";
  const isAvailable = profile?.isAvailable;

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
                  available orders.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAvailable) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-blue-600">
                <AlertCircle className="h-5 w-5" />
                <p>
                  You must be available to view orders. Toggle your availability
                  status in the Driver Dashboard.
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
                Available Orders
              </h1>
              <p className="text-muted-foreground mt-1">
                Orders ready for pickup and delivery
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
            <Skeleton className="h-64" />
          </div>
        ) : error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <p>Failed to load available orders. Please try again.</p>
              </div>
            </CardContent>
          </Card>
        ) : ordersData?.data && ordersData.data.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {ordersData.data.length} order
                {ordersData.data.length !== 1 ? "s" : ""} available
              </p>
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                Auto-refreshing every 30s
              </Badge>
            </div>

            {ordersData.data.map((order) => (
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
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        {order.status}
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
                    <div className="flex items-start gap-3">
                      <Store className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="font-bold text-secondary">
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
                  </div>

                  {/* Delivery Address */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="font-bold text-secondary">
                          Delivery Address
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.deliveryLocation.street}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.deliveryLocation.city},{" "}
                          {order.deliveryLocation.state}{" "}
                          {order.deliveryLocation.zipCode}
                        </p>
                      </div>
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

                  {/* Order Details */}
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

                  {/* Accept Button */}
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => handleOpenAcceptDialog(order.id)}
                    disabled={acceptOrder.isPending}
                  >
                    Accept Order
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-bold text-secondary mb-2">
                  No Available Orders
                </h3>
                <p className="text-sm text-muted-foreground">
                  There are currently no orders available for pickup. Check back
                  soon!
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Accept Order Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Order</DialogTitle>
            <DialogDescription>
              Enter your estimated pickup time to accept this order. This helps
              the restaurant prepare the food on time.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pickup-time">
                Estimated Pickup Time (minutes)
              </Label>
              <Input
                id="pickup-time"
                type="number"
                min="1"
                max="120"
                value={estimatedPickupMinutes}
                onChange={(e) => setEstimatedPickupMinutes(e.target.value)}
                placeholder="15"
              />
              <p className="text-xs text-muted-foreground">
                How many minutes until you can pick up this order? (1-120
                minutes)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={acceptOrder.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAcceptOrder}
              disabled={acceptOrder.isPending}
            >
              {acceptOrder.isPending ? "Accepting..." : "Confirm Accept"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
