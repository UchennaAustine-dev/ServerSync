"use client";

import { RestaurantFeed } from "@/components/restaurant/RestaurantFeed";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Clock, Star, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import MainLayout from "@/components/layout/MainLayout";

const categories = [
  { name: "Pizza", emoji: "🍕" },
  { name: "Burgers", emoji: "🍔" },
  { name: "Sushi", emoji: "🍣" },
  { name: "Mexican", emoji: "🌮" },
  { name: "Chinese", emoji: "🥡" },
  { name: "Indian", emoji: "🍛" },
  { name: "Desserts", emoji: "🍰" },
  { name: "Healthy", emoji: "🥗" },
];

const features = [
  {
    icon: Clock,
    title: "Fast Delivery",
    description: "Average delivery in under 30 minutes",
  },
  {
    icon: Star,
    title: "Top Rated",
    description: "Only restaurants with 4+ star ratings",
  },
  {
    icon: MapPin,
    title: "Live Tracking",
    description: "Know exactly where your order is",
  },
];

export default function Home() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-white">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-bl from-orange-50/50 to-transparent rounded-bl-[100px] -z-10" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse-subtle" />
        
        <div className="container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-10">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-orange-100/50 text-sm font-semibold text-primary animate-bounce-in">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                  </span>
                  <span>Now serving Manhattan & Brooklyn</span>
                </div>

                <h1 className="text-6xl md:text-8xl font-heading text-secondary leading-[0.9] tracking-tighter">
                  Luxury <br />
                  <span className="italic text-primary">Delivered.</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed font-medium">
                  Experience a curated selection of the finest culinary treasures, delivered with surgical precision to your doorstep.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="h-14 px-8 text-lg font-bold shadow-2xl shadow-primary/20 hover:scale-105 transition-transform"
                >
                  <Link href="/restaurants">
                    Explore Menu
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 text-lg font-bold bg-white/50 backdrop-blur-md hover:bg-white border-gray-200"
                >
                  <Link href="/about">Our Story</Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-12 pt-8 border-t border-gray-100">
                <div>
                  <p className="text-3xl font-heading font-black text-secondary">50k+</p>
                  <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">Happy Foodies</p>
                </div>
                <div>
                  <p className="text-3xl font-heading font-black text-secondary">4.9/5</p>
                  <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">Average Rating</p>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative hidden lg:block">
              <div className="relative w-full aspect-square max-w-[600px] ml-auto">
                {/* Main Image Container */}
                <div className="absolute inset-0 rounded-[40px] bg-linear-to-br from-orange-100 to-rose-100 overflow-hidden shadow-2xl rotate-3 group">
                   <div className="absolute inset-0 -rotate-3 transition-transform duration-1000 group-hover:scale-110">
                    <img 
                      src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2000&auto=format&fit=crop" 
                      alt="Fine Dining"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-secondary/40 to-transparent" />
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -left-12 top-1/4 animate-float [animation-delay:0.5s]">
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-5 border border-white/50 w-64">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-secondary text-sm">Lightning Fast</p>
                        <p className="text-xs text-muted-foreground font-medium">Under 25 mins</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-8 bottom-1/4 animate-float [animation-delay:1s]">
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-5 border border-white/50">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="w-10 h-10 rounded-full bg-linear-to-br from-orange-200 to-rose-200 border-4 border-white shadow-sm" />
                        ))}
                      </div>
                      <div className="ml-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-primary text-primary" />
                          <span className="font-bold text-secondary">4.9</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">Community Choice</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Categories */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-heading text-secondary mb-3">
                Crave it? <span className="italic text-primary">Find it.</span>
              </h2>
              <p className="text-muted-foreground font-medium text-lg">
                Explore a world of flavors curated just for your mood.
              </p>
            </div>
            <Link
              href="/restaurants"
              className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all"
            >
              Discover all cuisines <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.slice(0, 8).map((cat, i) => (
              <Link
                key={cat.name}
                href={`/restaurants?cuisine=${cat.name.toLowerCase()}`}
                className={`group relative overflow-hidden rounded-3xl p-6 transition-all duration-500 hover:scale-[1.02] active:scale-95 ${
                  i === 0 || i === 7 ? "md:col-span-2 bg-orange-50" : "bg-gray-50"
                }`}
              >
                <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                  <span className="text-4xl md:text-5xl group-hover:scale-110 transition-transform duration-500">
                    {cat.emoji}
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-secondary group-hover:text-primary transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wider mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Browse Menu →
                    </p>
                  </div>
                </div>
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Restaurant Feed */}
      <section className="py-24 bg-gray-50/50 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-gray-200 to-transparent" />
        
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-heading font-black text-secondary">
                Popular <span className="text-primary luxury-text">Near You</span>
              </h2>
              <p className="text-muted-foreground font-medium text-lg">
                The absolute best spots, vetted by our community.
              </p>
            </div>
            <Button asChild variant="outline" className="h-12 px-6 rounded-full font-bold border-gray-200 hover:border-primary hover:text-primary transition-all group">
              <Link href="/restaurants">
                View everything
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
          <RestaurantFeed />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="relative rounded-[40px] bg-secondary p-12 md:p-20 overflow-hidden">
            {/* Abstract Background for CTA */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-bl from-primary/20 to-transparent -z-0" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-0" />

            <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-white leading-tight">
                Hungry? Let's <br />
                <span className="text-primary italic">fix that.</span>
              </h2>
              <p className="text-white/70 text-lg md:text-xl font-medium max-w-md mx-auto">
                Join our community of food enthusiasts and discover your next favorite meal today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button asChild size="lg" className="h-14 px-10 text-lg font-bold">
                  <Link href="/restaurants">Start Ordering</Link>
                </Button>
                <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="h-14 px-10 text-lg font-bold bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-md"
                >
                  <Link href="/register">Create Account</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
