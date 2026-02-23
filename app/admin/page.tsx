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
  Store,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAdminDashboard } from "@/lib/hooks/admin.hooks";

type DateRange = "7days" | "30days" | "90days";

export default function AdminDashboard() {
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
    }

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate,
    };
  };

  const {
    data: dashboard,
    isLoading,
    error,
    refetch,
  } = useAdminDashboard(getDateParams());

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
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error || !dashboard) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-8 max-w-md w-full text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Failed to Load Dashboard
            </h3>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error
                ? error.message
                : "Unable to fetch dashboard data. Please try again."}
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
      value: formatCurrency(dashboard.totalRevenue),
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      subtext: `${formatCurrency(dashboard.todayRevenue)} today`,
    },
    {
      label: "Total Orders",
      value: formatNumber(dashboard.totalOrders),
      icon: ShoppingBag,
      color: "text-primary",
      bgColor: "bg-primary/10",
      subtext: `${formatNumber(dashboard.todayOrders)} today`,
    },
    {
      label: "Active Restaurants",
      value: formatNumber(dashboard.activeRestaurants),
      icon: Store,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Active Drivers",
      value: formatNumber(dashboard.activeDrivers),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ];

  return (
    <DashboardLayout>
      {/* Header with Date Range Selector */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Platform-wide metrics and performance
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
          </SelectContent>
        </Select>
      </div>

      {/* Stats Grid */}
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
              {stat.subtext && (
                <p className="text-xs text-muted-foreground">{stat.subtext}</p>
              )}
            </Card>
          );
        })}
      </div>

      {/* Revenue Trend Chart */}
      {dashboard.revenueTrend && dashboard.revenueTrend.length > 0 && (
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-heading font-semibold">
                Revenue Trend
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Daily revenue over selected period
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {dashboard.revenueTrend.slice(-10).map((item, index) => {
              const maxRevenue = Math.max(
                ...dashboard.revenueTrend.map((t) => t.amount),
              );
              const percentage = (item.amount / maxRevenue) * 100;
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
                    <div className="h-8 bg-muted rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-end px-3"
                        style={{ width: `${percentage}%` }}
                      >
                        {percentage > 20 && (
                          <span className="text-xs font-medium text-white">
                            {formatCurrency(item.amount)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {percentage <= 20 && (
                    <div className="w-24 text-sm font-medium text-right shrink-0">
                      {formatCurrency(item.amount)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Order Volume Trend */}
      {dashboard.orderVolumeTrend && dashboard.orderVolumeTrend.length > 0 && (
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-heading font-semibold">
                Order Volume Trend
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Daily orders over selected period
              </p>
            </div>
            <ShoppingBag className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {dashboard.orderVolumeTrend.slice(-10).map((item, index) => {
              const maxOrders = Math.max(
                ...dashboard.orderVolumeTrend.map((t) => t.count),
              );
              const percentage = (item.count / maxOrders) * 100;
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
                    <div className="h-8 bg-muted rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-end px-3"
                        style={{ width: `${percentage}%` }}
                      >
                        {percentage > 20 && (
                          <span className="text-xs font-medium text-white">
                            {formatNumber(item.count)} orders
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {percentage <= 20 && (
                    <div className="w-24 text-sm font-medium text-right shrink-0">
                      {formatNumber(item.count)} orders
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Top Restaurants */}
      {dashboard.topRestaurants && dashboard.topRestaurants.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* By Revenue */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-heading font-semibold">
                  Top Restaurants by Revenue
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Highest earning restaurants
                </p>
              </div>
              <DollarSign className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {dashboard.topRestaurants
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 5)
                .map((restaurant, index) => (
                  <div key={restaurant.id}>
                    {index > 0 && <div className="border-t my-4" />}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-heading font-semibold text-sm">
                        #{index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {restaurant.name}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span>
                            {formatNumber(restaurant.orderCount)} orders
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">
                          {formatCurrency(restaurant.revenue)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          {/* By Orders */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-heading font-semibold">
                  Top Restaurants by Orders
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Most popular restaurants
                </p>
              </div>
              <ShoppingBag className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {dashboard.topRestaurants
                .sort((a, b) => b.orderCount - a.orderCount)
                .slice(0, 5)
                .map((restaurant, index) => (
                  <div key={restaurant.id}>
                    {index > 0 && <div className="border-t my-4" />}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-heading font-semibold text-sm">
                        #{index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {restaurant.name}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span>
                            {formatCurrency(restaurant.revenue)} revenue
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">
                          {formatNumber(restaurant.orderCount)} orders
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
