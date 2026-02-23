"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Package,
  ChefHat,
  Timer,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useWebSocket, useKitchenNotifications } from "@/lib/websocket/hooks";
import { useAuthStore } from "@/lib/store/auth.store";
import { useRestaurantOrders } from "@/lib/hooks/restaurant.hooks";
import { useUpdateOrderStatus } from "@/lib/hooks/order.hooks";
import { showSuccessToast, showErrorToast } from "@/lib/utils/error-handler";
import type { Order } from "@/lib/api/types/order.types";

export default function KitchenDashboard() {
  // Get restaurant ID from user profile (assuming restaurant owner is logged in)
  const user = useAuthStore((state) => state.user);
  const restaurantId = user?.restaurantId || null; // Adjust based on your user model

  // WebSocket connection
  const { isConnected } = useWebSocket();

  // Fetch orders from API
  const {
    data: ordersData,
    isLoading,
    error,
  } = useRestaurantOrders(restaurantId || "");
  const updateStatusMutation = useUpdateOrderStatus();

  // Kitchen notifications with real-time updates
  const {
    newOrders,
    notificationCount,
    soundEnabled,
    browserNotificationsEnabled,
    clearNotifications,
    removeOrder,
    toggleSound,
  } = useKitchenNotifications(restaurantId);

  const [orders, setOrders] = useState<Order[]>([]);

  // Initialize orders from API
  useEffect(() => {
    if (ordersData) {
      setOrders(ordersData);
    }
  }, [ordersData]);

  // Merge new orders from WebSocket with existing orders
  useEffect(() => {
    if (newOrders.length > 0) {
      setOrders((prev) => {
        const existingIds = new Set(prev.map((o) => o.id));
        const uniqueNewOrders = newOrders.filter((o) => !existingIds.has(o.id));
        return [...uniqueNewOrders, ...prev];
      });
    }
  }, [newOrders]);

  // Calculate stats from real orders
  const stats = [
    {
      label: "Pending Orders",
      value: orders.filter((o) => o.status === "pending").length.toString(),
      icon: AlertCircle,
      trend: "Needs attention",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      label: "In Preparation",
      value: orders.filter((o) => o.status === "preparing").length.toString(),
      icon: ChefHat,
      trend: "Currently cooking",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Completed Today",
      value: orders
        .filter((o) => {
          const today = new Date().toDateString();
          return (
            o.status === "delivered" &&
            new Date(o.createdAt).toDateString() === today
          );
        })
        .length.toString(),
      icon: CheckCircle2,
      trend: "Today",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Today's Revenue",
      value: `$${orders
        .filter((o) => {
          const today = new Date().toDateString();
          return (
            o.status === "delivered" &&
            new Date(o.createdAt).toDateString() === today
          );
        })
        .reduce((sum, o) => sum + o.total, 0)
        .toFixed(0)}`,
      icon: DollarSign,
      trend: "Today",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: "New Order",
          color: "bg-orange-50 text-orange-700 border-orange-200",
          icon: AlertCircle,
        };
      case "preparing":
        return {
          label: "Preparing",
          color: "bg-blue-50 text-blue-700 border-blue-200",
          icon: ChefHat,
        };
      case "ready":
        return {
          label: "Ready",
          color: "bg-green-50 text-green-700 border-green-200",
          icon: CheckCircle2,
        };
      default:
        return {
          label: status,
          color: "bg-muted text-muted-foreground",
          icon: Package,
        };
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    // Update local state optimistically
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus as any } : order,
      ),
    );

    try {
      // Call API to update order status on backend
      await updateStatusMutation.mutateAsync({
        orderId,
        data: { status: newStatus as any },
      });
      showSuccessToast(`Order ${orderId.slice(0, 8)} updated to ${newStatus}`);

      // Remove from new orders list if it was there
      removeOrder(orderId);
    } catch (error) {
      // Revert optimistic update on error
      showErrorToast("Failed to update order status");
      // Refetch to get correct state
      if (ordersData) {
        setOrders(ordersData);
      }
    }
  };

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const preparingOrders = orders.filter((o) => o.status === "preparing");
  const readyOrders = orders.filter((o) => o.status === "ready");

  const OrderCard = ({ order }: { order: (typeof orders)[0] }) => {
    const statusConfig = getStatusConfig(order.status);
    const StatusIcon = statusConfig.icon;

    return (
      <Card className="p-5 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-heading font-semibold text-lg text-secondary mb-1">
              {order.id}
            </h3>
            <p className="text-sm text-muted-foreground">{order.customerId}</p>
          </div>
          <Badge variant="outline" className={statusConfig.color}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusConfig.label}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          {order.items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-secondary">
                {item.quantity}x {item.name}
              </span>
            </div>
          ))}
        </div>

        {order.specialInstructions && (
          <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-xs font-medium text-amber-900 mb-1">
              Special Instructions:
            </p>
            <p className="text-sm text-amber-800">
              {order.specialInstructions}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{new Date(order.createdAt).toLocaleTimeString()}</span>
          </div>
          <div className="text-sm font-semibold text-secondary">
            ${order.total.toFixed(2)}
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          {order.status === "pending" && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => updateOrderStatus(order.id, "rejected")}
              >
                Reject
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => updateOrderStatus(order.id, "preparing")}
              >
                Accept Order
              </Button>
            </>
          )}
          {order.status === "preparing" && (
            <Button
              size="sm"
              className="w-full"
              onClick={() => updateOrderStatus(order.id, "ready")}
            >
              Mark as Ready
            </Button>
          )}
          {order.status === "ready" && (
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => updateOrderStatus(order.id, "out_for_delivery")}
            >
              Mark as Picked Up
            </Button>
          )}
        </div>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      {/* Real-time Connection Status & Controls */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}
            />
            <span className="text-sm text-muted-foreground">
              {isConnected ? "Live updates active" : "Connecting..."}
            </span>
          </div>

          {/* Notification Count */}
          {notificationCount > 0 && (
            <Badge variant="destructive" className="animate-bounce">
              {notificationCount} new{" "}
              {notificationCount === 1 ? "order" : "orders"}
            </Badge>
          )}
        </div>

        {/* Notification Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSound}
            className="gap-2"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4" />
                Sound On
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                Sound Off
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={!browserNotificationsEnabled}
          >
            {browserNotificationsEnabled ? (
              <>
                <Bell className="w-4 h-4" />
                Notifications On
              </>
            ) : (
              <>
                <BellOff className="w-4 h-4" />
                Notifications Off
              </>
            )}
          </Button>

          {notificationCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearNotifications}>
              Clear Notifications
            </Button>
          )}
        </div>
      </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-heading font-bold">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.trend}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-xl`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Kanban Board */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending Column */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <h2 className="text-lg font-heading font-semibold">New Orders</h2>
              <Badge variant="secondary" className="ml-1">
                {pendingOrders.length}
              </Badge>
            </div>
          </div>
          <div className="space-y-4">
            {pendingOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
            {pendingOrders.length === 0 && (
              <Card className="p-8 text-center">
                <Package className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No pending orders
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* Preparing Column */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <h2 className="text-lg font-heading font-semibold">
                In Preparation
              </h2>
              <Badge variant="secondary" className="ml-1">
                {preparingOrders.length}
              </Badge>
            </div>
          </div>
          <div className="space-y-4">
            {preparingOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
            {preparingOrders.length === 0 && (
              <Card className="p-8 text-center">
                <ChefHat className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No orders in preparation
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* Ready Column */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <h2 className="text-lg font-heading font-semibold">
                Ready for Pickup
              </h2>
              <Badge variant="secondary" className="ml-1">
                {readyOrders.length}
              </Badge>
            </div>
          </div>
          <div className="space-y-4">
            {readyOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
            {readyOrders.length === 0 && (
              <Card className="p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No orders ready</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Performance Banner */}
      <Card className="mt-8 bg-linear-to-r from-blue-50 to-indigo-50 border-blue-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Timer className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-lg text-secondary">
                Average Prep Time Today
              </h3>
              <p className="text-sm text-muted-foreground">
                Keep up the great work! Your efficiency is 12% above average.
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-heading font-bold text-blue-600">
              18m
            </div>
            <div className="text-xs text-muted-foreground">Target: 20m</div>
          </div>
        </div>
      </Card>
    </DashboardLayout>
  );
}
