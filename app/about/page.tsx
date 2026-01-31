"use client";

import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Users, Zap, Heart, ArrowRight, ChevronRight } from "lucide-react";
import Link from "next/link";

const stats = [
  { label: "Active Restaurants", value: "500+" },
  { label: "Happy Customers", value: "50K+" },
  { label: "Orders Delivered", value: "200K+" },
  { label: "Cities Covered", value: "12" },
];

const values = [
  {
    icon: Zap,
    title: "Speed & Reliability",
    description:
      "We optimize every step of the delivery process to get food to you while it is still hot.",
  },
  {
    icon: Users,
    title: "Community First",
    description:
      "We partner with local restaurants to support small businesses and bring authentic flavors to your door.",
  },
  {
    icon: Heart,
    title: "Quality Experience",
    description:
      "From seamless ordering to real-time tracking, we obsess over every detail of your experience.",
  },
];

export default function AboutPage() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 rounded-bl-[200px] -z-10" />
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -z-10" />

        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/5 text-secondary text-[10px] font-black uppercase tracking-widest">
              The ServeSync Story
            </div>
            <h1 className="text-6xl md:text-8xl font-heading text-secondary leading-[0.9] tracking-tighter">
              Epicurean <br/><span className="italic text-primary">Excellence.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed max-w-lg">
              Born from a passion for gastronomy and technology, ServeSync connects the world's most discerning palates with the finest local culinary artisans.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button asChild size="lg" className="h-16 px-10 rounded-2xl text-lg font-black shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                <Link href="/restaurants">Explore Menus</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-16 px-10 rounded-2xl text-lg font-black border-gray-100 hover:bg-gray-50 transition-all">
                <Link href="/register">Partner with Us</Link>
              </Button>
            </div>
          </div>
          <div className="relative group animate-in fade-in zoom-in duration-1000 delay-300">
            <div className="absolute -inset-4 bg-linear-to-br from-primary/20 to-secondary/20 rounded-[50px] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
            <img 
              src="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1000&auto=format&fit=crop" 
              alt="Luxury Dining" 
              className="relative w-full h-[500px] object-cover rounded-[40px] shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]"
            />
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-20 items-center">
            <div className="lg:w-1/3 text-center lg:text-left space-y-6">
              <h2 className="text-4xl md:text-5xl font-heading text-secondary tracking-tight">Our <span className="italic text-primary">Philosophy.</span></h2>
              <p className="text-muted-foreground font-medium leading-relaxed">
                We believe that dining is more than just sustenance—it's an experience, a memory, and a craft.
              </p>
            </div>
            <div className="lg:w-2/3 grid sm:grid-cols-3 gap-8">
              {values.map((value, i) => {
                const Icon = value.icon;
                return (
                  <div key={value.title} className="p-8 rounded-[32px] bg-gray-50/50 border border-gray-100 space-y-6 hover:-translate-y-2 transition-transform duration-500">
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-xl shadow-secondary/5 flex items-center justify-center text-primary">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-heading text-secondary mb-3">{value.title}</h3>
                      <p className="text-xs font-bold text-muted-foreground leading-relaxed uppercase tracking-widest opacity-60">
                        {value.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-24 relative overflow-hidden bg-secondary text-white">
        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center space-y-2">
                <p className="text-5xl md:text-6xl font-heading text-primary italic tracking-tight">{stat.value}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Statement */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 text-center max-w-4xl space-y-12">
          <div className="w-px h-24 bg-linear-to-b from-primary to-transparent mx-auto" />
          <h2 className="text-4xl md:text-7xl font-heading text-secondary leading-tight tracking-tighter">
            "We aren't just delivering food; we are <span className="italic text-primary">curating moments</span> of joy and refined satisfaction."
          </h2>
          <div className="space-y-4">
            <p className="text-sm font-black uppercase tracking-[0.4em] text-muted-foreground">The ServeSync Vision</p>
            <Button asChild variant="ghost" className="hover:text-primary font-black uppercase tracking-widest group">
              <Link href="/restaurants" className="flex items-center gap-2">
                Begin Your Journey <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
