# Order Rating System

## Overview

The order rating system allows customers to rate and review their completed orders. This feature helps gather feedback and improve service quality.

## Components

### RateOrderModal

A modal component that provides an interface for customers to rate orders with a 1-5 star rating and optional review text.

**Location:** `serversync-client/components/order/RateOrderModal.tsx`

**Features:**

- Interactive 5-star rating system with hover effects
- Optional review text input (max 500 characters)
- Character counter for review text
- Loading state during submission
- Validation (requires at least 1 star to submit)
- Responsive design matching app theme

**Props:**

```typescript
interface RateOrderModalProps {
  isOpen: boolean; // Controls modal visibility
  onClose: () => void; // Called when modal is closed
  onConfirm: (rating: number, review?: string) => void; // Called on submission
  isLoading?: boolean; // Shows loading state during API call
}
```

## Integration

### Order Detail Page

**Location:** `serversync-client/app/orders/[id]/page.tsx`

The order detail page displays a "Rate Order" button for delivered orders that haven't been rated yet.

**Features:**

- Shows rating button only for delivered orders without ratings
- Displays existing rating with stars if order has been rated
- Shows review text if provided
- Success/error toast notifications on rating submission
- Automatic cache invalidation after rating

### Order History Pages

**Locations:**

- `serversync-client/app/orders/page.tsx`
- `serversync-client/app/dashboard/orders/page.tsx`

Both order history pages display ratings for delivered orders:

- Star rating visualization (1-5 stars)
- Filled stars for the rating value
- Empty stars for remaining slots

## API Integration

### Hook: useRateOrder

**Location:** `serversync-client/lib/hooks/order.hooks.ts`

React Query mutation hook that handles rating submission:

```typescript
const rateOrderMutation = useRateOrder();

// Usage
await rateOrderMutation.mutateAsync({
  orderId: "order-123",
  data: {
    rating: 5,
    review: "Great food and service!",
  },
});
```

**Features:**

- Calls `POST /orders/:id/rating` endpoint
- Updates order cache on success
- Invalidates order list queries
- Handles errors gracefully

### Service Method

**Location:** `serversync-client/lib/api/services/order.service.ts`

```typescript
async rate(id: string, data: RateOrderRequest): Promise<Order>
```

### Types

**Location:** `serversync-client/lib/api/types/order.types.ts`

```typescript
interface RateOrderRequest {
  rating: number; // 1-5 stars
  review?: string; // Optional review text
}

interface Order {
  // ... other fields
  rating?: number; // Customer's rating (1-5)
  review?: string; // Customer's review text
}
```

## User Flow

1. Customer completes an order (status: "delivered")
2. Customer navigates to order detail page
3. "Rate Order" button appears (only if not yet rated)
4. Customer clicks "Rate Order" button
5. RateOrderModal opens
6. Customer selects star rating (1-5)
7. Customer optionally enters review text
8. Customer clicks "Submit Rating"
9. API call is made to save rating
10. Success toast notification appears
11. Modal closes
12. Order detail page updates to show rating
13. Rating appears in order history

## Validation Rules

1. **Rating is required**: Submit button is disabled until at least 1 star is selected
2. **Rating range**: Must be between 1 and 5 stars
3. **Review is optional**: Can submit without review text
4. **Review length**: Maximum 500 characters
5. **One rating per order**: Cannot rate the same order twice (button hidden after rating)
6. **Order status**: Can only rate delivered orders

## Error Handling

- Network errors: Display error toast with retry option
- Validation errors: Display field-specific error messages
- API errors: Display user-friendly error messages via toast
- Loading states: Disable all interactions during submission

## Testing

**Location:** `serversync-client/components/order/__tests__/RateOrderModal.test.tsx`

Comprehensive test suite covering:

- Component rendering
- Star rating interaction
- Review text input
- Form submission
- Validation
- Loading states
- Error handling
- Accessibility

## Requirements Satisfied

**Requirement 40: Order Rating and Review**

✅ 1. Calls POST /orders/:id/rating when customer rates order
✅ 2. Includes rating value (1-5 stars) and optional review text
✅ 3. Displays rating interface only for completed orders
✅ 4. Validates rating value is between 1 and 5
✅ 5. Updates order details in cache after successful submission
✅ 6. Displays submitted rating in order history
✅ 7. Allows customers to view their past reviews
✅ 8. Displays error message with retry option on failure
✅ 9. Prevents duplicate ratings (button hidden after rating)

## Future Enhancements

- Edit existing ratings
- Rating analytics for restaurants
- Average rating display on restaurant pages
- Rating filters in order history
- Email notifications for rating requests
