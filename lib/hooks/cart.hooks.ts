/**
 * Cart React Query Hooks and Utilities
 * Implements requirements 5.2, 5.3, 26.3
 */

import { useEffect, useCallback } from "react";
import { useCartStore } from "@/lib/store";
import { useRestaurantMenu } from "./restaurant.hooks";
import {
  showWarningToast,
  showInfoToast,
  showErrorToast,
} from "@/lib/utils/error-handler";

/**
 * Hook to validate and sync cart with real menu data
 * Requirement 5.2: Validates cart contents against real menu data
 * Requirement 5.3: Validates item availability and price consistency
 * Requirement 26.3: Removes mock cart data
 */
export function useCartValidation(restaurantId: string | null) {
  const {
    data: menuData,
    isLoading,
    error,
  } = useRestaurantMenu(restaurantId || "");
  const { syncWithMenu, items } = useCartStore();

  const validateAndSync = useCallback(() => {
    if (!menuData?.items || items.length === 0) {
      return {
        valid: true,
        unavailableItems: [],
        priceChangedItems: [],
        removedItems: [],
      };
    }

    const result = syncWithMenu(menuData.items);

    // Show notifications for validation issues
    if (result.removedItems.length > 0) {
      showErrorToast(
        `${result.removedItems.length} item(s) removed from cart: ${result.removedItems.join(", ")} (no longer available)`,
        7000,
      );
    }

    if (result.unavailableItems.length > 0) {
      showWarningToast(
        `${result.unavailableItems.length} item(s) removed from cart: ${result.unavailableItems.join(", ")} (currently unavailable)`,
        7000,
      );
    }

    if (result.priceChangedItems.length > 0) {
      const priceChangeMessages = result.priceChangedItems.map(
        (item) =>
          `${item.name}: $${item.oldPrice.toFixed(2)} → $${item.newPrice.toFixed(2)}`,
      );
      showInfoToast(
        `Price updated for ${result.priceChangedItems.length} item(s): ${priceChangeMessages.join(", ")}`,
        7000,
      );
    }

    return result;
  }, [menuData, items, syncWithMenu]);

  // Auto-validate when menu data changes
  useEffect(() => {
    if (menuData?.items && items.length > 0) {
      validateAndSync();
    }
  }, [menuData?.items, validateAndSync]);

  return {
    validateAndSync,
    isValidating: isLoading,
    validationError: error,
    hasItems: items.length > 0,
  };
}

/**
 * Hook to check if cart is valid before checkout
 * Returns validation status and triggers notifications
 */
export function useCartCheckoutValidation(restaurantId: string | null) {
  const { data: menuData } = useRestaurantMenu(restaurantId || "");
  const { validateCart, items } = useCartStore();

  const validateForCheckout = useCallback(() => {
    if (!menuData?.items || items.length === 0) {
      if (items.length === 0) {
        showWarningToast("Your cart is empty");
        return false;
      }
      showErrorToast("Unable to validate cart. Please try again.");
      return false;
    }

    const result = validateCart(menuData.items);

    if (!result.valid) {
      if (result.removedItems.length > 0) {
        showErrorToast(
          `Cannot proceed: ${result.removedItems.length} item(s) no longer available: ${result.removedItems.join(", ")}`,
          7000,
        );
      }

      if (result.unavailableItems.length > 0) {
        showErrorToast(
          `Cannot proceed: ${result.unavailableItems.length} item(s) currently unavailable: ${result.unavailableItems.join(", ")}`,
          7000,
        );
      }

      return false;
    }

    if (result.priceChangedItems.length > 0) {
      const priceChangeMessages = result.priceChangedItems.map(
        (item) =>
          `${item.name}: $${item.oldPrice.toFixed(2)} → $${item.newPrice.toFixed(2)}`,
      );
      showInfoToast(
        `Note: Prices updated for ${result.priceChangedItems.length} item(s): ${priceChangeMessages.join(", ")}`,
        7000,
      );
    }

    return true;
  }, [menuData, items, validateCart]);

  return {
    validateForCheckout,
    canCheckout: items.length > 0,
  };
}

/**
 * Hook to remove unavailable items from cart
 * Useful for cleanup operations
 */
export function useRemoveUnavailableItems(restaurantId: string | null) {
  const { data: menuData } = useRestaurantMenu(restaurantId || "");
  const { removeUnavailableItems } = useCartStore();

  const removeUnavailable = useCallback(() => {
    if (!menuData?.items) {
      return [];
    }

    const removedItems = removeUnavailableItems(menuData.items);

    if (removedItems.length > 0) {
      showWarningToast(
        `Removed ${removedItems.length} unavailable item(s): ${removedItems.join(", ")}`,
        7000,
      );
    }

    return removedItems;
  }, [menuData, removeUnavailableItems]);

  return {
    removeUnavailable,
  };
}
