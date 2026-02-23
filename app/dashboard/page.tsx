"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  TrendingUp,
  ArrowRight,
  MapPin,
  Star,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useOrders } from "@/lib/hooks/order.hooks";
import { useCustomerAnalytics, useFavorites } from "@/lib/hooks/customer.hooks";
import { useMemo } from "react";

export default function CustomerDashboard() {
  // Fetch real data from API
  const { data: ordersData, isLoading: ordersLoading } = useOrders({
    limit: 10,
  });
  const { data: analyticsData, isLoading: analyticsLoading } =
    useCustomerAnalytics();
  const { data: favoritesData, isLoading: favoritesLoading } = useFavorites();

  const orders = ordersData?.data || [];
  const favorites = favoritesData || [];

  // Calculate stats from real data
  const stats = useMemo(() => {
    const totalOrders = analyticsData?.totalOrders || 0;
    const activeOrders = orders.filter((o) =>
      [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "out_for_delivery",
      ].includes(o.status),
    ).length;
    const completedOrders = totalOrders - activeOrders;
    const totalSpent = analyticsData?.totalSpending || 0;

    return [
      {
        label: "Total Orders",
        value: totalOrders.toString(),
        icon: ShoppingBag,
        trend: `${completedOrders} completed`,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
      {
        label: "In Progress",
        value: activeOrders.toString(),
        icon: Clock,
        trend: `${activeOrders} active ${activeOrders === 1 ? "delivery" : "deliveries"}`,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
      },
      {
        label: "Completed",
        value: completedOrders.toString(),
        icon: CheckCircle,
        trend: "All time",
        color: "text-green-600",
        bgColor: "bg-green-50",
      },
      {
        label: "Total Spent",
        value: `$${totalSpent.toFixed(0)}`,
        icon: TrendingUp,
        trend: "All time",
        color: "text-primary",
        bgColor: "bg-primary/10",
      },
    ];
  }, [analyticsData, orders]);

  const activeOrders = orders.filter((o) =>
    ["preparing", "ready", "out_for_delivery"].includes(o.status),
  );

  const recentOrders = orders
    .filter((o) => o.status === "delivered")
    .slice(0, 3);

  const isLoading = ordersLoading || analyticsLoading || favoritesLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">
            Loading dashboard...
          </span>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "preparing":
        return "Preparing";
      case "out_for_delivery":
        return "On the way";
      case "ready":
        return "Ready";
      case "delivered":
        return "Delivered";
      default:
        return status;
    }
  };

  const getOrderEmoji = (restaurantName: string) => {
    // Simple emoji mapping based on restaurant name
    const name = restaurantName.toLowerCase();
    if (name.includes("pizza")) return "🍕";
    if (name.includes("burger")) return "🍔";
    if (name.includes("sushi")) return "🍣";
    if (name.includes("taco") || name.includes("mexican")) return "🌮";
    if (name.includes("chinese") || name.includes("wok")) return "🥡";
    return "🍽️";
  };

  return (
    <DashboardLayout>
      <div className="space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-heading font-black text-secondary leading-tight">
              Welcome back!
            </h1>
            <p className="text-lg text-muted-foreground font-medium mt-2">
              {activeOrders.length > 0
                ? `You've got ${activeOrders.length} ${activeOrders.length === 1 ? "order" : "orders"} arriving soon. Get ready to feast!`
                : "Ready to order? Explore restaurants near you!"}
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="h-14 px-8 rounded-2xl font-black shadow-xl shadow-primary/20"
          >
            <Link href="/restaurants">Explore New Flavors</Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.label}
                className="p-8 bg-white/80 backdrop-blur-xl border-gray-100 rounded-[32px] transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:scale-[1.02]"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-4">
                    <div
                      className={`${stat.bgColor} w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner`}
                    >
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-3xl font-heading font-black text-secondary">
                        {stat.value}
                      </p>
                      <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-50">
                  <p className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    {stat.trend}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Active Orders Section */}
        {activeOrders.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-heading font-black text-secondary">
                Live <span className="text-primary luxury-text">Orders</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {activeOrders.map((order) => (
                <Card
                  key={order.id}
                  className="p-8 bg-secondary text-white rounded-[40px] overflow-hidden relative group transition-all duration-500 hover:shadow-2xl hover:shadow-secondary/20"
                >
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -z-0 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-4xl shadow-inner">
                          {getOrderEmoji(order.restaurantId)}
                        </div>
                        <div>
                          <h3 className="text-2xl font-heading font-bold mb-1">
                            Order #{order.id.slice(0, 8)}
                          </h3>
                          <p className="text-sm text-white/60 font-medium italic">
                            {order.items
                              .slice(0, 2)
                              .map((i) => i.name)
                              .join(", ")}
                            {order.items.length > 2 &&
                              ` +${order.items.length - 2} more`}
                          </p>
                        </div>
                      </div>
                      <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest animate-pulse">
                        {getStatusLabel(order.status)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-6 pt-6 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                            Order Time
                          </p>
                          <p className="font-bold text-sm tracking-tight">
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <Button
                        className="h-12 px-6 rounded-2xl bg-white text-secondary hover:bg-white/90 font-bold text-sm"
                        asChild
                      >
                        <Link href={`/orders/${order.id}`}>Track Live</Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Orders - Bento Style */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-heading font-black text-secondary">
              Order <span className="text-muted-foreground/40">History</span>
            </h2>
            {recentOrders.length > 0 ? (
              <Card className="bg-white/50 border-gray-100 rounded-[32px] overflow-hidden">
                <div className="divide-y divide-gray-50">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-8 flex items-center justify-between gap-6 group hover:bg-white transition-colors"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-3xl transition-transform group-hover:scale-110">
                          {getOrderEmoji(order.restaurantId)}
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-secondary group-hover:text-primary transition-colors">
                            Order #{order.id.slice(0, 8)}
                          </h4>
                          <p className="text-sm text-muted-foreground font-medium">
                            {new Date(order.createdAt).toLocaleDateString()} •{" "}
                            {order.items.length} items
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        {order.rating && (
                          <div className="hidden md:block">
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < order.rating!
                                      ? "fill-primary text-primary"
                                      : "text-gray-200"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="text-xl font-heading font-black text-secondary shrink-0">
                          ${order.total.toFixed(2)}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-all"
                          asChild
                        >
                          <Link href={`/orders/${order.id}`}>
                            <ArrowRight className="w-5 h-5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <Card className="bg-white/50 border-gray-100 rounded-[32px] p-12 text-center">
                <p className="text-muted-foreground">
                  No recent orders yet. Start ordering!
                </p>
                <Button asChild className="mt-4">
                  <Link href="/restaurants">Browse Restaurants</Link>
                </Button>
              </Card>
            )}
          </div>

          {/* Quick Contacts / Favorites */}
          <div className="space-y-6">
            <h2 className="text-2xl font-heading font-black text-secondary">
              Top <span className="text-primary">Squad</span>
            </h2>
            {favorites.length > 0 ? (
              <Card className="p-8 bg-white/80 backdrop-blur-xl border-gray-100 rounded-[32px]">
                <div className="space-y-8">
                  {favorites.slice(0, 3).map((restaurant) => (
                    <Link
                      key={restaurant.id}
                      href={`/restaurants/${restaurant.id}`}
                      className="flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                          {restaurant.logo || "🍽️"}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-secondary group-hover:text-primary transition-colors">
                            {restaurant.name}
                          </h4>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                            {restaurant.cuisineType?.[0] ||
                              restaurant.cuisineType?.join(", ") ||
                              "Restaurant"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white shadow-sm border border-gray-50">
                        <Star className="w-3 h-3 fill-primary text-primary" />
                        <span className="text-xs font-black">
                          {restaurant.rating}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-10 h-12 rounded-2xl font-bold border-gray-100 hover:border-primary hover:text-primary transition-all"
                  asChild
                >
                  <Link href="/favorites">Browse More</Link>
                </Button>
              </Card>
            ) : (
              <Card className="p-8 bg-white/80 backdrop-blur-xl border-gray-100 rounded-[32px] text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  No favorites yet
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/restaurants">Discover Restaurants</Link>
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
