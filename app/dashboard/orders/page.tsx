"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Star,
  Package,
  CheckCircle,
  XCircle,
  TrendingUp,
  Search,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useOrders } from "@/lib/hooks/order.hooks";
import type { OrderStatus } from "@/lib/api/types/order.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const pageSize = 10;

  // Fetch orders with filters
  const {
    data: ordersResponse,
    isLoading,
    error,
    refetch,
  } = useOrders({
    page: currentPage,
    limit: pageSize,
    status: filterStatus !== "all" ? filterStatus : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const orders = ordersResponse?.data || [];
  const totalPages = ordersResponse ? ordersResponse.pagination.totalPages : 1;

  // Calculate stats from fetched orders
  const stats = useMemo(() => {
    if (!ordersResponse) {
      return {
        total: 0,
        delivered: 0,
        cancelled: 0,
        totalSpent: 0,
      };
    }

    return {
      total: ordersResponse.pagination.total,
      delivered: orders.filter((o) => o.status === "delivered").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
      totalSpent: orders
        .filter((o) => o.status === "delivered")
        .reduce((sum, o) => sum + o.total, 0),
    };
  }, [ordersResponse, orders]);

  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case "delivered":
        return {
          label: "Delivered",
          color: "bg-green-50 text-green-700 border-green-200",
          icon: CheckCircle,
        };
      case "pending":
        return {
          label: "Pending",
          color: "bg-yellow-50 text-yellow-700 border-yellow-200",
          icon: Clock,
        };
      case "confirmed":
        return {
          label: "Confirmed",
          color: "bg-blue-50 text-blue-700 border-blue-200",
          icon: Package,
        };
      case "preparing":
        return {
          label: "Preparing",
          color: "bg-purple-50 text-purple-700 border-purple-200",
          icon: Package,
        };
      case "ready":
        return {
          label: "Ready",
          color: "bg-green-50 text-green-700 border-green-200",
          icon: Package,
        };
      case "out_for_delivery":
        return {
          label: "Out for Delivery",
          color: "bg-indigo-50 text-indigo-700 border-indigo-200",
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
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
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">
              Status Filter
            </label>
            <Select
              value={filterStatus}
              onValueChange={(value) =>
                setFilterStatus(value as OrderStatus | "all")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="out_for_delivery">
                  Out for Delivery
                </SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start date"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">End Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End date"
            />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="flex gap-4 animate-pulse">
                <div className="w-16 h-16 rounded-xl bg-muted" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="p-12 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="font-heading font-semibold text-lg mb-2">
            Failed to Load Orders
          </h3>
          <p className="text-muted-foreground mb-6">
            {error instanceof Error
              ? error.message
              : "An error occurred while loading your orders"}
          </p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </Card>
      )}

      {/* Orders List */}
      {!isLoading && !error && (
        <>
          <div className="space-y-4">
            {orders.map((order) => {
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
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-50 to-rose-50 flex items-center justify-center text-3xl shrink-0">
                        🍽️
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="font-heading font-semibold text-lg mb-1">
                              Order #{order.id.slice(0, 8)}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {order.items.length} item
                              {order.items.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={statusConfig.color}
                          >
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </div>

                        <div className="space-y-1 mb-3">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <p
                              key={idx}
                              className="text-sm text-muted-foreground"
                            >
                              {item.quantity}x {item.name}
                            </p>
                          ))}
                          {order.items.length > 3 && (
                            <p className="text-sm text-muted-foreground italic">
                              +{order.items.length - 3} more item
                              {order.items.length - 3 !== 1 ? "s" : ""}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(order.createdAt)} at{" "}
                            {formatTime(order.createdAt)}
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
                        {order.status === "delivered" && order.rating && (
                          <div className="flex items-center gap-1 justify-end mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < order.rating!
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-muted"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 w-full">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          asChild
                        >
                          <Link href={`/orders/${order.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}

            {orders.length === 0 && (
              <Card className="p-12 text-center">
                <Package className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="font-heading font-semibold text-lg mb-2">
                  No orders found
                </h3>
                <p className="text-muted-foreground mb-6">
                  {filterStatus !== "all" || startDate || endDate
                    ? "Try adjusting your filters"
                    : "Start ordering from your favorite restaurants"}
                </p>
                <Button asChild>
                  <Link href="/restaurants">Browse Restaurants</Link>
                </Button>
              </Card>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
