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
} from "lucide-react";
import Link from "next/link";

// Mock data - will be replaced with real API calls
const mockStats = [
  {
    label: "Total Orders",
    value: "24",
    icon: ShoppingBag,
    trend: "+12% from last month",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    label: "In Progress",
    value: "2",
    icon: Clock,
    trend: "2 active deliveries",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    label: "Completed",
    value: "22",
    icon: CheckCircle,
    trend: "95% on-time delivery",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    label: "Total Spent",
    value: "$847",
    icon: TrendingUp,
    trend: "+8% from last month",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

const mockActiveOrders = [
  {
    id: "1",
    restaurant: "Dragon Wok",
    items: ["Kung Pao Chicken", "Fried Rice"],
    status: "preparing",
    estimatedTime: "15-20 min",
    total: 28.5,
    image: "🥡",
  },
  {
    id: "2",
    restaurant: "Pizza Paradise",
    items: ["Margherita Pizza", "Garlic Bread"],
    status: "on_the_way",
    estimatedTime: "8-12 min",
    total: 24.99,
    image: "🍕",
  },
];

const mockRecentOrders = [
  {
    id: "3",
    restaurant: "Burger Haven",
    items: ["Double Cheeseburger", "Fries"],
    date: "Jan 28, 2026",
    total: 18.5,
    rating: 5,
    image: "🍔",
  },
  {
    id: "4",
    restaurant: "Sushi Masters",
    items: ["California Roll", "Miso Soup"],
    date: "Jan 25, 2026",
    total: 32.0,
    rating: 4,
    image: "🍣",
  },
  {
    id: "5",
    restaurant: "Taco Fiesta",
    items: ["Beef Tacos (3)", "Guacamole"],
    date: "Jan 22, 2026",
    total: 15.75,
    rating: 5,
    image: "🌮",
  },
];

const mockFavorites = [
  {
    id: "1",
    name: "Dragon Wok",
    cuisine: "Chinese",
    rating: 4.8,
    deliveryTime: "25-35 min",
    image: "🥡",
  },
  {
    id: "2",
    name: "Pizza Paradise",
    cuisine: "Italian",
    rating: 4.6,
    deliveryTime: "20-30 min",
    image: "🍕",
  },
  {
    id: "3",
    name: "Sushi Masters",
    cuisine: "Japanese",
    rating: 4.9,
    deliveryTime: "30-40 min",
    image: "🍣",
  },
];

export default function CustomerDashboard() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "preparing":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "on_the_way":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "delivered":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "preparing":
        return "Preparing";
      case "on_the_way":
        return "On the way";
      case "delivered":
        return "Delivered";
      default:
        return status;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-heading font-black text-secondary leading-tight">
              Welcome back, <span className="text-primary italic">Uchenna</span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium mt-2">
              You've got 2 orders arriving soon. Get ready to feast!
            </p>
          </div>
          <Button asChild size="lg" className="h-14 px-8 rounded-2xl font-black shadow-xl shadow-primary/20">
            <Link href="/restaurants">Explore New Flavors</Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-8 bg-white/80 backdrop-blur-xl border-gray-100 rounded-[32px] transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:scale-[1.02]">
                <div className="flex items-start justify-between">
                  <div className="space-y-4">
                    <div className={`${stat.bgColor} w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner`}>
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
        {mockActiveOrders.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-heading font-black text-secondary">
                Live <span className="text-primary luxury-text">Orders</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {mockActiveOrders.map((order) => (
                <Card key={order.id} className="p-8 bg-secondary text-white rounded-[40px] overflow-hidden relative group transition-all duration-500 hover:shadow-2xl hover:shadow-secondary/20">
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -z-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-4xl shadow-inner">
                          {order.image}
                        </div>
                        <div>
                          <h3 className="text-2xl font-heading font-bold mb-1">
                            {order.restaurant}
                          </h3>
                          <p className="text-sm text-white/60 font-medium italic">
                            {order.items.join(", ")}
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
                          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Arrival</p>
                          <p className="font-bold text-sm tracking-tight">{order.estimatedTime}</p>
                        </div>
                      </div>
                      <Button className="h-12 px-6 rounded-2xl bg-white text-secondary hover:bg-white/90 font-bold text-sm">
                        Track Live
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
            <Card className="bg-white/50 border-gray-100 rounded-[32px] overflow-hidden">
              <div className="divide-y divide-gray-50">
                {mockRecentOrders.map((order) => (
                  <div key={order.id} className="p-8 flex items-center justify-between gap-6 group hover:bg-white transition-colors">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-3xl transition-transform group-hover:scale-110">
                        {order.image}
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-secondary group-hover:text-primary transition-colors">
                          {order.restaurant}
                        </h4>
                        <p className="text-sm text-muted-foreground font-medium">
                          {order.date} • {order.items.length} items
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="hidden md:block">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < order.rating
                                  ? "fill-primary text-primary"
                                  : "text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="text-xl font-heading font-black text-secondary shrink-0">
                        ${order.total.toFixed(2)}
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        <ArrowRight className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Quick Contacts / Favorites */}
          <div className="space-y-6">
            <h2 className="text-2xl font-heading font-black text-secondary">
              Top <span className="text-primary">Squad</span>
            </h2>
            <Card className="p-8 bg-white/80 backdrop-blur-xl border-gray-100 rounded-[32px]">
              <div className="space-y-8">
                {mockFavorites.map((restaurant) => (
                  <Link
                    key={restaurant.id}
                    href={`/restaurants/${restaurant.id}`}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        {restaurant.image}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-secondary group-hover:text-primary transition-colors">
                          {restaurant.name}
                        </h4>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                          {restaurant.cuisine}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white shadow-sm border border-gray-50">
                      <Star className="w-3 h-3 fill-primary text-primary" />
                      <span className="text-xs font-black">{restaurant.rating}</span>
                    </div>
                  </Link>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-10 h-12 rounded-2xl font-bold border-gray-100 hover:border-primary hover:text-primary transition-all">
                Browse More
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
