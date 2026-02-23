"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { useLogout } from "@/lib/hooks/auth.hooks";
import type { UserRole } from "@/lib/api/types/auth.types";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Settings,
  LogOut,
  UserCircle,
  Menu,
  ChevronRight,
  Store,
  Users,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface SidebarProps {
  role: UserRole;
  isMobile?: boolean;
  onClose?: () => void;
}

function Sidebar({ role, isMobile, onClose }: SidebarProps) {
  const pathname = usePathname();
  const logout = useLogout();

  const customerLinks = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
    { icon: ShoppingBag, label: "My Orders", href: "/dashboard/orders" },
    { icon: UserCircle, label: "Profile", href: "/dashboard/profile" },
  ];

  const kitchenLinks = [
    { icon: LayoutDashboard, label: "Live Orders", href: "/dashboard/kitchen" },
    {
      icon: UtensilsCrossed,
      label: "Menu Management",
      href: "/dashboard/menu",
    },
    {
      icon: Settings,
      label: "Restaurant Settings",
      href: "/dashboard/settings",
    },
  ];

  const adminLinks = [
    { icon: LayoutDashboard, label: "Admin Overview", href: "/admin" },
    { icon: Store, label: "Restaurants", href: "/admin/restaurants" },
    { icon: Users, label: "Drivers", href: "/admin/drivers" },
    { icon: ShoppingBag, label: "Orders", href: "/admin/orders" },
    { icon: DollarSign, label: "Revenue Analytics", href: "/admin/revenue" },
    {
      icon: TrendingUp,
      label: "Driver Performance",
      href: "/admin/drivers-performance",
    },
    { icon: Settings, label: "System Settings", href: "/admin/settings" },
  ];

  const links =
    role === "KITCHEN_STAFF" || role === "RESTAURANT_OWNER"
      ? kitchenLinks
      : role === "ADMIN"
        ? adminLinks
        : customerLinks;

  const handleLogout = () => {
    logout.mutate();
    // Redirect handled by component usage or global effect
  };

  return (
    <div
      className={`flex flex-col h-full bg-card ${!isMobile ? "border-r" : ""}`}
    >
      <div className="p-6 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="font-heading font-bold text-white text-lg">S</span>
        </div>
        <span className="font-heading font-bold text-xl tracking-tight text-foreground">
          ServeSync
        </span>
      </div>

      <div className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <p className="px-2 text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
          {role} DASHBOARD
        </p>

        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all group ${
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon
                className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}
              />
              <span>{link.label}</span>
              {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          );
        })}
      </div>

      <div className="p-4 mt-auto">
        <Separator className="mb-4" />
        <Button
          variant="ghost"
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Log Out
        </Button>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  // Fallback for non-authenticated view (should ideally redirect via middleware)
  const role = user?.role || "CUSTOMER";

  return (
    <div className="flex min-h-screen bg-background text-foreground font-body">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 fixed inset-y-0 z-50">
        <Sidebar role={role} />
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b bg-card flex items-center justify-between px-4 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <span className="font-heading font-bold text-white text-sm">
                S
              </span>
            </div>
            <span className="font-heading font-bold text-lg">ServeSync</span>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <Sidebar role={role} isMobile onClose={() => {}} />
            </SheetContent>
          </Sheet>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section could go here */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold font-heading">
                  {role === "CUSTOMER" &&
                    `Welcome back, ${user?.name || "User"}!`}
                  {(role === "KITCHEN_STAFF" || role === "RESTAURANT_OWNER") &&
                    "Kitchen Dashboard"}
                  {role === "ADMIN" && "Admin Portal"}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {role === "CUSTOMER" &&
                    "Here's what's happening with your orders today."}
                  {(role === "KITCHEN_STAFF" || role === "RESTAURANT_OWNER") &&
                    "Manage your menu and track live orders."}
                </p>
              </div>
              {/* Optional: Date or Action button */}
              <div className="hidden md:flex items-center gap-2">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Today's Date</p>
                  <p className="text-sm font-medium">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
                <Avatar className="h-10 w-10 border-2 border-background shadow-sm ml-2">
                  <AvatarImage src="/avatars/01.png" />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
