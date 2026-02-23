"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ShoppingBag,
  Search,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  XCircle,
  Clock,
  CheckCircle,
  Package,
  Truck,
  MapPin,
  Calendar,
} from "lucide-react";
import { useAdminOrders, useAdminCancelOrder } from "@/lib/hooks/admin.hooks";
import type { Order, OrderStatus } from "@/lib/api/types/order.types";

export default function OrdersManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [restaurantFilter, setRestaurantFilter] = useState("");
  const [driverFilter, setDriverFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const limit = 10;

  // Build query params
  const queryParams = {
    page,
    limit,
    search: searchQuery || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    restaurantId: restaurantFilter || undefined,
    driverId: driverFilter || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  };

  const {
    data: ordersData,
    isLoading,
    error,
    refetch,
  } = useAdminOrders(queryParams);

  const cancelOrderMutation = useAdminCancelOrder();

  // Handle order detail view
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailDialogOpen(true);
  };

  // Handle order cancellation
  const handleCancelOrder = (order: Order) => {
    setSelectedOrder(order);
    setCancelReason("");
    setCancelDialogOpen(true);
  };

  const confirmCancelOrder = async () => {
    if (!selectedOrder || !cancelReason.trim()) return;

    await cancelOrderMutation.mutateAsync({
      id: selectedOrder.id,
      data: { reason: cancelReason },
    });

    setCancelDialogOpen(false);
    setSelectedOrder(null);
    setCancelReason("");
  };

  // Get status badge
  const getStatusBadge = (status: OrderStatus) => {
    const statusConfig = {
      pending: {
        label: "Pending",
        icon: Clock,
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
      confirmed: {
        label: "Confirmed",
        icon: CheckCircle,
        className: "bg-blue-100 text-blue-800 border-blue-200",
      },
      preparing: {
        label: "Preparing",
        icon: Package,
        className: "bg-purple-100 text-purple-800 border-purple-200",
      },
      ready: {
        label: "Ready",
        icon: CheckCircle,
        className: "bg-green-100 text-green-800 border-green-200",
      },
      out_for_delivery: {
        label: "Out for Delivery",
        icon: Truck,
        className: "bg-indigo-100 text-indigo-800 border-indigo-200",
      },
      delivered: {
        label: "Delivered",
        icon: CheckCircle,
        className: "bg-green-100 text-green-800 border-green-200",
      },
      cancelled: {
        label: "Cancelled",
        icon: XCircle,
        className: "bg-red-100 text-red-800 border-red-200",
      },
    };

    const config = statusConfig[status] || {
      label: status,
      icon: AlertCircle,
      className: "bg-gray-100 text-gray-800 border-gray-200",
    };

    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error || !ordersData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-8 max-w-md w-full text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Failed to Load Orders
            </h3>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error
                ? error.message
                : "Unable to fetch orders. Please try again."}
            </p>
            <Button onClick={() => refetch()}>Retry</Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const { data: orders, pagination } = ordersData;
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <ShoppingBag className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold">
              Order Management
            </h1>
            <p className="text-muted-foreground mt-1">
              View and manage all orders across the platform
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="space-y-4">
          {/* Row 1: Search and Status */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by order ID..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value as OrderStatus | "all");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
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

          {/* Row 2: Restaurant, Driver, and Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Restaurant Filter */}
            <Input
              placeholder="Restaurant ID..."
              value={restaurantFilter}
              onChange={(e) => {
                setRestaurantFilter(e.target.value);
                setPage(1);
              }}
            />

            {/* Driver Filter */}
            <Input
              placeholder="Driver ID..."
              value={driverFilter}
              onChange={(e) => {
                setDriverFilter(e.target.value);
                setPage(1);
              }}
            />

            {/* Start Date */}
            <Input
              type="date"
              placeholder="Start date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
            />

            {/* End Date */}
            <Input
              type="date"
              placeholder="End date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Clear Filters */}
          {(searchQuery ||
            statusFilter !== "all" ||
            restaurantFilter ||
            driverFilter ||
            startDate ||
            endDate) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setRestaurantFilter("");
                setDriverFilter("");
                setStartDate("");
                setEndDate("");
                setPage(1);
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </Card>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-muted-foreground">
        Showing {orders.length === 0 ? 0 : (page - 1) * limit + 1} to{" "}
        {Math.min(page * limit, pagination.total)} of {pagination.total} orders
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card className="p-12 text-center">
          <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
          <p className="text-muted-foreground">
            {searchQuery ||
            statusFilter !== "all" ||
            restaurantFilter ||
            driverFilter ||
            startDate ||
            endDate
              ? "Try adjusting your search or filters"
              : "No orders have been placed yet"}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Order Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">
                        Order #{order.id.slice(0, 8)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-3">
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">
                        Customer ID
                      </p>
                      <p className="font-medium font-mono text-xs truncate">
                        {order.customerId.slice(0, 8)}...
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">
                        Restaurant ID
                      </p>
                      <p className="font-medium font-mono text-xs truncate">
                        {order.restaurantId.slice(0, 8)}...
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">
                        Driver ID
                      </p>
                      <p className="font-medium font-mono text-xs truncate">
                        {order.driverId
                          ? `${order.driverId.slice(0, 8)}...`
                          : "Not assigned"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">
                        Total
                      </p>
                      <p className="font-semibold text-primary">
                        {formatCurrency(order.total)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">
                      {order.deliveryAddress.street},{" "}
                      {order.deliveryAddress.city},{" "}
                      {order.deliveryAddress.state}{" "}
                      {order.deliveryAddress.zipCode}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-start lg:items-end gap-2 lg:min-w-[180px]">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewDetails(order)}
                    className="w-full lg:w-auto"
                  >
                    View Details
                  </Button>
                  {order.status !== "cancelled" &&
                    order.status !== "delivered" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelOrder(order)}
                        disabled={cancelOrderMutation.isPending}
                        className="w-full lg:w-auto text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Cancel Order
                      </Button>
                    )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>

          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.id.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 py-4">
              {/* Status */}
              <div>
                <h4 className="font-semibold mb-2">Status</h4>
                {getStatusBadge(selectedOrder.status)}
              </div>

              {/* Customer & Restaurant Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Customer</h4>
                  <p className="text-sm text-muted-foreground font-mono">
                    {selectedOrder.customerId}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedOrder.contactPhone}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Restaurant</h4>
                  <p className="text-sm text-muted-foreground font-mono">
                    {selectedOrder.restaurantId}
                  </p>
                </div>
              </div>

              {/* Driver Info */}
              {selectedOrder.driverId && (
                <div>
                  <h4 className="font-semibold mb-2">Driver</h4>
                  <p className="text-sm text-muted-foreground font-mono">
                    {selectedOrder.driverId}
                  </p>
                </div>
              )}

              {/* Delivery Address */}
              <div>
                <h4 className="font-semibold mb-2">Delivery Address</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedOrder.deliveryAddress.street}
                  <br />
                  {selectedOrder.deliveryAddress.city},{" "}
                  {selectedOrder.deliveryAddress.state}{" "}
                  {selectedOrder.deliveryAddress.zipCode}
                  <br />
                  {selectedOrder.deliveryAddress.country}
                </p>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold mb-2">Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-start p-3 bg-muted rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                        {item.specialInstructions && (
                          <p className="text-sm text-muted-foreground italic mt-1">
                            Note: {item.specialInstructions}
                          </p>
                        )}
                      </div>
                      <p className="font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Instructions */}
              {selectedOrder.specialInstructions && (
                <div>
                  <h4 className="font-semibold mb-2">Special Instructions</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.specialInstructions}
                  </p>
                </div>
              )}

              {/* Pricing Breakdown */}
              <div>
                <h4 className="font-semibold mb-2">Pricing</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>{formatCurrency(selectedOrder.deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatCurrency(selectedOrder.tax)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(selectedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-base pt-2 border-t">
                    <span>Total</span>
                    <span>{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Status History */}
              {selectedOrder.statusHistory &&
                selectedOrder.statusHistory.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Status History</h4>
                    <div className="space-y-2">
                      {selectedOrder.statusHistory.map((history, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 text-sm"
                        >
                          <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium">
                              {history.status.replace(/_/g, " ").toUpperCase()}
                            </p>
                            <p className="text-muted-foreground">
                              {formatDate(history.timestamp)}
                            </p>
                            {history.note && (
                              <p className="text-muted-foreground italic mt-1">
                                {history.note}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Rating & Review */}
              {selectedOrder.rating && (
                <div>
                  <h4 className="font-semibold mb-2">Customer Rating</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">⭐</span>
                    <span className="font-semibold">
                      {selectedOrder.rating.toFixed(1)} / 5.0
                    </span>
                  </div>
                  {selectedOrder.review && (
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.review}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetailDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel order{" "}
              <span className="font-semibold">
                #{selectedOrder?.id.slice(0, 8)}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label
                htmlFor="cancelReason"
                className="text-sm font-medium mb-2 block"
              >
                Cancellation Reason <span className="text-destructive">*</span>
              </label>
              <Textarea
                id="cancelReason"
                placeholder="Enter reason for cancellation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={cancelOrderMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmCancelOrder}
              disabled={cancelOrderMutation.isPending || !cancelReason.trim()}
            >
              {cancelOrderMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Confirm Cancellation"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
