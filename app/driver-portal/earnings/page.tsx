"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth.store";
import { useDriverEarnings } from "@/lib/hooks/driver.hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  Package,
  TrendingUp,
  Calendar,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

/**
 * Driver Earnings Page
 *
 * Displays driver earnings tracking with:
 * - Total earnings and completed deliveries
 * - Average earnings per delivery
 * - Earnings breakdown by day or week
 * - Date range filtering
 * - Error handling with retry option
 *
 * Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7
 */
export default function DriverEarningsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [dateRange, setDateRange] = useState<"7days" | "30days" | "custom">(
    "7days",
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Calculate date range based on selection
  const getDateParams = () => {
    if (dateRange === "custom" && startDate && endDate) {
      return { startDate, endDate };
    }

    const end = new Date();
    const daysToSubtract = dateRange === "7days" ? 7 : 30;
    const start = new Date(end);
    start.setDate(start.getDate() - daysToSubtract);

    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  };

  const {
    data: earnings,
    isLoading,
    error,
    refetch,
  } = useDriverEarnings(getDateParams());

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const handleRetry = () => {
    refetch();
  };

  // Format date string to readable format
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get today's date in YYYY-MM-DD format
  const getTodayString = () => {
    return new Date().toISOString().split("T")[0];
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <Skeleton className="h-10 w-48" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto p-8 space-y-8">
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <h1 className="text-3xl font-black text-secondary">
              Earnings Tracking
            </h1>
          </div>
        </div>
        <div className="max-w-7xl mx-auto p-8">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-bold text-red-900">
                    Failed to Load Earnings
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    We couldn't load your earnings data. Please try again.
                  </p>
                  <Button
                    onClick={handleRetry}
                    variant="outline"
                    size="sm"
                    className="mt-3"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const earningsData =
    viewMode === "day" ? earnings?.earningsByDate : earnings?.earningsByWeek;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-secondary">
                Earnings Tracking
              </h1>
              <p className="text-muted-foreground mt-1">
                Track your income and delivery performance
              </p>
            </div>
            <Button variant="outline" onClick={() => router.back()}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Summary Cards */}
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
                ${earnings?.totalEarnings.toFixed(2) || "0.00"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                For selected period
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
                {earnings?.completedDeliveries || 0}
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
                ${earnings?.averagePerDelivery.toFixed(2) || "0.00"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Per delivery average
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Date Range Selection */}
              <div className="space-y-2">
                <Label htmlFor="dateRange">Date Range</Label>
                <Select
                  value={dateRange}
                  onValueChange={(value: any) => setDateRange(value)}
                >
                  <SelectTrigger id="dateRange">
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 Days</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* View Mode Selection */}
              <div className="space-y-2">
                <Label htmlFor="viewMode">View By</Label>
                <Select
                  value={viewMode}
                  onValueChange={(value: any) => setViewMode(value)}
                >
                  <SelectTrigger id="viewMode">
                    <SelectValue placeholder="Select view mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">By Day</SelectItem>
                    <SelectItem value="week">By Week</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Date Range Inputs */}
              {dateRange === "custom" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      max={endDate || getTodayString()}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate}
                      max={getTodayString()}
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Earnings Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Earnings Breakdown {viewMode === "day" ? "by Day" : "by Week"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {earningsData && earningsData.length > 0 ? (
              <div className="space-y-4">
                {/* Table Header */}
                <div className="grid grid-cols-3 gap-4 pb-3 border-b font-medium text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {viewMode === "day" ? "Date" : "Week"}
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Earnings
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Deliveries
                  </div>
                </div>

                {/* Table Rows */}
                {earningsData.map((item, index) => {
                  const dateValue = "date" in item ? item.date : item.week;
                  const dateLabel =
                    viewMode === "day"
                      ? formatDate(dateValue)
                      : `Week of ${formatDate(dateValue)}`;

                  return (
                    <div
                      key={index}
                      className="grid grid-cols-3 gap-4 py-3 border-b last:border-0 hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium">{dateLabel}</div>
                      <div className="text-green-600 font-bold">
                        ${item.earnings.toFixed(2)}
                      </div>
                      <div className="text-muted-foreground">
                        {item.deliveries}{" "}
                        {item.deliveries === 1 ? "delivery" : "deliveries"}
                      </div>
                    </div>
                  );
                })}

                {/* Total Row */}
                <div className="grid grid-cols-3 gap-4 pt-3 border-t-2 font-bold">
                  <div>Total</div>
                  <div className="text-green-600">
                    ${earnings?.totalEarnings.toFixed(2)}
                  </div>
                  <div className="text-muted-foreground">
                    {earnings?.completedDeliveries}{" "}
                    {earnings?.completedDeliveries === 1
                      ? "delivery"
                      : "deliveries"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  No earnings data available for the selected period
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
