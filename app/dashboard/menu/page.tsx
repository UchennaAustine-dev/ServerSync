"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  TrendingUp,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useAuthStore } from "@/lib/store/auth.store";
import {
  useRestaurantMenu,
  useCreateMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
  useUploadMenuItemImage,
} from "@/lib/hooks/restaurant.hooks";
import { MenuItemForm } from "@/components/restaurant/MenuItemForm";
import { DeleteMenuItemDialog } from "@/components/restaurant/DeleteMenuItemDialog";
import type { MenuItem, CreateMenuItemRequest } from "@/lib/api/types";
import { toast } from "@/lib/utils/toast";

export default function MenuManagementPage() {
  const { user } = useAuthStore();
  const restaurantId = user?.restaurantId || "";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);

  // Fetch menu data
  const { data: menuData, isLoading, error } = useRestaurantMenu(restaurantId);

  // Mutations
  const createMutation = useCreateMenuItem(restaurantId);
  const updateMutation = useUpdateMenuItem(restaurantId);
  const deleteMutation = useDeleteMenuItem(restaurantId);
  const uploadImageMutation = useUploadMenuItemImage(restaurantId);

  const menuItems = menuData?.items || [];
  const categories = useMemo(() => {
    return ["all", ...(menuData?.categories || [])];
  }, [menuData?.categories]);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchQuery, selectedCategory]);

  const stats = useMemo(() => {
    return {
      totalItems: menuItems.length,
      available: menuItems.filter((i) => i.isAvailable).length,
      unavailable: menuItems.filter((i) => !i.isAvailable).length,
      avgPrice:
        menuItems.length > 0
          ? menuItems.reduce((sum, i) => sum + i.price, 0) / menuItems.length
          : 0,
    };
  }, [menuItems]);

  // Handlers
  const handleCreateItem = async (
    data: CreateMenuItemRequest,
    imageFile?: File,
  ) => {
    try {
      const newItem = await createMutation.mutateAsync(data);

      // Upload image if provided
      if (imageFile && newItem.id) {
        try {
          await uploadImageMutation.mutateAsync({
            itemId: newItem.id,
            file: imageFile,
          });
          toast.success("Menu item created with image successfully");
        } catch (imageError) {
          toast.warning(
            "Menu item created but image upload failed. You can add it later.",
          );
        }
      } else {
        toast.success("Menu item created successfully");
      }

      setIsCreateOpen(false);
    } catch (error) {
      toast.error("Failed to create menu item");
    }
  };

  const handleUpdateItem = async (
    data: CreateMenuItemRequest,
    imageFile?: File,
  ) => {
    if (!editingItem) return;

    try {
      await updateMutation.mutateAsync({
        itemId: editingItem.id,
        data,
      });

      // Upload image if provided
      if (imageFile) {
        try {
          await uploadImageMutation.mutateAsync({
            itemId: editingItem.id,
            file: imageFile,
          });
          toast.success("Menu item updated with image successfully");
        } catch (imageError) {
          toast.warning(
            "Menu item updated but image upload failed. Please try again.",
          );
        }
      } else {
        toast.success("Menu item updated successfully");
      }

      setEditingItem(null);
    } catch (error) {
      toast.error("Failed to update menu item");
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await updateMutation.mutateAsync({
        itemId: item.id,
        data: { isAvailable: !item.isAvailable },
      });
      toast.success(
        `Item marked as ${!item.isAvailable ? "available" : "unavailable"}`,
      );
    } catch (error) {
      // Error toast is shown, optimistic update is automatically rolled back
      toast.error("Failed to update availability");
    }
  };

  const handleDeleteItem = async () => {
    if (!deletingItem) return;

    try {
      await deleteMutation.mutateAsync(deletingItem.id);
      toast.success("Menu item deleted successfully");
      setDeletingItem(null);
    } catch (error) {
      toast.error("Failed to delete menu item");
    }
  };

  if (!restaurantId) {
    return (
      <DashboardLayout>
        <Card className="p-12 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="font-heading font-semibold text-lg mb-2">
            No Restaurant Found
          </h3>
          <p className="text-muted-foreground">
            You need to be associated with a restaurant to manage menu items.
          </p>
        </Card>
      </DashboardLayout>
    );
  }

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
          <Button onClick={() => setIsCreateOpen(true)} disabled={isLoading}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-20" />
            </Card>
          ))}
        </div>
      ) : (
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
                <EyeOff className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold">
                  {stats.unavailable}
                </p>
                <p className="text-xs text-muted-foreground">Unavailable</p>
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
      )}

      {/* Error State */}
      {error && (
        <Card className="p-6 mb-6 border-destructive">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <div>
              <h3 className="font-semibold text-destructive">
                Failed to load menu
              </h3>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : "An error occurred"}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search menu items..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isLoading}
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
              disabled={isLoading}
            >
              {category === "all" ? "All" : category}
            </Button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-24" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {item.image ? (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-linear-to-br from-orange-50 to-rose-50 flex items-center justify-center text-3xl shrink-0">
                    🍜
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-heading font-semibold text-lg">
                          {item.name}
                        </h3>
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
                            item.isAvailable ? "text-green-600" : "text-red-600"
                          }
                        >
                          {item.isAvailable ? "Available" : "Unavailable"}
                        </span>
                        {item.allergens && item.allergens.length > 0 && (
                          <>
                            <span>•</span>
                            <span>Allergens: {item.allergens.join(", ")}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-heading font-bold text-primary">
                        ${item.price.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.preparationTime} min
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingItem(item)}
                      disabled={updateMutation.isPending}
                    >
                      <Edit className="w-3 h-3 mr-2" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className={
                        item.isAvailable
                          ? ""
                          : "border-green-200 text-green-700 hover:bg-green-50"
                      }
                      onClick={() => handleToggleAvailability(item)}
                      disabled={updateMutation.isPending}
                    >
                      {item.isAvailable ? (
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
                      onClick={() => setDeletingItem(item)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-3 h-3 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {filteredItems.length === 0 && !isLoading && (
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
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Item
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* Create Menu Item Sheet */}
      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle>Add Menu Item</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <MenuItemForm
              onSubmit={handleCreateItem}
              onCancel={() => setIsCreateOpen(false)}
              isLoading={createMutation.isPending}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Menu Item Sheet */}
      <Sheet open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle>Edit Menu Item</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {editingItem && (
              <MenuItemForm
                initialData={editingItem}
                onSubmit={handleUpdateItem}
                onCancel={() => setEditingItem(null)}
                isLoading={updateMutation.isPending}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      {deletingItem && (
        <DeleteMenuItemDialog
          isOpen={!!deletingItem}
          onClose={() => setDeletingItem(null)}
          onConfirm={handleDeleteItem}
          itemName={deletingItem.name}
          isLoading={deleteMutation.isPending}
        />
      )}
    </DashboardLayout>
  );
}
