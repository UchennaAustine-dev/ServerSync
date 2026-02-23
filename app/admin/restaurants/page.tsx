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
import {
  Store,
  Search,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
} from "lucide-react";
import {
  useAdminRestaurants,
  useUpdateRestaurantStatus,
} from "@/lib/hooks/admin.hooks";
import type { Restaurant } from "@/lib/api/types/restaurant.types";

type RestaurantStatus = "pending" | "active" | "suspended" | "rejected";

export default function RestaurantsManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RestaurantStatus | "all">(
    "all",
  );
  const [page, setPage] = useState(1);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<RestaurantStatus | null>(null);
  const [statusReason, setStatusReason] = useState("");

  const limit = 10;

  // Build query params
  const queryParams = {
    page,
    limit,
    search: searchQuery || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  };

  const {
    data: restaurantsData,
    isLoading,
    error,
    refetch,
  } = useAdminRestaurants(queryParams);

  const updateStatusMutation = useUpdateRestaurantStatus();

  // Handle status update
  const handleStatusUpdate = (
    restaurant: Restaurant,
    status: RestaurantStatus,
  ) => {
    setSelectedRestaurant(restaurant);
    setNewStatus(status);
    setStatusReason("");
    setStatusDialogOpen(true);
  };

  const confirmStatusUpdate = async () => {
    if (!selectedRestaurant || !newStatus) return;

    await updateStatusMutation.mutateAsync({
      id: selectedRestaurant.id,
      data: {
        status: newStatus,
        reason: statusReason || undefined,
      },
    });

    setStatusDialogOpen(false);
    setSelectedRestaurant(null);
    setNewStatus(null);
    setStatusReason("");
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        label: "Pending",
        icon: Clock,
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
      active: {
        label: "Active",
        icon: CheckCircle,
        className: "bg-green-100 text-green-800 border-green-200",
      },
      suspended: {
        label: "Suspended",
        icon: Ban,
        className: "bg-orange-100 text-orange-800 border-orange-200",
      },
      rejected: {
        label: "Rejected",
        icon: XCircle,
        className: "bg-red-100 text-red-800 border-red-200",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
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
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading restaurants...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error || !restaurantsData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-8 max-w-md w-full text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Failed to Load Restaurants
            </h3>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error
                ? error.message
                : "Unable to fetch restaurants. Please try again."}
            </p>
            <Button onClick={() => refetch()}>Retry</Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const { data: restaurants, pagination } = restaurantsData;
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Store className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold">
              Restaurant Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and monitor all restaurants on the platform
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by restaurant name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1); // Reset to first page on search
              }}
              className="pl-9"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value as RestaurantStatus | "all");
              setPage(1); // Reset to first page on filter change
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-muted-foreground">
        Showing {restaurants.length === 0 ? 0 : (page - 1) * limit + 1} to{" "}
        {Math.min(page * limit, pagination.total)} of {pagination.total}{" "}
        restaurants
      </div>

      {/* Restaurants List */}
      {restaurants.length === 0 ? (
        <Card className="p-12 text-center">
          <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Restaurants Found</h3>
          <p className="text-muted-foreground">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "No restaurants have been registered yet"}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {restaurants.map((restaurant) => (
            <Card key={restaurant.id} className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Restaurant Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-3">
                    {restaurant.logo ? (
                      <img
                        src={restaurant.logo}
                        alt={restaurant.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                        <Store className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1 truncate">
                        {restaurant.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {restaurant.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">
                        Cuisine
                      </p>
                      <p className="font-medium truncate">
                        {restaurant.cuisineType.join(", ")}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">
                        Rating
                      </p>
                      <p className="font-medium">
                        ⭐ {restaurant.rating.toFixed(1)} (
                        {restaurant.reviewCount})
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">
                        Owner ID
                      </p>
                      <p className="font-medium font-mono text-xs truncate">
                        {restaurant.ownerId}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">
                        Registered
                      </p>
                      <p className="font-medium">
                        {formatDate(restaurant.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="flex flex-col items-start lg:items-end gap-3 lg:min-w-[200px]">
                  {getStatusBadge((restaurant as any).status || "active")}

                  <div className="flex flex-wrap gap-2">
                    {(restaurant as any).status !== "active" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(restaurant, "active")}
                        disabled={updateStatusMutation.isPending}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approve
                      </Button>
                    )}
                    {(restaurant as any).status !== "suspended" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleStatusUpdate(restaurant, "suspended")
                        }
                        disabled={updateStatusMutation.isPending}
                        className="text-orange-600 border-orange-200 hover:bg-orange-50"
                      >
                        <Ban className="w-3 h-3 mr-1" />
                        Suspend
                      </Button>
                    )}
                    {(restaurant as any).status !== "rejected" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleStatusUpdate(restaurant, "rejected")
                        }
                        disabled={updateStatusMutation.isPending}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Reject
                      </Button>
                    )}
                  </div>
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

      {/* Status Update Confirmation Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Restaurant Status</DialogTitle>
            <DialogDescription>
              Are you sure you want to change the status of{" "}
              <span className="font-semibold">{selectedRestaurant?.name}</span>{" "}
              to <span className="font-semibold">{newStatus}</span>?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label
                htmlFor="reason"
                className="text-sm font-medium mb-2 block"
              >
                Reason (optional)
              </label>
              <Input
                id="reason"
                placeholder="Enter reason for status change..."
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusDialogOpen(false)}
              disabled={updateStatusMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmStatusUpdate}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
