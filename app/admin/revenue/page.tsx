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
  DollarSign,
  TrendingUp,
  Store,
  Users,
  ShoppingBag,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useRevenueAnalytics } from "@/lib/hooks/admin.hooks";

type DateRange = "7days" | "30days" | "90days" | "1year";

export default function RevenueAnalyticsPage() {
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
  } = useRevenueAnalytics(getDateParams());

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

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">
              Loading revenue analytics...
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
              Failed to Load Revenue Analytics
            </h3>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error
                ? error.message
                : "Unable to fetch revenue analytics. Please try again."}
            </p>
            <Button onClick={() => refetch()}>Retry</Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    {
      label: "Total Revenue",
      value: formatCurrency(analytics.totalRevenue),
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      description: "Total platform revenue",
    },
    {
      label: "Platform Commission",
      value: formatCurrency(analytics.platformCommission),
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
      description: "Commission earned",
    },
    {
      label: "Restaurant Payouts",
      value: formatCurrency(analytics.restaurantPayouts),
      icon: Store,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Paid to restaurants",
    },
    {
      label: "Driver Payouts",
      value: formatCurrency(analytics.driverPayouts),
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Paid to drivers",
    },
  ];

  return (
    <DashboardLayout>
      {/* Header with Date Range Selector */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold">Revenue Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Platform-wide revenue metrics and trends
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

      {/* Revenue Stats Grid */}
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

      {/* Order Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-green-50 p-3 rounded-xl">
              <ShoppingBag className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
          <p className="text-3xl font-heading font-bold mb-1">
            {formatNumber(analytics.orderCount)}
          </p>
          <p className="text-xs text-muted-foreground">
            Orders in selected period
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-orange-50 p-3 rounded-xl">
              <DollarSign className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">
            Average Order Value
          </p>
          <p className="text-3xl font-heading font-bold mb-1">
            {formatCurrency(analytics.averageOrderValue)}
          </p>
          <p className="text-xs text-muted-foreground">Per order average</p>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      {analytics.revenueTrend && analytics.revenueTrend.length > 0 && (
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-heading font-semibold">
                Revenue Trend
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Daily revenue and commission over selected period
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {analytics.revenueTrend.slice(-15).map((item, index) => {
              const maxRevenue = Math.max(
                ...analytics.revenueTrend.map((t) => t.totalRevenue),
              );
              const percentage = (item.totalRevenue / maxRevenue) * 100;
              const commissionPercentage =
                (item.commission / item.totalRevenue) * 100;
              const date = new Date(item.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });

              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-20 text-sm text-muted-foreground shrink-0">
                    {date}
                  </div>
                  <div className="flex-1">
                    <div className="h-10 bg-muted rounded-lg overflow-hidden relative">
                      {/* Total Revenue Bar */}
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-end px-3 absolute inset-0"
                        style={{ width: `${percentage}%` }}
                      >
                        {percentage > 25 && (
                          <span className="text-xs font-medium text-white">
                            {formatCurrency(item.totalRevenue)}
                          </span>
                        )}
                      </div>
                      {/* Commission Overlay */}
                      <div
                        className="h-full bg-gradient-to-r from-primary/80 to-primary absolute inset-0"
                        style={{
                          width: `${(percentage * commissionPercentage) / 100}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Revenue
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        Commission: {formatCurrency(item.commission)}
                      </span>
                    </div>
                  </div>
                  {percentage <= 25 && (
                    <div className="w-28 text-sm font-medium text-right shrink-0">
                      {formatCurrency(item.totalRevenue)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Revenue by Restaurant */}
      {analytics.revenueByRestaurant &&
        analytics.revenueByRestaurant.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-heading font-semibold">
                  Revenue by Restaurant
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Top revenue-generating restaurants
                </p>
              </div>
              <Store className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {analytics.revenueByRestaurant
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 10)
                .map((restaurant, index) => {
                  const maxRevenue = Math.max(
                    ...analytics.revenueByRestaurant.map((r) => r.revenue),
                  );
                  const percentage = (restaurant.revenue / maxRevenue) * 100;

                  return (
                    <div key={restaurant.restaurantId}>
                      {index > 0 && <div className="border-t my-4" />}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-heading font-semibold text-sm shrink-0">
                              #{index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">
                                {restaurant.restaurantName}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                Commission:{" "}
                                {formatCurrency(restaurant.commission)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-4">
                            <div className="text-sm font-semibold">
                              {formatCurrency(restaurant.revenue)}
                            </div>
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
