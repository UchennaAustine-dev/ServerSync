"use client";

import { useCartStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Image from "next/image";

interface MenuItemProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  restaurantId: string;
}

export function MenuItemCard({
  id,
  name,
  description,
  price,
  image,
  restaurantId,
}: MenuItemProps) {
  const { addToCart } = useCartStore();

  const handleAdd = () => {
    addToCart({
      id,
      name,
      price,
      quantity: 1,
      restaurantId,
      image,
    });
  };

  return (
    <Card className="flex flex-row overflow-hidden border-gray-100 bg-white/60 backdrop-blur-xl rounded-[32px] transition-all duration-700 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 group relative">
      <div className="flex-1 p-8 flex flex-col justify-between relative z-10">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <h4 className="text-2xl font-heading text-secondary leading-tight group-hover:text-primary transition-colors duration-500">
              {name}
            </h4>
          </div>
          <p className="text-muted-foreground text-sm font-medium line-clamp-2 leading-relaxed opacity-70">
            {description}
          </p>
        </div>
        <div className="flex items-center justify-between mt-8">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1">A la carte</span>
            <span className="text-2xl font-heading font-normal text-secondary tabular-nums">
              ${price.toFixed(2)}
            </span>
          </div>
          <Button
            size="icon"
            onClick={handleAdd}
            className="rounded-2xl w-14 h-14 shadow-2xl shadow-primary/20 hover:scale-110 active:scale-95 transition-all bg-secondary text-white hover:bg-primary"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      </div>
      {image && (
        <div className="w-48 h-full relative overflow-hidden bg-gray-50 shrink-0">
          <div
            className="w-full h-full bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
            style={{ backgroundImage: `url(${image})` }}
          />
          <div className="absolute inset-0 bg-linear-to-r from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
    </Card>
  );
}
