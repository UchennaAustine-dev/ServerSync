"use client";

import { use, useMemo } from "react";
import { MenuItemCard } from "@/components/restaurant/MenuItemCard";
import { Button } from "@/components/ui/button";
import {
  Star,
  Clock,
  MapPin,
  ChevronLeft,
  Share2,
  Heart,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import MainLayout from "@/components/layout/MainLayout";
import { useRestaurant, useRestaurantMenu } from "@/lib/hooks/restaurant.hooks";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { MenuItem } from "@/lib/api/types";
import { FavoriteButton } from "@/components/restaurant/FavoriteButton";

// Helper function to format price range
const formatPriceRange = (priceRange: number): string => {
  return "$".repeat(priceRange);
};

// Helper function to format delivery time
const formatDeliveryTime = (minutes: number): string => {
  return `${minutes} min`;
};

// Loading skeleton component
function RestaurantDetailSkeleton() {
  return (
    <MainLayout>
      <div className="h-96 md:h-[500px] w-full bg-gray-100 animate-pulse" />
      <div className="container mx-auto px-6 -mt-20 relative z-10 pb-32">
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white/95 backdrop-blur-3xl rounded-[40px] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.15)] border border-white/40 p-8 md:p-12">
              <Skeleton className="h-8 w-2/3 mb-4" />
              <Skeleton className="h-4 w-1/3 mb-8" />
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </div>
          <div className="lg:col-span-4">
            <Skeleton className="h-64 w-full rounded-[40px]" />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// Error component
function RestaurantError({
  error,
  onRetry,
}: {
  error: Error;
  onRetry: () => void;
}) {
  return (
    <MainLayout>
      <div className="container mx-auto px-6 py-20">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Restaurant</AlertTitle>
          <AlertDescription className="mt-2">
            {error.message ||
              "Failed to load restaurant details. Please try again."}
          </AlertDescription>
          <Button onClick={onRetry} variant="outline" className="mt-4">
            Retry
          </Button>
        </Alert>
      </div>
    </MainLayout>
  );
}

export default function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const restaurantId = resolvedParams.id;

  // Fetch restaurant and menu data
  const {
    data: restaurant,
    isLoading: isLoadingRestaurant,
    error: restaurantError,
    refetch: refetchRestaurant,
  } = useRestaurant(restaurantId);

  const {
    data: menuData,
    isLoading: isLoadingMenu,
    error: menuError,
    refetch: refetchMenu,
  } = useRestaurantMenu(restaurantId);

  // Group menu items by category
  const menuByCategory = useMemo(() => {
    if (!menuData?.items) return [];

    const grouped = menuData.items.reduce(
      (acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
      },
      {} as Record<string, MenuItem[]>,
    );

    return Object.entries(grouped).map(([category, items]) => ({
      name: category,
      items,
    }));
  }, [menuData]);

  // Handle loading state
  if (isLoadingRestaurant || isLoadingMenu) {
    return <RestaurantDetailSkeleton />;
  }

  // Handle error state
  if (restaurantError || menuError) {
    return (
      <RestaurantError
        error={(restaurantError || menuError) as Error}
        onRetry={() => {
          refetchRestaurant();
          refetchMenu();
        }}
      />
    );
  }

  // Handle not found
  if (!restaurant) {
    return (
      <MainLayout>
        <div className="container mx-auto px-6 py-20">
          <Alert className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Restaurant Not Found</AlertTitle>
            <AlertDescription>
              The restaurant you're looking for doesn't exist or has been
              removed.
            </AlertDescription>
            <Link href="/restaurants">
              <Button variant="outline" className="mt-4">
                Browse Restaurants
              </Button>
            </Link>
          </Alert>
        </div>
      </MainLayout>
    );
  }

  const priceRange = formatPriceRange(restaurant.priceRange);
  const deliveryTime = formatDeliveryTime(restaurant.estimatedDeliveryTime);

  return (
    <MainLayout>
      {/* Hero Header */}
      <div className="relative h-96 md:h-[500px] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{
            backgroundImage: restaurant.coverImage
              ? `url(${restaurant.coverImage})`
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          <div className="absolute inset-0 bg-linear-to-t from-secondary via-secondary/20 to-transparent" />
        </div>

        <div className="absolute top-8 left-8 z-20">
          <Link href="/restaurants">
            <Button
              variant="secondary"
              size="icon"
              className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/30 text-white backdrop-blur-xl border border-white/20 transition-all duration-300"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          </Link>
        </div>

        <div className="absolute top-8 right-8 z-20 flex gap-4">
          <Button
            variant="secondary"
            size="icon"
            className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/30 text-white backdrop-blur-xl border border-white/20 transition-all"
          >
            <Share2 className="w-5 h-5" />
          </Button>
          <FavoriteButton restaurantId={restaurantId} variant="detail" />
        </div>

        <div className="absolute bottom-12 left-12 right-12 text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest mb-6 shadow-2xl">
            {restaurant.isOpen ? "Open Now" : "Closed"}
          </div>
          <h1 className="text-6xl md:text-8xl font-heading font-normal leading-tight tracking-tighter">
            {restaurant.name}
          </h1>
        </div>
      </div>

      {/* Restaurant Info & Menu */}
      <div className="container mx-auto px-6 -mt-20 relative z-10 pb-32">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white/95 backdrop-blur-3xl rounded-[40px] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.15)] border border-white/40 p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-50 text-emerald-700">
                    <Star className="w-5 h-5 fill-emerald-500 text-emerald-500" />
                    <span className="text-lg font-black">
                      {restaurant.rating.toFixed(1)}
                    </span>
                    <span className="text-sm font-bold opacity-40">
                      ({restaurant.reviewCount}+ reviews)
                    </span>
                  </div>
                  <div className="h-8 w-px bg-gray-100 hidden md:block" />
                  <div className="flex gap-3">
                    {restaurant.cuisineType.map((cuisine) => (
                      <span
                        key={cuisine}
                        className="px-4 py-2 rounded-xl bg-gray-50 text-[10px] font-black text-muted-foreground uppercase tracking-widest"
                      >
                        {cuisine}
                      </span>
                    ))}
                    <span className="px-4 py-2 rounded-xl bg-gray-50 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      {priceRange}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      Delivery
                    </p>
                    <p className="font-bold text-secondary">{deliveryTime}</p>
                  </div>
                </div>
              </div>

              {/* Restaurant Description */}
              {restaurant.description && (
                <div className="mb-12 pb-12 border-b border-gray-100">
                  <p className="text-muted-foreground leading-relaxed">
                    {restaurant.description}
                  </p>
                </div>
              )}

              {/* Menu Categories Navigation */}
              {menuByCategory.length > 0 && (
                <div className="sticky top-20 bg-white/80 backdrop-blur-md z-20 -mx-8 md:-mx-12 px-8 md:px-12 py-6 flex gap-8 overflow-x-auto scrollbar-hide border-y border-gray-50">
                  {menuByCategory.map((cat, i) => (
                    <a
                      key={cat.name}
                      href={`#category-${i}`}
                      className={`flex-none text-xs font-black uppercase tracking-[0.2em] transition-all hover:text-primary ${
                        i === 0 ? "text-primary" : "text-muted-foreground/60"
                      }`}
                    >
                      {cat.name}
                    </a>
                  ))}
                </div>
              )}

              {/* Menu Items Grid */}
              {menuByCategory.length > 0 ? (
                <div className="pt-16 space-y-24">
                  {menuByCategory.map((cat, i) => (
                    <div
                      key={cat.name}
                      id={`category-${i}`}
                      className="scroll-mt-48 space-y-10"
                    >
                      <div className="relative">
                        <h3 className="text-4xl font-heading text-secondary tracking-tight">
                          {cat.name}
                        </h3>
                        <div className="absolute -bottom-4 left-0 w-12 h-1 bg-primary/20 rounded-full" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {cat.items.map((item) => (
                          <div key={item.id} className="relative">
                            <MenuItemCard
                              id={item.id}
                              name={item.name}
                              description={item.description}
                              price={item.price}
                              image={item.image}
                              restaurantId={restaurant.id}
                              restaurantName={restaurant.name}
                              allergens={item.allergens}
                              nutritionalInfo={item.nutritionalInfo}
                              isAvailable={item.isAvailable}
                            />
                            {!item.isAvailable && (
                              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-[32px] flex items-center justify-center">
                                <span className="px-6 py-3 bg-gray-900 text-white text-sm font-bold rounded-2xl">
                                  Currently Unavailable
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="pt-16 text-center">
                  <p className="text-muted-foreground">
                    No menu items available at this time.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-6 sticky top-24">
            <div className="bg-secondary p-10 rounded-[40px] text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-colors duration-700" />
              <div className="relative z-10 space-y-8">
                <div className="space-y-2 text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                    Estimated Arrival
                  </p>
                  <p className="text-5xl font-heading italic text-primary">
                    {deliveryTime}
                  </p>
                </div>
                <div className="h-px bg-white/10" />
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-white/60">
                    <span>Min Order</span>
                    <span className="text-white">
                      ${restaurant.minimumOrder.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-white/60">
                    <span>Delivery Fee</span>
                    <span className="text-white">
                      {restaurant.deliveryFee === 0
                        ? "Free"
                        : `$${restaurant.deliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                </div>
                <Button
                  className="w-full h-16 rounded-2xl bg-white text-secondary hover:bg-primary hover:text-white text-lg font-black transition-all"
                  disabled={!restaurant.isOpen || !restaurant.isAvailable}
                >
                  {restaurant.isOpen && restaurant.isAvailable
                    ? "Start Order"
                    : "Currently Closed"}
                </Button>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-gray-100 space-y-6">
              <h4 className="text-xs font-black uppercase tracking-widest text-secondary">
                Location & Contact
              </h4>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-secondary" />
                </div>
                <p className="text-sm font-bold text-muted-foreground leading-relaxed">
                  {restaurant.address}
                </p>
              </div>
              {restaurant.phone && (
                <div className="pt-4 flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-secondary" />
                  </div>
                  <div className="text-sm">
                    <p className="font-bold text-secondary">Phone</p>
                    <p className="font-bold text-muted-foreground">
                      {restaurant.phone}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
