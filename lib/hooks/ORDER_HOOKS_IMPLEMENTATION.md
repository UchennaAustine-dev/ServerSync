# Order Hooks Implementation

## Overview

This document describes the implementation of order-related React Query hooks for the ServeSync frontend application.

## Files Created

### 1. `lib/hooks/order.hooks.ts`

Main hooks file containing:

- **useCreateOrder()** - Mutation hook for creating orders
  - Calls `orderService.create()` with order details
  - Clears cart after successful order creation
  - Invalidates order list queries
  - Handles errors with proper error messages
  - Requirements: 5.1, 5.7, 5.8

- **useOrders(params?)** - Query hook for fetching order list
  - Supports pagination and filtering
  - Uses 2-minute stale time
  - Requirements: 8.1, 8.2

- **useOrder(orderId, enabled?)** - Query hook for fetching single order
  - Fetches order details by ID
  - Can be disabled via `enabled` parameter
  - Requirements: 8.3

- **useUpdateOrderStatus()** - Mutation hook for updating order status
  - Used by restaurant staff
  - Invalidates order queries after update

- **useCancelOrder()** - Mutation hook for canceling orders
  - Allows customers to cancel orders
  - Requirement: 8.5

- **useRateOrder()** - Mutation hook for rating orders
  - Allows customers to rate completed orders

- **useValidatePromo()** - Mutation hook for validating promo codes
  - Validates promo codes before order creation
  - Requirement: 5.9

### 2. `app/checkout/page.tsx` (Updated)

Updated checkout page to integrate order creation:

- Imports `useCreateOrder` hook
- Uses `useUIStore` for toast notifications
- Implements `handlePlaceOrder()` function that:
  - Validates delivery details
  - Creates order via API
  - Handles success/error states
  - Redirects to order confirmation page
  - Clears cart after successful order

### 3. `app/orders/[id]/page.tsx`

New order confirmation page:

- Displays order details after successful creation
- Shows order status, items, delivery address
- Provides navigation back to restaurants or dashboard
- Uses `useOrder` hook to fetch order details

### 4. `lib/hooks/__tests__/order.hooks.test.ts`

Test file for order hooks (requires test framework setup):

- Tests for `useCreateOrder` success and error cases
- Tests for cart clearing after order creation
- Tests for `useOrders` list fetching
- Tests for `useOrder` single order fetching

## Integration Points

### Cart Store Integration

The order hooks integrate with the cart store:

```typescript
const { clearCart } = useCartStore();
```

After successful order creation, the cart is automatically cleared.

### Query Cache Management

Order hooks properly manage the React Query cache:

- After order creation: Invalidates `queryKeys.orders.all`
- After status update: Updates specific order in cache and invalidates lists
- Uses appropriate stale times (2 minutes for orders)

### Error Handling

All hooks include proper error handling:

- Console logging for debugging
- Error propagation to UI components
- Toast notifications for user feedback

## Usage Examples

### Creating an Order

```typescript
const createOrderMutation = useCreateOrder();

const handleSubmit = async () => {
  try {
    const order = await createOrderMutation.mutateAsync({
      restaurantId: "restaurant-123",
      items: [
        {
          menuItemId: "item-1",
          quantity: 2,
          specialInstructions: "No onions",
        },
      ],
      deliveryAddress: {
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "United States",
      },
      contactPhone: "555-0123",
      specialInstructions: "Ring doorbell",
      promoCode: "SAVE10",
    });

    // Order created successfully
    router.push(`/orders/${order.id}`);
  } catch (error) {
    // Handle error
    console.error("Order creation failed:", error);
  }
};
```

### Fetching Orders

```typescript
// Fetch all orders
const { data: orders, isLoading } = useOrders();

// Fetch with filters
const { data: pendingOrders } = useOrders({
  status: "pending",
  page: 1,
  limit: 10,
});

// Fetch single order
const { data: order } = useOrder("order-123");
```

### Validating Promo Code

```typescript
const validatePromoMutation = useValidatePromo();

const handleValidatePromo = async (code: string) => {
  try {
    const result = await validatePromoMutation.mutateAsync({
      promoCode: code,
      restaurantId: "restaurant-123",
      subtotal: 50.0,
    });

    if (result.valid) {
      console.log("Discount:", result.discountAmount);
    }
  } catch (error) {
    console.error("Invalid promo code");
  }
};
```

## Requirements Satisfied

- ✅ 5.1: POST /orders with order details
- ✅ 5.7: Include delivery address, contact information, and special instructions
- ✅ 5.8: Invalidate customer order history after creation
- ✅ 5.9: Promo code validation
- ✅ 8.1: GET /orders for order history
- ✅ 8.2: Support pagination parameters
- ✅ 8.3: GET /orders/:id for order details
- ✅ 8.5: PATCH /orders/:id/cancel for cancellation

## Next Steps

1. **Task 5.6**: Integrate Stripe payment processing
2. **Task 5.7**: Implement order history page with filtering
3. **Task 5.8**: Implement order cancellation UI
4. **Task 5.9**: Write property tests for cache invalidation
5. **Task 5.10**: Implement order rating system UI

## Testing

To run tests (once test framework is set up):

```bash
npm test -- order.hooks.test.ts
```

## Notes

- The checkout page now uses real API calls instead of mock data
- Cart is automatically cleared after successful order creation
- Order confirmation page displays real order data from the API
- All error cases are handled with user-friendly messages
- Toast notifications provide feedback for all operations
