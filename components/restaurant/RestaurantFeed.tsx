"use client";

import { useState, useEffect, useCallback } from "react";
import { useRestaurants } from "@/lib/hooks/restaurant.hooks";
import { RestaurantCard } from "./RestaurantCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  X,
  Star,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import type { Restaurant } from "@/lib/api/types";

export function RestaurantFeed() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [cuisineType, setCuisineType] = useState<string | undefined>();
  const [priceRange, setPriceRange] = useState<string | undefined>();
  const [minRating, setMinRating] = useState<number | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 12;

  // Debounce search input - Requirement 3.8: 300ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1); // Reset to first page on search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch restaurants with filters - Requirements 3.8, 3.9, 3.10
  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = useRestaurants({
    page,
    limit,
    search: debouncedSearch || undefined,
    cuisineType,
    priceRange,
    rating: minRating,
  });

  const restaurants = response?.data || [];
  const pagination = response?.pagination;

  // Count active filters
  const activeFilterCount = [cuisineType, priceRange, minRating].filter(
    Boolean,
  ).length;

  // Clear all filters
  const clearFilters = useCallback(() => {
    setCuisineType(undefined);
    setPriceRange(undefined);
    setMinRating(undefined);
    setPage(1);
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [cuisineType, priceRange, minRating]);

  return (
    <div className="space-y-12">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search for restaurants, dishes, or cravings..."
            className="pl-12 h-14 bg-white/80 backdrop-blur-md border-gray-100 rounded-3xl text-lg font-medium shadow-sm transition-all focus:shadow-xl focus:shadow-primary/5 focus:ring-primary/20"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-14 px-8 rounded-3xl font-bold gap-3 border-gray-100 hover:border-primary hover:text-primary transition-all shadow-sm relative"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Refine Search
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-6" align="end">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">Filters</h3>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-xs"
                  >
                    Clear all
                  </Button>
                )}
              </div>

              {/* Cuisine Type Filter */}
              <div className="space-y-2">
                <Label htmlFor="cuisine" className="font-semibold">
                  Cuisine Type
                </Label>
                <Select value={cuisineType} onValueChange={setCuisineType}>
                  <SelectTrigger id="cuisine" className="rounded-2xl">
                    <SelectValue placeholder="All cuisines" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All cuisines</SelectItem>
                    <SelectItem value="Italian">Italian</SelectItem>
                    <SelectItem value="Chinese">Chinese</SelectItem>
                    <SelectItem value="Mexican">Mexican</SelectItem>
                    <SelectItem value="Japanese">Japanese</SelectItem>
                    <SelectItem value="Indian">Indian</SelectItem>
                    <SelectItem value="Thai">Thai</SelectItem>
                    <SelectItem value="American">American</SelectItem>
                    <SelectItem value="Mediterranean">Mediterranean</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="Korean">Korean</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-2">
                <Label htmlFor="price" className="font-semibold">
                  Price Range
                </Label>
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger id="price" className="rounded-2xl">
                    <SelectValue placeholder="Any price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any price</SelectItem>
                    <SelectItem value="1">$ - Budget friendly</SelectItem>
                    <SelectItem value="2">$$ - Moderate</SelectItem>
                    <SelectItem value="3">$$$ - Upscale</SelectItem>
                    <SelectItem value="4">$$$$ - Fine dining</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Rating Filter */}
              <div className="space-y-2">
                <Label htmlFor="rating" className="font-semibold">
                  Minimum Rating
                </Label>
                <Select
                  value={minRating?.toString()}
                  onValueChange={(value) =>
                    setMinRating(value === "all" ? undefined : Number(value))
                  }
                >
                  <SelectTrigger id="rating" className="rounded-2xl">
                    <SelectValue placeholder="Any rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any rating</SelectItem>
                    <SelectItem value="4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        4.0+ stars
                      </div>
                    </SelectItem>
                    <SelectItem value="4.5">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        4.5+ stars
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Apply Button */}
              <Button
                onClick={() => setShowFilters(false)}
                className="w-full rounded-2xl font-bold"
              >
                Apply Filters
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {cuisineType && cuisineType !== "all" && (
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              Cuisine: {cuisineType}
              <button
                onClick={() => setCuisineType(undefined)}
                className="hover:bg-primary/20 rounded-full p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {priceRange && priceRange !== "all" && (
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              Price: {"$".repeat(Number(priceRange))}
              <button
                onClick={() => setPriceRange(undefined)}
                className="hover:bg-primary/20 rounded-full p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {minRating && (
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              Rating: {minRating}+ stars
              <button
                onClick={() => setMinRating(undefined)}
                className="hover:bg-primary/20 rounded-full p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results - Requirement 22.1: Loading indicators */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
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
        <div className="text-center py-20 bg-destructive/5 rounded-[40px] border border-destructive/10">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <p className="text-destructive font-bold text-lg mb-2">
            Failed to load restaurants
          </p>
          <p className="text-muted-foreground font-medium mb-6">
            {error instanceof Error ? error.message : "Please try again later"}
          </p>
          <Button
            onClick={() => refetch()}
            className="rounded-2xl px-8 py-3 font-bold"
          >
            Try Again
          </Button>
        </div>
      ) : restaurants.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground font-bold text-xl mb-2">
            No restaurants found
          </p>
          <p className="text-muted-foreground font-medium">
            {debouncedSearch
              ? "Try adjusting your search criteria"
              : "No restaurants available at the moment"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {restaurants.map((restaurant: Restaurant) => (
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

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-8">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-2xl px-6 py-3 font-bold gap-2 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({pagination.total} total)
                </span>
              </div>

              <Button
                variant="outline"
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={page === pagination.totalPages}
                className="rounded-2xl px-6 py-3 font-bold gap-2 disabled:opacity-50"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
