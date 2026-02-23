import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MenuItem } from "../api/types/restaurant.types";

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
  image?: string;
  specialInstructions?: string;
  isAvailable: boolean;
}

export interface CartValidationResult {
  valid: boolean;
  unavailableItems: string[];
  priceChangedItems: Array<{
    name: string;
    oldPrice: number;
    newPrice: number;
  }>;
  removedItems: string[];
}

export interface CartState {
  items: CartItem[];
  restaurantId: string | null;

  // Actions
  addToCart: (item: CartItem) => void;
  removeFromCart: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  updateSpecialInstructions: (menuItemId: string, instructions: string) => void;
  clearCart: () => void;
  validateCart: (menuItems: MenuItem[]) => CartValidationResult;
  syncWithMenu: (menuItems: MenuItem[]) => CartValidationResult;
  removeUnavailableItems: (menuItems: MenuItem[]) => string[];

  // Computed
  getTotal: () => number;
  getSubtotal: () => number;
  getItemCount: () => number;
  canAddItem: (restaurantId: string) => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,

      addToCart: (item) => {
        const { items, restaurantId } = get();

        // If cart has items from different restaurant, clear it first
        if (restaurantId && restaurantId !== item.restaurantId) {
          set({
            items: [item],
            restaurantId: item.restaurantId,
          });
          return;
        }

        // Check if item already exists
        const existingIndex = items.findIndex(
          (i) => i.menuItemId === item.menuItemId,
        );

        if (existingIndex >= 0) {
          // Update quantity of existing item
          const updatedItems = [...items];
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            quantity: updatedItems[existingIndex].quantity + item.quantity,
          };
          set({ items: updatedItems });
        } else {
          // Add new item
          set({
            items: [...items, item],
            restaurantId: item.restaurantId,
          });
        }
      },

      removeFromCart: (menuItemId) => {
        const items = get().items.filter((i) => i.menuItemId !== menuItemId);
        set({
          items,
          restaurantId: items.length > 0 ? get().restaurantId : null,
        });
      },

      updateQuantity: (menuItemId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(menuItemId);
          return;
        }

        set({
          items: get().items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, quantity } : i,
          ),
        });
      },

      updateSpecialInstructions: (menuItemId, instructions) => {
        set({
          items: get().items.map((i) =>
            i.menuItemId === menuItemId
              ? { ...i, specialInstructions: instructions }
              : i,
          ),
        });
      },

      clearCart: () => {
        set({ items: [], restaurantId: null });
      },

      validateCart: (menuItems) => {
        const { items } = get();
        const unavailableItems: string[] = [];
        const priceChangedItems: Array<{
          name: string;
          oldPrice: number;
          newPrice: number;
        }> = [];
        const removedItems: string[] = [];

        items.forEach((cartItem) => {
          const menuItem = menuItems.find((m) => m.id === cartItem.menuItemId);

          if (!menuItem) {
            // Item no longer exists in menu
            removedItems.push(cartItem.name);
          } else if (!menuItem.isAvailable) {
            // Item exists but is unavailable
            unavailableItems.push(cartItem.name);
          } else if (menuItem.price !== cartItem.price) {
            // Price has changed
            priceChangedItems.push({
              name: cartItem.name,
              oldPrice: cartItem.price,
              newPrice: menuItem.price,
            });
          }
        });

        return {
          valid: unavailableItems.length === 0 && removedItems.length === 0,
          unavailableItems,
          priceChangedItems,
          removedItems,
        };
      },

      syncWithMenu: (menuItems) => {
        const { items } = get();
        const unavailableItems: string[] = [];
        const priceChangedItems: Array<{
          name: string;
          oldPrice: number;
          newPrice: number;
        }> = [];
        const removedItems: string[] = [];
        const updatedItems: CartItem[] = [];

        items.forEach((cartItem) => {
          const menuItem = menuItems.find((m) => m.id === cartItem.menuItemId);

          if (!menuItem) {
            // Item no longer exists - will be removed
            removedItems.push(cartItem.name);
          } else if (!menuItem.isAvailable) {
            // Item unavailable - will be removed
            unavailableItems.push(cartItem.name);
          } else {
            // Item exists and is available
            if (menuItem.price !== cartItem.price) {
              // Track price change
              priceChangedItems.push({
                name: cartItem.name,
                oldPrice: cartItem.price,
                newPrice: menuItem.price,
              });
              // Update with new price
              updatedItems.push({
                ...cartItem,
                price: menuItem.price,
                isAvailable: true,
              });
            } else {
              // No changes needed
              updatedItems.push({
                ...cartItem,
                isAvailable: true,
              });
            }
          }
        });

        // Update cart with synced items
        set({
          items: updatedItems,
          restaurantId: updatedItems.length > 0 ? get().restaurantId : null,
        });

        return {
          valid: unavailableItems.length === 0 && removedItems.length === 0,
          unavailableItems,
          priceChangedItems,
          removedItems,
        };
      },

      removeUnavailableItems: (menuItems) => {
        const { items } = get();
        const removedItemNames: string[] = [];
        const validItems: CartItem[] = [];

        items.forEach((cartItem) => {
          const menuItem = menuItems.find((m) => m.id === cartItem.menuItemId);

          if (menuItem && menuItem.isAvailable) {
            // Keep item and update price if needed
            validItems.push({
              ...cartItem,
              price: menuItem.price,
              isAvailable: true,
            });
          } else {
            // Remove item
            removedItemNames.push(cartItem.name);
          }
        });

        // Update cart with only valid items
        set({
          items: validItems,
          restaurantId: validItems.length > 0 ? get().restaurantId : null,
        });

        return removedItemNames;
      },

      getTotal: () => {
        return get().items.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0,
        );
      },

      getSubtotal: () => {
        return get().getTotal();
      },

      getItemCount: () => {
        return get().items.reduce((acc, item) => acc + item.quantity, 0);
      },

      canAddItem: (restaurantId) => {
        const currentRestaurantId = get().restaurantId;
        return !currentRestaurantId || currentRestaurantId === restaurantId;
      },
    }),
    {
      name: "cart-storage",
    },
  ),
);
