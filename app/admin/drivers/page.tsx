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
  Car,
  Search,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  Eye,
  FileText,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import {
  useAdminDrivers,
  useAdminDriver,
  useUpdateDriverStatus,
} from "@/lib/hooks/admin.hooks";
import type { DriverProfile, DriverStatus } from "@/lib/api/types/driver.types";

export default function DriversManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DriverStatus | "all">("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<
    "all" | "available" | "unavailable"
  >("all");
  const [page, setPage] = useState(1);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [driverToUpdate, setDriverToUpdate] = useState<DriverProfile | null>(
    null,
  );
  const [newStatus, setNewStatus] = useState<DriverStatus | null>(null);
  const [statusReason, setStatusReason] = useState("");

  const limit = 10;

  // Build query params
  const queryParams = {
    page,
    limit,
    search: searchQuery || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    isAvailable:
      availabilityFilter === "available"
        ? true
        : availabilityFilter === "unavailable"
          ? false
          : undefined,
  };

  const {
    data: driversData,
    isLoading,
    error,
    refetch,
  } = useAdminDrivers(queryParams);

  const {
    data: selectedDriver,
    isLoading: isLoadingDriver,
    error: driverError,
  } = useAdminDriver(selectedDriverId || "");

  const updateStatusMutation = useUpdateDriverStatus();

  // Handle view driver details
  const handleViewDriver = (driverId: string) => {
    setSelectedDriverId(driverId);
    setDetailDialogOpen(true);
  };

  // Handle status update
  const handleStatusUpdate = (driver: DriverProfile, status: DriverStatus) => {
    setDriverToUpdate(driver);
    setNewStatus(status);
    setStatusReason("");
    setStatusDialogOpen(true);
  };

  const confirmStatusUpdate = async () => {
    if (!driverToUpdate || !newStatus) return;

    await updateStatusMutation.mutateAsync({
      id: driverToUpdate.id,
      data: {
        status: newStatus,
        reason: statusReason || undefined,
      },
    });

    setStatusDialogOpen(false);
    setDriverToUpdate(null);
    setNewStatus(null);
    setStatusReason("");
  };

  // Get status badge
  const getStatusBadge = (status: DriverStatus) => {
    const statusConfig = {
      pending: {
        label: "Pending",
        icon: Clock,
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
      approved: {
        label: "Approved",
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

    const config = statusConfig[status];
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
            <p className="text-muted-foreground">Loading drivers...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error || !driversData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-8 max-w-md w-full text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Failed to Load Drivers
            </h3>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error
                ? error.message
                : "Unable to fetch drivers. Please try again."}
            </p>
            <Button onClick={() => refetch()}>Retry</Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const { data: drivers, pagination } = driversData;
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Car className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold">
              Driver Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and monitor all drivers on the platform
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
              placeholder="Search by driver name..."
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
              setStatusFilter(value as DriverStatus | "all");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          {/* Availability Filter */}
          <Select
            value={availabilityFilter}
            onValueChange={(value) => {
              setAvailabilityFilter(
                value as "all" | "available" | "unavailable",
              );
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Availability</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="unavailable">Unavailable</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-muted-foreground">
        Showing {drivers.length === 0 ? 0 : (page - 1) * limit + 1} to{" "}
        {Math.min(page * limit, pagination.total)} of {pagination.total} drivers
      </div>

      {/* Drivers List */}
      {drivers.length === 0 ? (
        <Card className="p-12 text-center">
          <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Drivers Found</h3>
          <p className="text-muted-foreground">
            {searchQuery ||
            statusFilter !== "all" ||
            availabilityFilter !== "all"
              ? "Try adjusting your search or filters"
              : "No drivers have been registered yet"}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {drivers.map((driver) => (
            <Card key={driver.id} className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Driver Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Car className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg truncate">
                          {driver.name}
                        </h3>
                        {driver.isAvailable && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                            Available
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {driver.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {driver.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">
                        Vehicle
                      </p>
                      <p className="font-medium truncate">
                        {driver.vehicleType}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {driver.vehiclePlate}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">
                        Rating
                      </p>
                      <p className="font-medium">
                        ⭐ {driver.rating.toFixed(1)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {driver.totalDeliveries} deliveries
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">
                        License
                      </p>
                      <p className="font-medium font-mono text-xs truncate">
                        {driver.licenseNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">
                        Registered
                      </p>
                      <p className="font-medium">
                        {formatDate(driver.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="flex flex-col items-start lg:items-end gap-3 lg:min-w-[220px]">
                  {getStatusBadge(driver.status)}

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDriver(driver.id)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View Details
                    </Button>
                    {driver.status !== "approved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(driver, "approved")}
                        disabled={updateStatusMutation.isPending}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approve
                      </Button>
                    )}
                    {driver.status !== "suspended" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(driver, "suspended")}
                        disabled={updateStatusMutation.isPending}
                        className="text-orange-600 border-orange-200 hover:bg-orange-50"
                      >
                        <Ban className="w-3 h-3 mr-1" />
                        Suspend
                      </Button>
                    )}
                    {driver.status !== "rejected" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(driver, "rejected")}
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

      {/* Driver Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Driver Details</DialogTitle>
            <DialogDescription>
              Complete information about the driver
            </DialogDescription>
          </DialogHeader>

          {isLoadingDriver ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : driverError || !selectedDriver ? (
            <div className="text-center py-8">
              <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
              <p className="text-muted-foreground">
                Failed to load driver details
              </p>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  Basic Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Name</p>
                    <p className="font-medium">{selectedDriver.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Status</p>
                    {getStatusBadge(selectedDriver.status)}
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Email</p>
                    <p className="font-medium">{selectedDriver.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Phone</p>
                    <p className="font-medium">{selectedDriver.phone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Availability</p>
                    <p className="font-medium">
                      {selectedDriver.isAvailable ? "Available" : "Unavailable"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">User ID</p>
                    <p className="font-medium font-mono text-xs">
                      {selectedDriver.userId}
                    </p>
                  </div>
                </div>
              </div>

              {/* Vehicle Info */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Vehicle Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Vehicle Type</p>
                    <p className="font-medium">{selectedDriver.vehicleType}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">License Plate</p>
                    <p className="font-medium">{selectedDriver.vehiclePlate}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Vehicle Color</p>
                    <p className="font-medium">{selectedDriver.vehicleColor}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">License Number</p>
                    <p className="font-medium">
                      {selectedDriver.licenseNumber}
                    </p>
                  </div>
                </div>
              </div>

              {/* Performance */}
              <div>
                <h4 className="font-semibold mb-3">Performance Metrics</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Rating</p>
                    <p className="font-medium">
                      ⭐ {selectedDriver.rating.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">
                      Total Deliveries
                    </p>
                    <p className="font-medium">
                      {selectedDriver.totalDeliveries}
                    </p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Documents
                </h4>
                <div className="space-y-2 text-sm">
                  {selectedDriver.documents.license ? (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span>Driver License</span>
                      <a
                        href={selectedDriver.documents.license}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        View Document
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg text-muted-foreground">
                      <span>Driver License</span>
                      <span>Not uploaded</span>
                    </div>
                  )}
                  {selectedDriver.documents.insurance ? (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span>Insurance</span>
                      <a
                        href={selectedDriver.documents.insurance}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        View Document
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg text-muted-foreground">
                      <span>Insurance</span>
                      <span>Not uploaded</span>
                    </div>
                  )}
                  {selectedDriver.documents.registration ? (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span>Vehicle Registration</span>
                      <a
                        href={selectedDriver.documents.registration}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        View Document
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg text-muted-foreground">
                      <span>Vehicle Registration</span>
                      <span>Not uploaded</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t">
                <div>
                  <p className="text-muted-foreground mb-1">Registered</p>
                  <p className="font-medium">
                    {formatDate(selectedDriver.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Last Updated</p>
                  <p className="font-medium">
                    {formatDate(selectedDriver.updatedAt)}
                  </p>
                </div>
              </div>
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

      {/* Status Update Confirmation Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Driver Status</DialogTitle>
            <DialogDescription>
              Are you sure you want to change the status of{" "}
              <span className="font-semibold">{driverToUpdate?.name}</span> to{" "}
              <span className="font-semibold">{newStatus}</span>?
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
