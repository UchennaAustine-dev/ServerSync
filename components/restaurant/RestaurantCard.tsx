"use client";

import { Star, Clock, MapPin } from "lucide-react";
import Link from "next/link";

interface RestaurantCardProps {
  id: string;
  name: string;
  image?: string;
  rating?: number;
  deliveryTime?: string;
  minOrder?: number;
  tags?: string[];
  address?: string;
}

export function RestaurantCard({
  id,
  name,
  image,
  rating = 4.5,
  deliveryTime = "25-35 min",
  minOrder = 10,
  tags = ["Restaurant"],
  address = "Local area",
}: RestaurantCardProps) {
  return (
    <Link href={`/restaurants/${id}`} className="group block">
      <article className="bg-white/60 backdrop-blur-2xl rounded-[40px] border border-gray-100 overflow-hidden transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] hover:border-primary/10 hover:-translate-y-3 active:scale-[0.98]">
        {/* Image Section */}
        <div className="relative aspect-[4/5] bg-muted overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-orange-50 to-rose-50">
              <span className="text-6xl opacity-30 grayscale group-hover:grayscale-0 transition-all duration-500">🍽️</span>
            </div>
          )}

          {/* Luxury Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-secondary/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
          
          {/* Rating badge */}
          <div className="absolute top-6 right-6">
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
              <Star className="w-4 h-4 fill-primary text-primary" />
              <span className="text-sm font-black text-secondary tracking-tighter">{rating}</span>
            </div>
          </div>

          <div className="absolute bottom-6 left-6 right-6 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
            <h3 className="text-3xl font-heading text-white leading-tight mb-2 drop-shadow-lg">
              {name}
            </h3>
            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100">
              <div className="flex gap-2">
                {tags.slice(0, 1).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-lg bg-primary/20 backdrop-blur-md text-[9px] font-black text-white uppercase tracking-widest border border-white/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <span className="w-1 h-1 rounded-full bg-white/40" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">{deliveryTime}</span>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate max-w-[140px]">{address}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-secondary/5 text-[9px] font-black text-secondary uppercase tracking-widest">
              From ${minOrder}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
