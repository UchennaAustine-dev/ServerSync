"use client";

import { useState } from "react";
import { useCustomerAnalytics } from "@/lib/hooks/customer.hooks";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Heart,
  UtensilsCrossed,
} from "lucide-react";

export default function CustomerAnalyticsPage() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const { data: analytics, isLoading, error } = useCustomerAnalytics(dateRange);

  const handleDateChange = (field: "startDate" | "endDate", value: string) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 font-medium mb-4">
                Failed to load analytics data
              </p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Analytics</h1>
        <p className="text-gray-600 mt-2">
          Track your ordering habits and spending insights
        </p>
      </div>

      {/* Date Range Selector */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Date Range</CardTitle>
          <CardDescription>
            Select the time period for analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateChange("startDate", e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateChange("endDate", e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={() =>
                setDateRange({
                  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0],
                  endDate: new Date().toISOString().split("T")[0],
                })
              }
            >
              Last 30 Days
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard
          title="Total Spending"
          value={`$${analytics?.totalSpending.toFixed(2) || "0.00"}`}
          icon={<DollarSign className="w-5 h-5" />}
        />
        <MetricCard
          title="Total Orders"
          value={analytics?.totalOrders || 0}
          icon={<ShoppingCart className="w-5 h-5" />}
        />
        <MetricCard
          title="Avg Order Value"
          value={`$${analytics?.averageOrderValue.toFixed(2) || "0.00"}`}
          icon={<TrendingUp className="w-5 h-5" />}
        />
      </div>

      {/* Spending Trend Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Spending Trend</CardTitle>
          <CardDescription>
            Your spending over the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SimpleBarChart
            data={analytics?.spendingTrend || []}
            dataKey="amount"
            label="Spending"
            color="bg-blue-500"
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Favorite Restaurants */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Favorite Restaurants
            </CardTitle>
            <CardDescription>Your most ordered restaurants</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.favoriteRestaurants &&
            analytics.favoriteRestaurants.length > 0 ? (
              <div className="space-y-3">
                {analytics.favoriteRestaurants.map((restaurant, index) => (
                  <div
                    key={restaurant.restaurantId}
                    className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-400">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-medium">
                          {restaurant.restaurantName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {restaurant.orderCount} orders
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-green-600">
                      ${restaurant.totalSpent.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No restaurant data available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Most Ordered Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-orange-500" />
              Most Ordered Items
            </CardTitle>
            <CardDescription>Your favorite menu items</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.mostOrderedItems &&
            analytics.mostOrderedItems.length > 0 ? (
              <div className="space-y-3">
                {analytics.mostOrderedItems.map((item, index) => (
                  <div
                    key={item.itemId}
                    className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-400">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{item.itemName}</p>
                        <p className="text-sm text-gray-600">
                          {item.restaurantName}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-blue-600">
                      {item.orderCount}x
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No item data available
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className="p-3 bg-gray-100 rounded-full">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function SimpleBarChart({
  data,
  dataKey,
  label,
  color,
}: {
  data: any[];
  dataKey: string;
  label: string;
  color: string;
}) {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500 py-8">No data available</p>;
  }

  const maxValue = Math.max(...data.map((item) => item[dataKey]));

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-2 h-64">
        {data.map((item, index) => {
          const height = maxValue > 0 ? (item[dataKey] / maxValue) * 100 : 0;
          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center gap-2"
            >
              <div className="w-full flex flex-col justify-end h-full">
                <div
                  className={`${color} rounded-t transition-all hover:opacity-80`}
                  style={{ height: `${height}%` }}
                  title={`${label}: $${item[dataKey].toFixed(2)}`}
                />
              </div>
              <p className="text-xs text-gray-600 text-center">
                {new Date(item.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
