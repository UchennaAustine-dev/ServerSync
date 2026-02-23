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
  Users,
  TrendingUp,
  Clock,
  DollarSign,
  Star,
  Truck,
  Loader2,
  AlertCircle,
  Award,
} from "lucide-react";
import { useDriverPerformance } from "@/lib/hooks/admin.hooks";

type DateRange = "7days" | "30days" | "90days" | "1year";

export default function DriverPerformanceAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>("30days");

  // Calculate date range
  const getDateParams = () => {
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date();

    switch (dateRange) {
      case "7days":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "30days":
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "90days":
        startDate.setDate(startDate.getDate() - 90);
        break;
      case "1year":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate,
    };
  };

  const {
    data: analytics,
    isLoading,
    error,
    refetch,
  } = useDriverPerformance(getDateParams());

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format number with commas
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  // Format time in minutes
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${Math.round(value)}%`;
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">
              Loading driver performance analytics...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error || !analytics) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-8 max-w-md w-full text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Failed to Load Driver Performance Analytics
            </h3>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error
                ? error.message
                : "Unable to fetch driver performance analytics. Please try again."}
            </p>
            <Button onClick={() => refetch()}>Retry</Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    {
      label: "Total Drivers",
      value: formatNumber(analytics.totalDrivers),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Registered drivers",
    },
    {
      label: "Active Drivers",
      value: formatNumber(analytics.activeDrivers),
      icon: Truck,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Currently active",
    },
    {
      label: "Avg Delivery Time",
      value: formatTime(analytics.averageDeliveryTime),
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Average per delivery",
    },
    {
      label: "On-Time Rate",
      value: formatPercentage(analytics.onTimeDeliveryRate),
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      description: "Deliveries on time",
    },
  ];

  return (
    <DashboardLayout>
      {/* Header with Date Range Selector */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold">
            Driver Performance Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Driver metrics, rankings, and performance data
          </p>
        </div>
        <Select
          value={dateRange}
          onValueChange={(value) => setDateRange(value as DateRange)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
            <SelectItem value="1year">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Performance Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.bgColor} p-3 rounded-xl`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-3xl font-heading font-bold mb-1">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Driver Rankings */}
      {analytics.driverRankings && analytics.driverRankings.length > 0 && (
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* By Deliveries */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-heading font-semibold">
                  Top by Deliveries
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Most deliveries completed
                </p>
              </div>
              <Truck className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {[...analytics.driverRankings]
                .sort((a, b) => b.deliveryCount - a.deliveryCount)
                .slice(0, 5)
                .map((driver, index) => (
                  <div key={driver.driverId}>
                    {index > 0 && <div className="border-t my-4" />}
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full font-heading font-semibold text-sm ${
                          index === 0
                            ? "bg-yellow-100 text-yellow-700"
                            : index === 1
                              ? "bg-gray-100 text-gray-700"
                              : index === 2
                                ? "bg-orange-100 text-orange-700"
                                : "bg-muted"
                        }`}
                      >
                        {index === 0 ? (
                          <Award className="w-4 h-4" />
                        ) : (
                          `#${index + 1}`
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {driver.driverName}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{driver.averageRating.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">
                          {formatNumber(driver.deliveryCount)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          deliveries
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          {/* By Rating */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-heading font-semibold">
                  Top by Rating
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Highest customer ratings
                </p>
              </div>
              <Star className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {[...analytics.driverRankings]
                .sort((a, b) => b.averageRating - a.averageRating)
                .slice(0, 5)
                .map((driver, index) => (
                  <div key={driver.driverId}>
                    {index > 0 && <div className="border-t my-4" />}
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full font-heading font-semibold text-sm ${
                          index === 0
                            ? "bg-yellow-100 text-yellow-700"
                            : index === 1
                              ? "bg-gray-100 text-gray-700"
                              : index === 2
                                ? "bg-orange-100 text-orange-700"
                                : "bg-muted"
                        }`}
                      >
                        {index === 0 ? (
                          <Award className="w-4 h-4" />
                        ) : (
                          `#${index + 1}`
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {driver.driverName}
                        </h4>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatNumber(driver.deliveryCount)} deliveries
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm font-semibold">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          {driver.averageRating.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          {/* By Earnings */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-heading font-semibold">
                  Top by Earnings
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Highest total earnings
                </p>
              </div>
              <DollarSign className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {[...analytics.driverRankings]
                .sort((a, b) => b.earnings - a.earnings)
                .slice(0, 5)
                .map((driver, index) => (
                  <div key={driver.driverId}>
                    {index > 0 && <div className="border-t my-4" />}
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full font-heading font-semibold text-sm ${
                          index === 0
                            ? "bg-yellow-100 text-yellow-700"
                            : index === 1
                              ? "bg-gray-100 text-gray-700"
                              : index === 2
                                ? "bg-orange-100 text-orange-700"
                                : "bg-muted"
                        }`}
                      >
                        {index === 0 ? (
                          <Award className="w-4 h-4" />
                        ) : (
                          `#${index + 1}`
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {driver.driverName}
                        </h4>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatNumber(driver.deliveryCount)} deliveries
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">
                          {formatCurrency(driver.earnings)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      )}

      {/* Driver Availability by Hour */}
      {analytics.driverAvailability &&
        analytics.driverAvailability.length > 0 && (
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-heading font-semibold">
                  Driver Availability by Hour
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Average available drivers throughout the day
                </p>
              </div>
              <Clock className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              {analytics.driverAvailability.map((item) => {
                const maxDrivers = Math.max(
                  ...analytics.driverAvailability.map(
                    (d) => d.availableDrivers,
                  ),
                );
                const percentage = (item.availableDrivers / maxDrivers) * 100;
                const hour = item.hour % 12 || 12;
                const period = item.hour < 12 ? "AM" : "PM";
                const timeLabel = `${hour}:00 ${period}`;

                return (
                  <div key={item.hour} className="flex items-center gap-4">
                    <div className="w-20 text-sm text-muted-foreground shrink-0">
                      {timeLabel}
                    </div>
                    <div className="flex-1">
                      <div className="h-8 bg-muted rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-end px-3"
                          style={{ width: `${percentage}%` }}
                        >
                          {percentage > 15 && (
                            <span className="text-xs font-medium text-white">
                              {formatNumber(item.availableDrivers)} drivers
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {percentage <= 15 && (
                      <div className="w-24 text-sm font-medium text-right shrink-0">
                        {formatNumber(item.availableDrivers)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

      {/* Earnings Distribution */}
      {analytics.earningsDistribution &&
        analytics.earningsDistribution.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-heading font-semibold">
                  Earnings Distribution
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Number of drivers by earnings range
                </p>
              </div>
              <DollarSign className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {analytics.earningsDistribution.map((item, index) => {
                const maxDrivers = Math.max(
                  ...analytics.earningsDistribution.map((d) => d.driverCount),
                );
                const percentage = (item.driverCount / maxDrivers) * 100;

                return (
                  <div key={index}>
                    {index > 0 && <div className="border-t my-4" />}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm">{item.range}</div>
                        <div className="text-sm font-semibold">
                          {formatNumber(item.driverCount)} drivers
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
    </DashboardLayout>
  );
}
