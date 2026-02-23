# Optimistic Updates Implementation

## Overview

This document describes the optimistic update implementation for menu item availability toggles in the ServeSync application.

## Requirements Implemented

- **Requirement 4.7**: Implements optimistic updates for menu item availability toggles
- **Requirement 4.8**: Reverts optimistic updates and displays error messages on failure
- **Requirement 22.4**: Implements optimistic updates for boolean value toggles
- **Requirement 22.5**: Updates Query_Cache optimistically
- **Requirement 22.6**: Reverts changes and displays error messages on failure

## Implementation Details

### Hook: `useUpdateMenuItem`

Located in `lib/hooks/restaurant.hooks.ts`, this hook implements optimistic updates using React Query's mutation callbacks:

1. **onMutate**: Executes before the API call
   - Cancels any outgoing refetches to prevent race conditions
   - Snapshots the current cache state for rollback
   - Optimistically updates the cache with the new data
   - Returns context with previous state for rollback

2. **onError**: Executes if the API call fails
   - Rolls back the cache to the previous state
   - Error toast is displayed by the calling component

3. **onSettled**: Executes after success or error
   - Invalidates the query to refetch fresh data from the server
   - Ensures cache consistency with backend state

### User Experience

When a restaurant owner toggles menu item availability:

1. **Immediate Feedback**: The UI updates instantly without waiting for the API response
2. **Success**: Toast notification confirms the change
3. **Failure**:
   - UI automatically reverts to the previous state
   - Error toast notification is displayed
   - User can retry the operation

### Testing

Comprehensive tests in `lib/hooks/__tests__/restaurant.hooks.test.tsx` verify:

- Optimistic updates are applied immediately
- Cache is rolled back on error
- Multiple items can be updated independently
- All fields (not just availability) support optimistic updates
- Cache invalidation occurs after success and failure

## Usage Example

```typescript
const updateMutation = useUpdateMenuItem(restaurantId);

const handleToggleAvailability = async (item: MenuItem) => {
  try {
    await updateMutation.mutateAsync({
      itemId: item.id,
      data: { isAvailable: !item.isAvailable },
    });
    toast.success("Item updated successfully");
  } catch (error) {
    // Optimistic update is automatically rolled back
    toast.error("Failed to update availability");
  }
};
```

## Benefits

1. **Instant UI Response**: Users see changes immediately
2. **Automatic Rollback**: No manual state management needed
3. **Consistent State**: Cache invalidation ensures sync with backend
4. **Better UX**: Feels fast and responsive even on slow networks
