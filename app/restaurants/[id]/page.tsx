"use client";

import { use, useState, useEffect } from "react";
import { MenuItemCard } from "@/components/restaurant/MenuItemCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, MapPin, ChevronLeft, Share2, Heart } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import MainLayout from "@/components/layout/MainLayout";

// Mock Data
interface MockItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
}

interface MockCategory {
  name: string;
  items: MockItem[];
}

const MOCK_RESTAURANT = {
  id: "1",
  name: "Gourmet Burger Kitchen",
  image:
    "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=2000&auto=format&fit=crop",
  priceRange: "$$",
  tags: ["Burgers", "American", "Fast Food"],
  rating: 4.8,
  reviewCount: 1240,
  deliveryTime: "20-30 min",
  address: "123 Main Street, New York, NY",
  categories: [
    {
      name: "Popular Items",
      items: [
        {
          id: "101",
          name: "Classic Cheeseburger",
          description:
            "Angus beef patty, cheddar cheese, lettuce, tomato, house sauce.",
          price: 12.99,
          image:
            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
        },
        {
          id: "102",
          name: "Bacon Double XL",
          description: "Two patties, crispy bacon, double cheese, BBQ sauce.",
          price: 16.5,
          image:
            "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400",
        },
        {
          id: "103",
          name: "Veggie Deluxe",
          description: "Plant-based patty, avocado, sprouts, vegan mayo.",
          price: 14.0,
          image:
            "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400",
        },
      ],
    },
    {
      name: "Sides",
      items: [
        {
          id: "201",
          name: "Crispy Fries",
          description: "Sea salt, rosemary.",
          price: 4.5,
        },
        {
          id: "202",
          name: "Onion Rings",
          description: "Beer battered onion rings with ranch dip.",
          price: 5.5,
        },
      ],
    },
    {
      name: "Drinks",
      items: [
        {
          id: "301",
          name: "Vanilla Shake",
          description: "Real vanilla bean ice cream.",
          price: 6.0,
        },
        { id: "302", name: "Cola", description: "Ice cold soda.", price: 2.5 },
      ],
    },
  ] as MockCategory[],
};

export default function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Use `use` to unwrap params in Next.js 16 (or await it if async component, but this is client component)
  // Actually in Next 15/16 client components `params` is a promise.
  const resolvedParams = use(params);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetch
    setTimeout(() => setLoading(false), 800);
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="h-75 w-full bg-gray-100 animate-pulse" />
        <div className="container mx-auto px-4 -mt-20 relative z-10 pb-20">
          <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Hero Header */}
      <div className="relative h-96 md:h-[500px] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: `url(${MOCK_RESTAURANT.image})` }}
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
          <Button
            variant="secondary"
            size="icon"
            className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/30 text-white backdrop-blur-xl border border-white/20 transition-all"
          >
            <Heart className="w-5 h-5" />
          </Button>
        </div>

        <div className="absolute bottom-12 left-12 right-12 text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest mb-6 shadow-2xl">
            Established Excellence
          </div>
          <h1 className="text-6xl md:text-8xl font-heading font-normal leading-tight tracking-tighter">
            {MOCK_RESTAURANT.name}
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
                    <span className="text-lg font-black">{MOCK_RESTAURANT.rating}</span>
                    <span className="text-sm font-bold opacity-40">({MOCK_RESTAURANT.reviewCount}+ reviews)</span>
                  </div>
                  <div className="h-8 w-px bg-gray-100 hidden md:block" />
                  <div className="flex gap-3">
                    {MOCK_RESTAURANT.tags.map(tag => (
                      <span key={tag} className="px-4 py-2 rounded-xl bg-gray-50 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Delivery</p>
                    <p className="font-bold text-secondary">{MOCK_RESTAURANT.deliveryTime}</p>
                  </div>
                </div>
              </div>

              {/* Menu Categories Navigation */}
              <div className="sticky top-20 bg-white/80 backdrop-blur-md z-20 -mx-8 md:-mx-12 px-8 md:px-12 py-6 flex gap-8 overflow-x-auto scrollbar-hide border-y border-gray-50">
                {MOCK_RESTAURANT.categories.map((cat, i) => (
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

              {/* Menu Items Grid */}
              <div className="pt-16 space-y-24">
                {MOCK_RESTAURANT.categories.map((cat, i) => (
                  <div key={cat.name} id={`category-${i}`} className="scroll-mt-48 space-y-10">
                    <div className="relative">
                      <h3 className="text-4xl font-heading text-secondary tracking-tight">
                        {cat.name}
                      </h3>
                      <div className="absolute -bottom-4 left-0 w-12 h-1 bg-primary/20 rounded-full" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {cat.items.map((item) => (
                        <MenuItemCard
                          key={item.id}
                          id={item.id}
                          name={item.name}
                          description={item.description}
                          price={item.price}
                          image={item.image}
                          restaurantId={MOCK_RESTAURANT.id}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-6 sticky top-24">
            <div className="bg-secondary p-10 rounded-[40px] text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-colors duration-700" />
              <div className="relative z-10 space-y-8">
                <div className="space-y-2 text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Estimated Arrival</p>
                  <p className="text-5xl font-heading italic text-primary">{MOCK_RESTAURANT.deliveryTime}</p>
                </div>
                <div className="h-px bg-white/10" />
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-white/60">
                    <span>Min selection</span>
                    <span className="text-white">$15.00</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-white/60">
                    <span>Concierge Fee</span>
                    <span className="text-primary italic">Complimentary</span>
                  </div>
                </div>
                <Button className="w-full h-16 rounded-2xl bg-white text-secondary hover:bg-primary hover:text-white text-lg font-black transition-all">
                  Start Order
                </Button>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-gray-100 space-y-6">
              <h4 className="text-xs font-black uppercase tracking-widest text-secondary">Location & Hour</h4>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-secondary" />
                </div>
                <p className="text-sm font-bold text-muted-foreground leading-relaxed">
                  {MOCK_RESTAURANT.address}
                </p>
              </div>
              <div className="pt-4 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-secondary" />
                </div>
                <div className="text-sm">
                  <p className="font-bold text-secondary">Open Today</p>
                  <p className="font-bold text-muted-foreground">10:00 AM - 11:00 PM</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
