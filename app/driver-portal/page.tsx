"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth.store";
import {
  useDriverProfile,
  useDriverEarnings,
  useDriverMetrics,
  useUpdateAvailability,
} from "@/lib/hooks/driver.hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Star,
  Package,
  Timer,
  Target,
  List,
  Truck,
} from "lucide-react";
import { toast } from "@/lib/utils/toast";
import { Button } from "@/components/ui/button";

/**
 * Driver Portal Page
 *
 * Main dashboard for drivers showing:
 * - Driver profile information
 * - Availability status toggle
 * - Earnings summary
 * - Performance metrics
 *
 * Requirements: 12.1, 12.2, 14.4, 26.5
 */
export default function DriverPortalPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { data: profile, isLoading, error } = useDriverProfile();
  const { data: earnings, isLoading: earningsLoading } = useDriverEarnings();
  const { data: metrics, isLoading: metricsLoading } = useDriverMetrics();
  const updateAvailability = useUpdateAvailability();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const handleAvailabilityToggle = async (checked: boolean) => {
    try {
      await updateAvailability.mutateAsync({ isAvailable: checked });
      toast.success(
        checked ? "You're now available for deliveries" : "You're now offline",
      );
    } catch (error) {
      toast.error("Failed to update availability. Please try again");
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-12 w-64" />
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <p>Failed to load driver profile. Please try again.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            <AlertCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      case "suspended":
        return (
          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
            <AlertCircle className="h-3 w-3 mr-1" />
            Suspended
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-secondary">
                Driver Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Welcome back, {profile?.name || user?.name}!
              </p>
            </div>
            {profile && getStatusBadge(profile.status)}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Registration Status Card */}
        {profile?.status === "pending" && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-bold text-yellow-900">
                    Registration Under Review
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your driver registration is currently being reviewed by our
                    team. This typically takes 1-2 business days. We'll notify
                    you once your account is approved.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Availability Toggle - Only for approved drivers */}
        {profile?.status === "approved" && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="availability" className="text-base font-bold">
                    Availability Status
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle to start or stop receiving delivery orders
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm font-medium ${
                      profile?.isAvailable ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {profile?.isAvailable ? "Available" : "Offline"}
                  </span>
                  <Switch
                    id="availability"
                    checked={profile?.isAvailable || false}
                    onCheckedChange={handleAvailabilityToggle}
                    disabled={updateAvailability.isPending}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions - Only for approved drivers */}
        {profile?.status === "approved" && (
          <div>
            <h2 className="text-xl font-black text-secondary mb-4">
              Quick Actions
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push("/driver-portal/available-orders")}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <List className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-secondary mb-1">
                        Available Orders
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        View and accept orders ready for pickup
                      </p>
                      <Button variant="outline" size="sm">
                        View Orders
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push("/driver-portal/active-orders")}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Truck className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-secondary mb-1">
                        Active Deliveries
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Manage your current delivery orders
                      </p>
                      <Button variant="outline" size="sm">
                        View Deliveries
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Earnings Summary - Only for approved drivers */}
        {profile?.status === "approved" && (
          <>
            <div>
              <h2 className="text-xl font-black text-secondary mb-4">
                Earnings Summary
              </h2>
              {earningsLoading ? (
                <div className="grid md:grid-cols-3 gap-6">
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                </div>
              ) : earnings ? (
                <div className="grid md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Earnings
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-black text-secondary">
                        ${earnings.totalEarnings.toFixed(2)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        All time earnings
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Completed Deliveries
                      </CardTitle>
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-black text-secondary">
                        {earnings.completedDeliveries}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Total deliveries
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Average Per Delivery
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-black text-secondary">
                        ${earnings.averagePerDelivery.toFixed(2)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Per delivery average
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="border-gray-200">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground text-center">
                      No earnings data available
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Performance Metrics */}
            <div>
              <h2 className="text-xl font-black text-secondary mb-4">
                Performance Metrics
              </h2>
              {metricsLoading ? (
                <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                </div>
              ) : metrics ? (
                <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Avg Delivery Time
                      </CardTitle>
                      <Timer className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-black text-secondary">
                        {metrics.averageDeliveryTime} min
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Average time per delivery
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        On-Time Rate
                      </CardTitle>
                      <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-black text-secondary">
                        {(metrics.onTimeDeliveryRate * 100).toFixed(0)}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Deliveries on time
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Acceptance Rate
                      </CardTitle>
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-black text-secondary">
                        {(metrics.acceptanceRate * 100).toFixed(0)}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Orders accepted
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Average Rating
                      </CardTitle>
                      <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-black text-secondary">
                        {metrics.averageRating.toFixed(1)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Out of 5.0
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Earnings Per Hour
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-black text-secondary">
                        ${metrics.earningsPerHour.toFixed(2)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Hourly earnings rate
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="border-gray-200">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground text-center">
                      No metrics data available
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}

        {/* Profile Information */}
        <div>
          <h2 className="text-xl font-black text-secondary mb-4">
            Profile Information
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{profile?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{profile?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{profile?.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    License Number
                  </p>
                  <p className="font-medium">{profile?.licenseNumber}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vehicle Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Vehicle Type</p>
                  <p className="font-medium capitalize">
                    {profile?.vehicleType}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">License Plate</p>
                  <p className="font-medium">{profile?.vehiclePlate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Color</p>
                  <p className="font-medium">{profile?.vehicleColor}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
