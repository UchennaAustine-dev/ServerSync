/**
 * Cart Store Tests
 * Tests cart validation, syncing, and persistence
 */

import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "../cart.store";
import type { MenuItem } from "../../api/types/restaurant.types";

describe("Cart Store", () => {
  beforeEach(() => {
    // Clear cart before each test and reset state completely
    const state = useCartStore.getState();
    state.clearCart();
    // Force a fresh state by clearing localStorage
    localStorage.clear();
  });

  describe("addToCart", () => {
    it("should add item to empty cart", () => {
      const store = useCartStore.getState();

      store.addToCart({
        menuItemId: "item1",
        name: "Burger",
        price: 10.99,
        quantity: 1,
        restaurantId: "rest1",
        restaurantName: "Test Restaurant",
        isAvailable: true,
      });

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].name).toBe("Burger");
    });

    it("should update quantity if item already exists", () => {
      const store = useCartStore.getState();

      const item = {
        menuItemId: "item1",
        name: "Burger",
        price: 10.99,
        quantity: 1,
        restaurantId: "rest1",
        restaurantName: "Test Restaurant",
        isAvailable: true,
      };

      store.addToCart(item);
      store.addToCart(item);

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(2);
    });

    it("should clear cart when adding item from different restaurant", () => {
      const store = useCartStore.getState();

      store.addToCart({
        menuItemId: "item1",
        name: "Burger",
        price: 10.99,
        quantity: 1,
        restaurantId: "rest1",
        restaurantName: "Restaurant 1",
        isAvailable: true,
      });

      store.addToCart({
        menuItemId: "item2",
        name: "Pizza",
        price: 15.99,
        quantity: 1,
        restaurantId: "rest2",
        restaurantName: "Restaurant 2",
        isAvailable: true,
      });

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].name).toBe("Pizza");
      expect(items[0].restaurantId).toBe("rest2");
    });
  });

  describe("validateCart", () => {
    it("should detect unavailable items", () => {
      const store = useCartStore.getState();

      store.addToCart({
        menuItemId: "item1",
        name: "Burger",
        price: 10.99,
        quantity: 1,
        restaurantId: "rest1",
        restaurantName: "Test Restaurant",
        isAvailable: true,
      });

      const menuItems: MenuItem[] = [
        {
          id: "item1",
          restaurantId: "rest1",
          name: "Burger",
          description: "Test burger",
          price: 10.99,
          category: "Main",
          isAvailable: false, // Item is now unavailable
          preparationTime: 15,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const result = store.validateCart(menuItems);

      expect(result.valid).toBe(false);
      expect(result.unavailableItems).toContain("Burger");
    });

    it("should detect price changes", () => {
      const store = useCartStore.getState();

      store.addToCart({
        menuItemId: "item1",
        name: "Burger",
        price: 10.99,
        quantity: 1,
        restaurantId: "rest1",
        restaurantName: "Test Restaurant",
        isAvailable: true,
      });

      const menuItems: MenuItem[] = [
        {
          id: "item1",
          restaurantId: "rest1",
          name: "Burger",
          description: "Test burger",
          price: 12.99, // Price changed
          category: "Main",
          isAvailable: true,
          preparationTime: 15,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const result = store.validateCart(menuItems);

      expect(result.priceChangedItems).toHaveLength(1);
      expect(result.priceChangedItems[0].oldPrice).toBe(10.99);
      expect(result.priceChangedItems[0].newPrice).toBe(12.99);
    });

    it("should detect removed items", () => {
      const store = useCartStore.getState();

      store.addToCart({
        menuItemId: "item1",
        name: "Burger",
        price: 10.99,
        quantity: 1,
        restaurantId: "rest1",
        restaurantName: "Test Restaurant",
        isAvailable: true,
      });

      const menuItems: MenuItem[] = []; // Item no longer in menu

      const result = store.validateCart(menuItems);

      expect(result.valid).toBe(false);
      expect(result.removedItems).toContain("Burger");
    });
  });

  describe("syncWithMenu", () => {
    it("should update prices and remove unavailable items", () => {
      const store = useCartStore.getState();

      store.addToCart({
        menuItemId: "item1",
        name: "Burger",
        price: 10.99,
        quantity: 1,
        restaurantId: "rest1",
        restaurantName: "Test Restaurant",
        isAvailable: true,
      });

      store.addToCart({
        menuItemId: "item2",
        name: "Pizza",
        price: 15.99,
        quantity: 1,
        restaurantId: "rest1",
        restaurantName: "Test Restaurant",
        isAvailable: true,
      });

      const menuItems: MenuItem[] = [
        {
          id: "item1",
          restaurantId: "rest1",
          name: "Burger",
          description: "Test burger",
          price: 12.99, // Price changed
          category: "Main",
          isAvailable: true,
          preparationTime: 15,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        // item2 (Pizza) is not in menu anymore
      ];

      const result = store.syncWithMenu(menuItems);

      expect(result.priceChangedItems).toHaveLength(1);
      expect(result.removedItems).toContain("Pizza");

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].price).toBe(12.99); // Price updated
    });
  });

  describe("removeUnavailableItems", () => {
    it("should remove unavailable items and keep available ones", () => {
      const store = useCartStore.getState();

      store.addToCart({
        menuItemId: "item1",
        name: "Burger",
        price: 10.99,
        quantity: 1,
        restaurantId: "rest1",
        restaurantName: "Test Restaurant",
        isAvailable: true,
      });

      store.addToCart({
        menuItemId: "item2",
        name: "Pizza",
        price: 15.99,
        quantity: 1,
        restaurantId: "rest1",
        restaurantName: "Test Restaurant",
        isAvailable: true,
      });

      const menuItems: MenuItem[] = [
        {
          id: "item1",
          restaurantId: "rest1",
          name: "Burger",
          description: "Test burger",
          price: 10.99,
          category: "Main",
          isAvailable: true,
          preparationTime: 15,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "item2",
          restaurantId: "rest1",
          name: "Pizza",
          description: "Test pizza",
          price: 15.99,
          category: "Main",
          isAvailable: false, // Unavailable
          preparationTime: 20,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const removedItems = store.removeUnavailableItems(menuItems);

      expect(removedItems).toContain("Pizza");

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].name).toBe("Burger");
    });
  });

  describe("cart calculations", () => {
    it("should calculate total correctly", () => {
      const store = useCartStore.getState();

      store.addToCart({
        menuItemId: "item1",
        name: "Burger",
        price: 10.99,
        quantity: 2,
        restaurantId: "rest1",
        restaurantName: "Test Restaurant",
        isAvailable: true,
      });

      store.addToCart({
        menuItemId: "item2",
        name: "Pizza",
        price: 15.99,
        quantity: 1,
        restaurantId: "rest1",
        restaurantName: "Test Restaurant",
        isAvailable: true,
      });

      const total = useCartStore.getState().getTotal();
      expect(total).toBe(10.99 * 2 + 15.99);
    });

    it("should calculate item count correctly", () => {
      const store = useCartStore.getState();

      store.addToCart({
        menuItemId: "item1",
        name: "Burger",
        price: 10.99,
        quantity: 2,
        restaurantId: "rest1",
        restaurantName: "Test Restaurant",
        isAvailable: true,
      });

      store.addToCart({
        menuItemId: "item2",
        name: "Pizza",
        price: 15.99,
        quantity: 3,
        restaurantId: "rest1",
        restaurantName: "Test Restaurant",
        isAvailable: true,
      });

      const count = useCartStore.getState().getItemCount();
      expect(count).toBe(5);
    });
  });
});
