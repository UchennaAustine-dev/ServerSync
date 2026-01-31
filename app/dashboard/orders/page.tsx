"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  MapPin,
  Star,
  Package,
  CheckCircle,
  XCircle,
  TrendingUp,
  Filter,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import Link from "next/link";

// Mock data - will be replaced with real API calls
const mockOrders = [
  {
    id: "ORD-8234",
    restaurant: "Dragon Wok",
    restaurantId: "1",
    items: [
      { name: "Kung Pao Chicken", quantity: 2, price: 14.5 },
      { name: "Fried Rice", quantity: 1, price: 8.0 },
      { name: "Spring Rolls", quantity: 3, price: 2.5 },
    ],
    status: "delivered",
    total: 45.5,
    date: "Jan 30, 2026",
    time: "7:45 PM",
    rating: 5,
    image: "🥡",
  },
  {
    id: "ORD-8233",
    restaurant: "Pizza Paradise",
    restaurantId: "2",
    items: [
      { name: "Margherita Pizza", quantity: 1, price: 18.99 },
      { name: "Garlic Bread", quantity: 1, price: 6.0 },
    ],
    status: "delivered",
    total: 24.99,
    date: "Jan 28, 2026",
    time: "6:30 PM",
    rating: 4,
    image: "🍕",
  },
  {
    id: "ORD-8232",
    restaurant: "Burger Haven",
    restaurantId: "3",
    items: [
      { name: "Double Cheeseburger", quantity: 1, price: 12.5 },
      { name: "Fries", quantity: 1, price: 4.0 },
      { name: "Milkshake", quantity: 1, price: 5.5 },
    ],
    status: "delivered",
    total: 22.0,
    date: "Jan 26, 2026",
    time: "8:15 PM",
    rating: 5,
    image: "🍔",
  },
  {
    id: "ORD-8231",
    restaurant: "Sushi Masters",
    restaurantId: "4",
    items: [
      { name: "California Roll", quantity: 2, price: 12.0 },
      { name: "Salmon Nigiri", quantity: 1, price: 15.0 },
      { name: "Miso Soup", quantity: 1, price: 5.0 },
    ],
    status: "delivered",
    total: 44.0,
    date: "Jan 25, 2026",
    time: "7:00 PM",
    rating: 5,
    image: "🍣",
  },
  {
    id: "ORD-8230",
    restaurant: "Taco Fiesta",
    restaurantId: "5",
    items: [
      { name: "Beef Tacos", quantity: 3, price: 3.5 },
      { name: "Guacamole", quantity: 1, price: 4.0 },
    ],
    status: "cancelled",
    total: 14.5,
    date: "Jan 24, 2026",
    time: "6:45 PM",
    rating: 0,
    image: "🌮",
  },
  {
    id: "ORD-8229",
    restaurant: "Dragon Wok",
    restaurantId: "1",
    items: [
      { name: "Sweet & Sour Pork", quantity: 1, price: 13.5 },
      { name: "Egg Fried Rice", quantity: 2, price: 8.0 },
    ],
    status: "delivered",
    total: 29.5,
    date: "Jan 22, 2026",
    time: "8:30 PM",
    rating: 4,
    image: "🥡",
  },
];

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "delivered":
        return {
          label: "Delivered",
          color: "bg-green-50 text-green-700 border-green-200",
          icon: CheckCircle,
        };
      case "in_progress":
        return {
          label: "In Progress",
          color: "bg-blue-50 text-blue-700 border-blue-200",
          icon: Package,
        };
      case "cancelled":
        return {
          label: "Cancelled",
          color: "bg-red-50 text-red-700 border-red-200",
          icon: XCircle,
        };
      default:
        return {
          label: status,
          color: "bg-muted text-muted-foreground",
          icon: Package,
        };
    }
  };

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch =
      order.restaurant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: mockOrders.length,
    delivered: mockOrders.filter((o) => o.status === "delivered").length,
    cancelled: mockOrders.filter((o) => o.status === "cancelled").length,
    totalSpent: mockOrders
      .filter((o) => o.status === "delivered")
      .reduce((sum, o) => sum + o.total, 0),
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-secondary mb-2">
          Order History
        </h1>
        <p className="text-muted-foreground">
          View and manage all your past orders
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Orders</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold">
                {stats.delivered}
              </p>
              <p className="text-xs text-muted-foreground">Delivered</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold">
                {stats.cancelled}
              </p>
              <p className="text-xs text-muted-foreground">Cancelled</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold">
                ${stats.totalSpent.toFixed(0)}
              </p>
              <p className="text-xs text-muted-foreground">Total Spent</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search orders or restaurants..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("all")}
          >
            All
          </Button>
          <Button
            variant={filterStatus === "delivered" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("delivered")}
          >
            Delivered
          </Button>
          <Button
            variant={filterStatus === "cancelled" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("cancelled")}
          >
            Cancelled
          </Button>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const statusConfig = getStatusConfig(order.status);
          const StatusIcon = statusConfig.icon;

          return (
            <Card
              key={order.id}
              className="p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left: Order Info */}
                <div className="flex gap-4 flex-1">
                  <div className="w-16 h-16 rounded-xl bg-linear-to-br from-orange-50 to-rose-50 flex items-center justify-center text-3xl shrink-0">
                    {order.image}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="font-heading font-semibold text-lg mb-1">
                          {order.restaurant}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Order #{order.id}
                        </p>
                      </div>
                      <Badge variant="outline" className={statusConfig.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </div>

                    <div className="space-y-1 mb-3">
                      {order.items.map((item, idx) => (
                        <p key={idx} className="text-sm text-muted-foreground">
                          {item.quantity}x {item.name}
                        </p>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {order.date} at {order.time}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col items-end justify-between lg:w-48 shrink-0">
                  <div className="text-right mb-4 lg:mb-0">
                    <p className="text-lg font-heading font-bold">
                      ${order.total.toFixed(2)}
                    </p>
                    {order.status === "delivered" && order.rating > 0 && (
                      <div className="flex items-center gap-1 justify-end mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < order.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 w-full">
                    {order.status === "delivered" && (
                      <>
                        <Button size="sm" variant="outline" className="w-full">
                          Reorder
                        </Button>
                        {order.rating === 0 && (
                          <Button size="sm" className="w-full">
                            Rate Order
                          </Button>
                        )}
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full"
                      asChild
                    >
                      <Link href={`/restaurants/${order.restaurantId}`}>
                        View Restaurant
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {filteredOrders.length === 0 && (
          <Card className="p-12 text-center">
            <Package className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="font-heading font-semibold text-lg mb-2">
              No orders found
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? "Try adjusting your search or filters"
                : "Start ordering from your favorite restaurants"}
            </p>
            <Button asChild>
              <Link href="/restaurants">Browse Restaurants</Link>
            </Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
