"use client";

import MainLayout from "@/components/layout/MainLayout";
import { RestaurantCard } from "@/components/restaurant/RestaurantCard";
import { useFavorites } from "@/lib/hooks/customer.hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Heart, AlertCircle } from "lucide-react";
import Link from "next/link";
import type { Restaurant } from "@/lib/api/types";

export default function FavoritesPage() {
  const {
    data: favorites = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useFavorites();

  return (
    <MainLayout>
      <section className="py-20 relative overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-linear-to-bl from-primary/5 to-transparent rounded-bl-full -z-10" />

        <div className="container mx-auto px-4">
          <div className="max-w-3xl mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest mb-6">
              <Heart className="w-3 h-3 fill-red-500" />
              Your Collection
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-secondary mb-6 leading-tight">
              Your <span className="text-primary italic">Favorite</span>{" "}
              Restaurants
            </h1>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed">
              Quick access to the restaurants you love. Your go-to spots for
              every craving.
            </p>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-[40px] overflow-hidden bg-white border border-gray-100 shadow-sm"
                >
                  <Skeleton className="aspect-[4/5]" />
                  <div className="p-8 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            /* Error State */
            <div className="text-center py-20 bg-destructive/5 rounded-[40px] border border-destructive/10">
              <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <p className="text-destructive font-bold text-lg mb-2">
                Failed to load favorites
              </p>
              <p className="text-muted-foreground font-medium mb-6">
                {error instanceof Error
                  ? error.message
                  : "Please try again later"}
              </p>
              <Button
                onClick={() => refetch()}
                className="rounded-2xl px-8 py-3 font-bold"
              >
                Try Again
              </Button>
            </div>
          ) : favorites.length === 0 ? (
            /* Empty State */
            <div className="text-center py-20 bg-gray-50 rounded-[40px] border border-gray-100">
              <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                <Heart className="w-12 h-12 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-secondary mb-3">
                No favorites yet
              </h2>
              <p className="text-muted-foreground font-medium mb-8 max-w-md mx-auto">
                Start building your collection by adding restaurants you love.
                Just tap the heart icon on any restaurant card.
              </p>
              <Link href="/restaurants">
                <Button className="rounded-2xl px-8 py-3 font-bold">
                  Browse Restaurants
                </Button>
              </Link>
            </div>
          ) : (
            /* Favorites Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {favorites.map((restaurant: Restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  id={restaurant.id}
                  name={restaurant.name}
                  address={restaurant.address}
                  rating={restaurant.rating}
                  tags={restaurant.cuisineType}
                  minOrder={restaurant.minimumOrder}
                  image={restaurant.coverImage || restaurant.logo}
                  deliveryTime={`${restaurant.estimatedDeliveryTime} min`}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
