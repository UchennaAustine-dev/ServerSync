"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { useState } from "react";

// Mock menu data
const mockMenuItems = [
  {
    id: "1",
    name: "Kung Pao Chicken",
    category: "Main Course",
    price: 14.5,
    description: "Spicy stir-fried chicken with peanuts and vegetables",
    available: true,
    popular: true,
  },
  {
    id: "2",
    name: "Fried Rice",
    category: "Rice & Noodles",
    price: 8.0,
    description: "Classic egg fried rice with vegetables",
    available: true,
    popular: false,
  },
  {
    id: "3",
    name: "Spring Rolls",
    category: "Appetizers",
    price: 6.5,
    description: "Crispy vegetable spring rolls (4 pieces)",
    available: true,
    popular: true,
  },
  {
    id: "4",
    name: "Sweet & Sour Pork",
    category: "Main Course",
    price: 13.5,
    description: "Tender pork in tangy sweet and sour sauce",
    available: false,
    popular: false,
  },
  {
    id: "5",
    name: "Wonton Soup",
    category: "Soups",
    price: 7.0,
    description: "Homemade wontons in clear broth",
    available: true,
    popular: false,
  },
  {
    id: "6",
    name: "General Tso's Chicken",
    category: "Main Course",
    price: 15.0,
    description: "Crispy chicken in spicy-sweet sauce",
    available: true,
    popular: true,
  },
];

export default function MenuManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    "all",
    ...Array.from(new Set(mockMenuItems.map((item) => item.category))),
  ];

  const filteredItems = mockMenuItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    totalItems: mockMenuItems.length,
    available: mockMenuItems.filter((i) => i.available).length,
    popular: mockMenuItems.filter((i) => i.popular).length,
    avgPrice:
      mockMenuItems.reduce((sum, i) => sum + i.price, 0) / mockMenuItems.length,
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-secondary mb-2">
              Menu Management
            </h1>
            <p className="text-muted-foreground">
              Manage your restaurant's menu items
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <span className="text-xl">🍽️</span>
            </div>
            <div>
              <p className="text-2xl font-heading font-bold">
                {stats.totalItems}
              </p>
              <p className="text-xs text-muted-foreground">Total Items</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold">
                {stats.available}
              </p>
              <p className="text-xs text-muted-foreground">Available</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold">{stats.popular}</p>
              <p className="text-xs text-muted-foreground">Popular Items</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold">
                ${stats.avgPrice.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">Avg Price</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search menu items..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="shrink-0"
            >
              {category === "all" ? "All" : category}
            </Button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-3">
        {filteredItems.map((item) => (
          <Card key={item.id} className="p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-xl bg-linear-to-br from-orange-50 to-rose-50 flex items-center justify-center text-3xl shrink-0">
                🍜
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading font-semibold text-lg">
                        {item.name}
                      </h3>
                      {item.popular && (
                        <Badge className="bg-orange-50 text-orange-700 border-orange-200">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="font-normal">
                        {item.category}
                      </Badge>
                      <span>•</span>
                      <span
                        className={
                          item.available ? "text-green-600" : "text-red-600"
                        }
                      >
                        {item.available ? "Available" : "Unavailable"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-heading font-bold text-primary">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <Button size="sm" variant="outline">
                    <Edit className="w-3 h-3 mr-2" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className={
                      item.available
                        ? ""
                        : "border-green-200 text-green-700 hover:bg-green-50"
                    }
                  >
                    {item.available ? (
                      <>
                        <EyeOff className="w-3 h-3 mr-2" />
                        Mark Unavailable
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3 mr-2" />
                        Mark Available
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {filteredItems.length === 0 && (
          <Card className="p-12 text-center">
            <span className="text-6xl mb-4 block">🍽️</span>
            <h3 className="font-heading font-semibold text-lg mb-2">
              No items found
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? "Try adjusting your search"
                : "Start by adding items to your menu"}
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add First Item
            </Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
