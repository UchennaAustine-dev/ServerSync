# Cart Validation and Syncing

This document explains how the cart validation and syncing functionality works with real menu data.

## Overview

The cart store now includes enhanced validation and syncing capabilities to ensure cart items are always validated against real menu data from the API. This prevents issues with:

- Items that are no longer available
- Items that have been removed from the menu
- Price changes since items were added to cart

## Features

### 1. Cart Validation (`validateCart`)

Validates cart items against current menu data without modifying the cart.

```typescript
const { validateCart } = useCartStore();
const result = validateCart(menuItems);

// Result structure:
{
  valid: boolean;                    // true if no issues found
  unavailableItems: string[];        // Names of unavailable items
  priceChangedItems: Array<{         // Items with price changes
    name: string;
    oldPrice: number;
    newPrice: number;
  }>;
  removedItems: string[];            // Items no longer in menu
}
```

### 2. Cart Syncing (`syncWithMenu`)

Validates and automatically updates the cart by:

- Removing unavailable items
- Removing items no longer in menu
- Updating prices to match current menu prices

```typescript
const { syncWithMenu } = useCartStore();
const result = syncWithMenu(menuItems);
// Returns same structure as validateCart
// Cart is automatically updated
```

### 3. Remove Unavailable Items (`removeUnavailableItems`)

Removes only unavailable items from cart, keeping available items with updated prices.

```typescript
const { removeUnavailableItems } = useCartStore();
const removedItems = removeUnavailableItems(menuItems);
// Returns array of removed item names
```

## React Hooks

### `useCartValidation`

Automatically validates and syncs cart when menu data changes, with toast notifications.

```typescript
import { useCartValidation } from "@/lib/hooks/cart.hooks";

function MyComponent() {
  const restaurantId = useCartStore((state) => state.restaurantId);
  const { validateAndSync, isValidating } = useCartValidation(restaurantId);

  // Validation happens automatically when menu data changes
  // Manual validation:
  const result = validateAndSync();
}
```

**Features:**

- Auto-validates when menu data changes
- Shows toast notifications for issues
- Returns validation status

### `useCartCheckoutValidation`

Validates cart before checkout with user-friendly notifications.

```typescript
import { useCartCheckoutValidation } from "@/lib/hooks/cart.hooks";

function CheckoutButton() {
  const restaurantId = useCartStore((state) => state.restaurantId);
  const { validateForCheckout, canCheckout } =
    useCartCheckoutValidation(restaurantId);

  const handleCheckout = () => {
    if (!validateForCheckout()) {
      // Validation failed, user was notified via toast
      return;
    }
    // Proceed with checkout
  };
}
```

**Features:**

- Validates cart is not empty
- Checks all items are available
- Shows specific error messages
- Returns boolean for checkout readiness

### `useRemoveUnavailableItems`

Manually remove unavailable items with notification.

```typescript
import { useRemoveUnavailableItems } from "@/lib/hooks/cart.hooks";

function CartCleanup() {
  const restaurantId = useCartStore((state) => state.restaurantId);
  const { removeUnavailable } = useRemoveUnavailableItems(restaurantId);

  const handleCleanup = () => {
    const removed = removeUnavailable();
    console.log("Removed items:", removed);
  };
}
```

## Usage Examples

### Example 1: Restaurant Menu Page

```typescript
'use client';

import { useCartValidation } from '@/lib/hooks/cart.hooks';
import { useCartStore } from '@/lib/store';

export default function RestaurantMenuPage({ restaurantId }: { restaurantId: string }) {
  const cartRestaurantId = useCartStore(state => state.restaurantId);

  // Auto-validates cart when menu loads
  useCartValidation(cartRestaurantId);

  return (
    <div>
      {/* Menu items */}
    </div>
  );
}
```

### Example 2: Checkout Page

```typescript
'use client';

import { useCartCheckoutValidation } from '@/lib/hooks/cart.hooks';
import { useCartStore } from '@/lib/store';

export default function CheckoutPage() {
  const restaurantId = useCartStore(state => state.restaurantId);
  const { validateForCheckout, canCheckout } = useCartCheckoutValidation(restaurantId);

  const handleProceedToPayment = () => {
    if (!validateForCheckout()) {
      return; // User notified via toast
    }
    // Proceed to payment
  };

  return (
    <button
      onClick={handleProceedToPayment}
      disabled={!canCheckout}
    >
      Proceed to Payment
    </button>
  );
}
```

## Persistence

The cart store uses Zustand's persist middleware with localStorage:

- Storage key: `cart-storage`
- All cart data persists across browser sessions
- Validation should be run on app load to sync with latest menu data

## Toast Notifications

The validation hooks automatically show toast notifications for:

- **Error (Red)**: Items removed from menu
- **Warning (Yellow)**: Items currently unavailable
- **Info (Blue)**: Price changes

Notifications include:

- Number of affected items
- Item names
- Price change details (old → new)

## Requirements Satisfied

- **Requirement 5.2**: Validates cart contents against real menu data
- **Requirement 5.3**: Validates item availability and price consistency
- **Requirement 26.3**: Removes mock cart data (no fallbacks to mock data)

## Testing

Unit tests are available in `lib/store/__tests__/cart.store.test.ts` covering:

- Adding items to cart
- Validating cart against menu data
- Detecting unavailable items
- Detecting price changes
- Detecting removed items
- Syncing cart with menu
- Removing unavailable items
- Cart calculations
