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
} from "lucide-react";
import { useState } from "react";

// Mock data - will be replaced with real API calls
const mockStats = [
  {
    label: "Pending Orders",
    value: "8",
    icon: AlertCircle,
    trend: "Needs attention",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    label: "In Preparation",
    value: "5",
    icon: ChefHat,
    trend: "Currently cooking",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    label: "Completed Today",
    value: "42",
    icon: CheckCircle2,
    trend: "+15% from yesterday",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    label: "Today's Revenue",
    value: "$1,247",
    icon: DollarSign,
    trend: "+8% from yesterday",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

const mockOrders = [
  {
    id: "ORD-1234",
    customer: "John Doe",
    items: [
      { name: "Kung Pao Chicken", quantity: 2 },
      { name: "Fried Rice", quantity: 1 },
      { name: "Spring Rolls", quantity: 3 },
    ],
    status: "pending",
    total: 45.5,
    time: "2 min ago",
    notes: "Extra spicy, no peanuts",
  },
  {
    id: "ORD-1235",
    customer: "Jane Smith",
    items: [
      { name: "Sweet & Sour Pork", quantity: 1 },
      { name: "Egg Fried Rice", quantity: 2 },
    ],
    status: "pending",
    total: 32.0,
    time: "5 min ago",
    notes: "",
  },
  {
    id: "ORD-1236",
    customer: "Mike Johnson",
    items: [
      { name: "General Tso's Chicken", quantity: 1 },
      { name: "Wonton Soup", quantity: 1 },
    ],
    status: "preparing",
    total: 28.75,
    time: "8 min ago",
    notes: "Deliver to room 302",
  },
  {
    id: "ORD-1237",
    customer: "Sarah Williams",
    items: [
      { name: "Beef Noodles", quantity: 2 },
      { name: "Dumplings", quantity: 1 },
    ],
    status: "preparing",
    total: 38.0,
    time: "12 min ago",
    notes: "",
  },
  {
    id: "ORD-1238",
    customer: "Tom Brown",
    items: [{ name: "Crispy Duck", quantity: 1 }],
    status: "ready",
    total: 24.5,
    time: "15 min ago",
    notes: "",
  },
];

export default function KitchenDashboard() {
  const [orders, setOrders] = useState(mockOrders);

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

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order,
      ),
    );
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
            <p className="text-sm text-muted-foreground">{order.customer}</p>
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

        {order.notes && (
          <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-xs font-medium text-amber-900 mb-1">
              Special Instructions:
            </p>
            <p className="text-sm text-amber-800">{order.notes}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{order.time}</span>
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
              onClick={() => updateOrderStatus(order.id, "completed")}
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
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {mockStats.map((stat) => {
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
