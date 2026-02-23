"use client";

import { useState } from "react";
import {
  useRestaurantAnalytics,
  useOrderAnalytics,
  useMenuAnalytics,
} from "@/lib/hooks/restaurant.hooks";
import { useAuthStore } from "@/lib/store/auth.store";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Clock,
  XCircle,
  Star,
  TrendingDown,
  AlertCircle,
} from "lucide-react";

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const restaurantId = user?.restaurantId || "";

  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const { data: analytics, isLoading: analyticsLoading } =
    useRestaurantAnalytics(restaurantId, dateRange);
  const { data: orderAnalytics, isLoading: orderLoading } = useOrderAnalytics(
    restaurantId,
    dateRange,
  );
  const { data: menuAnalytics, isLoading: menuLoading } = useMenuAnalytics(
    restaurantId,
    dateRange,
  );

  const handleDateChange = (field: "startDate" | "endDate", value: string) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
  };

  if (analyticsLoading || orderLoading || menuLoading) {
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

  if (!restaurantId) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-12 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="font-heading font-semibold text-lg mb-2">
            No Restaurant Found
          </h3>
          <p className="text-muted-foreground">
            You need to be associated with a restaurant to view analytics.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Track your restaurant's performance and insights
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

      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="menu">Menu Performance</TabsTrigger>
        </TabsList>

        {/* Revenue Analytics Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="Total Revenue"
              value={`$${analytics?.revenue.total.toFixed(2) || "0.00"}`}
              icon={<DollarSign className="w-5 h-5" />}
              trend={analytics?.revenue.trend.length || 0}
            />
            <MetricCard
              title="Total Orders"
              value={analytics?.orders.total || 0}
              icon={<ShoppingCart className="w-5 h-5" />}
              trend={analytics?.orders.trend.length || 0}
            />
            <MetricCard
              title="Avg Order Value"
              value={`$${
                analytics?.revenue.total && analytics?.orders.total
                  ? (analytics.revenue.total / analytics.orders.total).toFixed(
                      2,
                    )
                  : "0.00"
              }`}
              icon={<TrendingUp className="w-5 h-5" />}
            />
          </div>

          {/* Revenue Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>
                Daily revenue over the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleBarChart
                data={analytics?.revenue.trend || []}
                dataKey="amount"
                label="Revenue"
                color="bg-green-500"
              />
            </CardContent>
          </Card>

          {/* Top Items */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Items</CardTitle>
              <CardDescription>
                Best performing menu items by revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics?.topItems.slice(0, 5).map((item, index) => (
                  <div
                    key={item.itemId}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-400">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          {item.orderCount} orders
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-green-600">
                      ${item.revenue.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Peak Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Peak Ordering Times</CardTitle>
              <CardDescription>Busiest hours of the day</CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleBarChart
                data={analytics?.peakHours || []}
                dataKey="orderCount"
                label="Orders"
                color="bg-blue-500"
                xAxisKey="hour"
                formatXAxis={(hour) => `${hour}:00`}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Order Analytics Tab */}
        <TabsContent value="orders" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard
              title="Total Orders"
              value={orderAnalytics?.totalOrders || 0}
              icon={<ShoppingCart className="w-5 h-5" />}
            />
            <MetricCard
              title="Avg Order Value"
              value={`$${orderAnalytics?.averageOrderValue.toFixed(2) || "0.00"}`}
              icon={<DollarSign className="w-5 h-5" />}
            />
            <MetricCard
              title="Avg Fulfillment"
              value={`${orderAnalytics?.averageFulfillmentTime || 0} min`}
              icon={<Clock className="w-5 h-5" />}
            />
            <MetricCard
              title="Cancellation Rate"
              value={`${((orderAnalytics?.cancellationRate || 0) * 100).toFixed(1)}%`}
              icon={<XCircle className="w-5 h-5" />}
              trend={(orderAnalytics?.cancellationRate || 0) > 0 ? -1 : 0}
            />
          </div>

          {/* Orders by Status */}
          <Card>
            <CardHeader>
              <CardTitle>Orders by Status</CardTitle>
              <CardDescription>Breakdown of order statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {orderAnalytics?.ordersByStatus &&
                  Object.entries(orderAnalytics.ordersByStatus).map(
                    ([status, count]) => (
                      <div
                        key={status}
                        className="p-4 border rounded text-center"
                      >
                        <p className="text-2xl font-bold">{count}</p>
                        <p className="text-sm text-gray-600 capitalize">
                          {status}
                        </p>
                      </div>
                    ),
                  )}
              </div>
            </CardContent>
          </Card>

          {/* Order Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Order Trends</CardTitle>
              <CardDescription>Daily order volume over time</CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleBarChart
                data={orderAnalytics?.orderTrends || []}
                dataKey="count"
                label="Orders"
                color="bg-purple-500"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Menu Performance Tab */}
        <TabsContent value="menu" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Selling Items */}
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Items</CardTitle>
                <CardDescription>
                  Best performers by quantity sold
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {menuAnalytics?.topSellingItems
                    .slice(0, 5)
                    .map((item, index) => (
                      <div
                        key={item.itemId}
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-green-600">
                            #{index + 1}
                          </span>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">
                              {item.quantitySold} sold
                            </p>
                          </div>
                        </div>
                        <p className="font-bold">${item.revenue.toFixed(2)}</p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Least Selling Items */}
            <Card>
              <CardHeader>
                <CardTitle>Least Selling Items</CardTitle>
                <CardDescription>Items that need attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {menuAnalytics?.leastSellingItems
                    .slice(0, 5)
                    .map((item, index) => (
                      <div
                        key={item.itemId}
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <div className="flex items-center gap-3">
                          <TrendingDown className="w-5 h-5 text-red-500" />
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">
                              {item.quantitySold} sold
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Item Ratings */}
          <Card>
            <CardHeader>
              <CardTitle>Item Ratings</CardTitle>
              <CardDescription>Customer ratings for menu items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {menuAnalytics?.itemRatings.slice(0, 10).map((item) => (
                  <div
                    key={item.itemId}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.reviewCount} reviews
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold">
                        {item.averageRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Category Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
              <CardDescription>Revenue by menu category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {menuAnalytics?.categoryPerformance.map((category) => (
                  <div
                    key={category.category}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div>
                      <p className="font-medium">{category.category}</p>
                      <p className="text-sm text-gray-600">
                        {category.itemCount} items
                      </p>
                    </div>
                    <p className="font-bold text-green-600">
                      ${category.revenue.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
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
        {trend !== undefined && trend !== 0 && (
          <p
            className={`text-sm mt-2 ${trend > 0 ? "text-green-600" : "text-red-600"}`}
          >
            {trend > 0 ? "↑" : "↓"} {Math.abs(trend)} from last period
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function SimpleBarChart({
  data,
  dataKey,
  label,
  color,
  xAxisKey = "date",
  formatXAxis,
}: {
  data: any[];
  dataKey: string;
  label: string;
  color: string;
  xAxisKey?: string;
  formatXAxis?: (value: any) => string;
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
                  title={`${label}: ${item[dataKey]}`}
                />
              </div>
              <p className="text-xs text-gray-600 text-center">
                {formatXAxis
                  ? formatXAxis(item[xAxisKey])
                  : new Date(item[xAxisKey]).toLocaleDateString("en-US", {
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
