"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useFavorites,
  useAddFavorite,
  useRemoveFavorite,
} from "@/lib/hooks/customer.hooks";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  restaurantId: string;
  variant?: "default" | "card" | "detail";
  className?: string;
}

export function FavoriteButton({
  restaurantId,
  variant = "default",
  className,
}: FavoriteButtonProps) {
  const { data: favorites = [] } = useFavorites();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const isFavorite = favorites.some((fav) => fav.id === restaurantId);
  const isLoading = addFavorite.isPending || removeFavorite.isPending;

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isFavorite) {
      removeFavorite.mutate(restaurantId);
    } else {
      addFavorite.mutate(restaurantId);
    }
  };

  // Card variant - small button for restaurant cards
  if (variant === "card") {
    return (
      <button
        onClick={handleToggleFavorite}
        disabled={isLoading}
        className={cn(
          "absolute top-6 left-6 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
          "bg-white/90 backdrop-blur-md shadow-lg hover:shadow-xl",
          "hover:scale-110 active:scale-95",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className,
        )}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart
          className={cn(
            "w-5 h-5 transition-all duration-300",
            isFavorite
              ? "fill-red-500 text-red-500"
              : "text-gray-600 hover:text-red-500",
          )}
        />
      </button>
    );
  }

  // Detail variant - larger button for detail page
  if (variant === "detail") {
    return (
      <Button
        onClick={handleToggleFavorite}
        disabled={isLoading}
        variant="secondary"
        size="icon"
        className={cn(
          "w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/30 text-white backdrop-blur-xl border border-white/20 transition-all",
          className,
        )}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart
          className={cn(
            "w-5 h-5 transition-all duration-300",
            isFavorite && "fill-red-500 text-red-500",
          )}
        />
      </Button>
    );
  }

  // Default variant
  return (
    <Button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      variant="outline"
      size="icon"
      className={cn(
        "rounded-full transition-all duration-300",
        "hover:scale-110 active:scale-95",
        className,
      )}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={cn(
          "w-5 h-5 transition-all duration-300",
          isFavorite
            ? "fill-red-500 text-red-500"
            : "text-gray-600 hover:text-red-500",
        )}
      />
    </Button>
  );
}
