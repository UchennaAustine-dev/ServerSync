"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { RestaurantCard } from "./RestaurantCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Fetch function with fallback mock data
const fetchRestaurants = async () => {
  try {
    const { data } = await api.get("/restaurants?limit=12");
    return data.data || data;
  } catch (error) {
    // Fallback mock data for development
    console.warn("Using mock restaurant data");
    return [
      {
        id: "1",
        name: "The Gourmet Kitchen",
        address: "123 Main Street",
        rating: 4.8,
        minOrder: 15,
        tags: ["American", "Burgers"],
        image:
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
      },
      {
        id: "2",
        name: "Sakura Sushi Bar",
        address: "45 Oak Avenue",
        rating: 4.9,
        minOrder: 20,
        tags: ["Japanese", "Sushi"],
        image:
          "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&h=400&fit=crop",
      },
      {
        id: "3",
        name: "Bella Italia",
        address: "78 Pine Road",
        rating: 4.6,
        minOrder: 18,
        tags: ["Italian", "Pizza"],
        image:
          "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop",
      },
      {
        id: "4",
        name: "Spice Garden",
        address: "92 Elm Street",
        rating: 4.7,
        minOrder: 12,
        tags: ["Indian", "Curry"],
        image:
          "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop",
      },
      {
        id: "5",
        name: "Taco Libre",
        address: "156 Cedar Lane",
        rating: 4.5,
        minOrder: 10,
        tags: ["Mexican", "Tacos"],
        image:
          "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop",
      },
      {
        id: "6",
        name: "Golden Dragon",
        address: "234 Maple Ave",
        rating: 4.4,
        minOrder: 15,
        tags: ["Chinese", "Noodles"],
        image:
          "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&h=400&fit=crop",
      },
      {
        id: "7",
        name: "Farm to Table",
        address: "67 Birch Blvd",
        rating: 4.8,
        minOrder: 22,
        tags: ["Healthy", "Organic"],
        image:
          "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop",
      },
      {
        id: "8",
        name: "Sweet Tooth Bakery",
        address: "89 Walnut Way",
        rating: 4.9,
        minOrder: 8,
        tags: ["Desserts", "Bakery"],
        image:
          "https://images.unsplash.com/photo-1517433670267-30f41c8a7c3e?w=600&h=400&fit=crop",
      },
    ];
  }
};

export function RestaurantFeed() {
  const [search, setSearch] = useState("");

  const {
    data: restaurants,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["restaurants"],
    queryFn: fetchRestaurants,
  });

  const filteredRestaurants = restaurants?.filter(
    (r: any) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.tags?.some((t: string) =>
        t.toLowerCase().includes(search.toLowerCase()),
      ),
  );

  return (
    <div className="space-y-12">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search for restaurants, dishes, or cravings..."
            className="pl-12 h-14 bg-white/80 backdrop-blur-md border-gray-100 rounded-3xl text-lg font-medium shadow-sm transition-all focus:shadow-xl focus:shadow-primary/5 focus:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          className="h-14 px-8 rounded-3xl font-bold gap-3 border-gray-100 hover:border-primary hover:text-primary transition-all shadow-sm"
        >
          <SlidersHorizontal className="w-5 h-5" />
          Refine Search
        </Button>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm"
            >
              <Skeleton className="aspect-[4/3]" />
              <div className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-20 bg-destructive/5 rounded-[40px] border border-destructive/10">
          <p className="text-destructive font-bold text-lg mb-2">
            Failed to load restaurants
          </p>
          <p className="text-muted-foreground font-medium">
            Please try again later
          </p>
        </div>
      ) : filteredRestaurants?.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground font-bold text-xl mb-2">
            No restaurants found
          </p>
          <p className="text-muted-foreground font-medium">
            Try adjusting your search criteria
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {filteredRestaurants?.map((restaurant: any) => (
            <RestaurantCard
              key={restaurant.id}
              id={restaurant.id}
              name={restaurant.name}
              address={restaurant.address}
              rating={restaurant.rating || 4.5}
              tags={restaurant.tags || ["Restaurant"]}
              minOrder={restaurant.minOrder || 15}
              image={restaurant.image}
              deliveryTime={restaurant.deliveryTime || "20-35 min"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
