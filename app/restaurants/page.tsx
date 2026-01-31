"use client";

import MainLayout from "@/components/layout/MainLayout";
import { RestaurantFeed } from "@/components/restaurant/RestaurantFeed";

export default function RestaurantsPage() {
  return (
    <MainLayout>
      <section className="py-20 relative overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-linear-to-bl from-primary/5 to-transparent rounded-bl-full -z-10" />
        
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Curated for you
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-secondary mb-6 leading-tight">
              The Best <span className="text-primary italic">Local Spots.</span>
            </h1>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed">
              From secret gems to neighborhood favorites, find your next unforgettable meal here. 
              Always fresh, always fast.
            </p>
          </div>
          <RestaurantFeed />
        </div>
      </section>
    </MainLayout>
  );
}
