"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Store,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

// Mock data - will be replaced with real API calls
const mockStats = [
  {
    label: "Total Users",
    value: "12,845",
    icon: Users,
    trend: "+12.5%",
    trendUp: true,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    label: "Active Restaurants",
    value: "487",
    icon: Store,
    trend: "+8.2%",
    trendUp: true,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    label: "Total Orders",
    value: "8,234",
    icon: ShoppingBag,
    trend: "+15.3%",
    trendUp: true,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    label: "Revenue (MTD)",
    value: "$124.5K",
    icon: DollarSign,
    trend: "+18.7%",
    trendUp: true,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
];

const mockRecentOrders = [
  {
    id: "ORD-8901",
    customer: "John Doe",
    restaurant: "Dragon Wok",
    amount: 45.5,
    status: "completed",
    time: "2 min ago",
  },
  {
    id: "ORD-8900",
    customer: "Jane Smith",
    restaurant: "Pizza Paradise",
    amount: 32.0,
    status: "in_progress",
    time: "5 min ago",
  },
  {
    id: "ORD-8899",
    customer: "Mike Johnson",
    restaurant: "Burger Haven",
    amount: 28.75,
    status: "completed",
    time: "12 min ago",
  },
  {
    id: "ORD-8898",
    customer: "Sarah Williams",
    restaurant: "Sushi Masters",
    amount: 65.0,
    status: "completed",
    time: "18 min ago",
  },
  {
    id: "ORD-8897",
    customer: "Tom Brown",
    restaurant: "Taco Fiesta",
    amount: 24.5,
    status: "cancelled",
    time: "25 min ago",
  },
];

const mockTopRestaurants = [
  {
    id: "1",
    name: "Dragon Wok",
    orders: 234,
    revenue: 12450,
    rating: 4.8,
    trend: 12,
  },
  {
    id: "2",
    name: "Pizza Paradise",
    orders: 198,
    revenue: 9876,
    rating: 4.6,
    trend: 8,
  },
  {
    id: "3",
    name: "Sushi Masters",
    orders: 156,
    revenue: 15230,
    rating: 4.9,
    trend: 15,
  },
  {
    id: "4",
    name: "Burger Haven",
    orders: 145,
    revenue: 7234,
    rating: 4.5,
    trend: -3,
  },
  {
    id: "5",
    name: "Taco Fiesta",
    orders: 132,
    revenue: 5678,
    rating: 4.7,
    trend: 5,
  },
];

const mockSystemAlerts = [
  {
    type: "warning",
    message: "3 restaurants haven't updated menu in 30 days",
    time: "1 hour ago",
  },
  {
    type: "info",
    message: "Peak order time approaching (6 PM - 8 PM)",
    time: "2 hours ago",
  },
  {
    type: "success",
    message: "System backup completed successfully",
    time: "5 hours ago",
  },
];

export default function AdminDashboard() {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return {
          label: "Completed",
          color: "bg-green-50 text-green-700 border-green-200",
        };
      case "in_progress":
        return {
          label: "In Progress",
          color: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case "cancelled":
        return {
          label: "Cancelled",
          color: "bg-red-50 text-red-700 border-red-200",
        };
      default:
        return {
          label: status,
          color: "bg-muted text-muted-foreground",
        };
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Activity className="w-4 h-4 text-blue-600" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "warning":
        return "border-l-amber-500 bg-amber-50";
      case "success":
        return "border-l-green-500 bg-green-50";
      default:
        return "border-l-blue-500 bg-blue-50";
    }
  };

  return (
    <DashboardLayout>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {mockStats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trendUp ? ArrowUp : ArrowDown;
          return (
            <Card key={stat.label} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.bgColor} p-3 rounded-xl`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div
                  className={`flex items-center gap-1 text-xs font-medium ${
                    stat.trendUp ? "text-green-600" : "text-red-600"
                  }`}
                >
                  <TrendIcon className="w-3 h-3" />
                  {stat.trend}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-3xl font-heading font-bold">{stat.value}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* System Alerts */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-heading font-semibold">
              System Alerts
            </h2>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>
          <Card className="p-6">
            <div className="space-y-4">
              {mockSystemAlerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${getAlertColor(alert.type)}`}
                >
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-secondary">
                        {alert.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {alert.time}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-heading font-semibold mb-4">
            Quick Actions
          </h2>
          <Card className="p-6">
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Store className="w-4 h-4 mr-2" />
                Manage Restaurants
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <ShoppingBag className="w-4 h-4 mr-2" />
                View All Orders
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="w-4 h-4 mr-2" />
                Analytics Report
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-heading font-semibold">
              Recent Orders
            </h2>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>
          <Card className="p-6">
            <div className="space-y-4">
              {mockRecentOrders.map((order, index) => (
                <div key={order.id}>
                  {index > 0 && <div className="border-t my-4" />}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{order.id}</h4>
                        <Badge
                          variant="outline"
                          className={getStatusConfig(order.status).color}
                        >
                          {getStatusConfig(order.status).label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {order.customer} • {order.restaurant}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {order.time}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold">
                        ${order.amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Top Restaurants */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-heading font-semibold">
              Top Restaurants
            </h2>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>
          <Card className="p-6">
            <div className="space-y-4">
              {mockTopRestaurants.map((restaurant, index) => (
                <div key={restaurant.id}>
                  {index > 0 && <div className="border-t my-4" />}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-heading font-semibold text-sm">
                      #{index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{restaurant.name}</h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span>{restaurant.orders} orders</span>
                        <span>⭐ {restaurant.rating}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        ${(restaurant.revenue / 1000).toFixed(1)}K
                      </div>
                      <div
                        className={`flex items-center gap-0.5 text-xs ${
                          restaurant.trend > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {restaurant.trend > 0 ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        )}
                        {Math.abs(restaurant.trend)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Platform Health Banner */}
      <Card className="mt-8 bg-linear-to-r from-green-50 to-emerald-50 border-green-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-lg text-secondary">
                Platform Health: Excellent
              </h3>
              <p className="text-sm text-muted-foreground">
                All systems operational • 99.8% uptime this month
              </p>
            </div>
          </div>
          <Button variant="outline" className="bg-white">
            View Metrics
          </Button>
        </div>
      </Card>
    </DashboardLayout>
  );
}
