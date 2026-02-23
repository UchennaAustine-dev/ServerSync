# Configuration Module

This directory contains configuration files for the ServeSync client application.

## Environment Configuration

The `env.ts` file provides type-safe environment variable validation and access using Zod.

### Features

- **Type-safe environment variables**: All environment variables are validated with Zod schemas
- **Default values**: Production URLs are used as defaults when variables are not set
- **Startup validation**: Environment variables are validated when the application starts
- **Development logging**: Configuration errors are logged clearly in development mode
- **Helper functions**: Convenient functions to access configuration values

### Environment Variables

| Variable                 | Required | Default                               | Description                         |
| ------------------------ | -------- | ------------------------------------- | ----------------------------------- |
| `NEXT_PUBLIC_API_URL`    | No       | `https://servesync-84s1.onrender.com` | Backend API base URL                |
| `NEXT_PUBLIC_WS_URL`     | No       | `wss://servesync-84s1.onrender.com`   | WebSocket server URL                |
| `NEXT_PUBLIC_STRIPE_KEY` | No       | -                                     | Stripe publishable key for payments |

### Setup

1. Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

2. Update values in `.env.local` as needed

3. The configuration is automatically validated on application startup

### Usage Examples

```typescript
import {
  getApiUrl,
  getWsUrl,
  getStripeKey,
  isStripeConfigured,
} from "@/lib/config/env";

// Get API URL
const apiUrl = getApiUrl();
// Returns: "https://servesync-84s1.onrender.com" (or custom value)

// Get WebSocket URL
const wsUrl = getWsUrl();
// Returns: "wss://servesync-84s1.onrender.com" (or custom value)

// Get Stripe key
const stripeKey = getStripeKey();
// Returns: string | undefined

// Check if Stripe is configured
if (isStripeConfigured()) {
  // Initialize Stripe
}
```

### Requirements Satisfied

- **27.1**: Frontend reads API base URL from NEXT_PUBLIC_API_URL
- **27.2**: Frontend reads WebSocket URL from NEXT_PUBLIC_WS_URL
- **27.3**: Frontend reads Stripe key from NEXT_PUBLIC_STRIPE_KEY
- **27.4**: Default production URLs used when variables not set
- **27.5**: Required environment variables validated on startup
- **27.6**: Configuration errors logged to console in development
- **27.7**: Clear error messages when configuration is missing
- **27.8**: All variables documented in .env.example

## Query Client Configuration

The `query-client.ts` file provides a pre-configured React Query client with optimized settings for the ServeSync application.

### Features

- **Domain-specific stale times**: Different data types have different freshness requirements
  - Restaurant/Menu data: 5 minutes
  - Order data: 2 minutes
  - Analytics data: 10 minutes
  - Driver availability: 1 minute
- **Automatic refetching**: Data is automatically refetched when:
  - User focuses the browser window
  - Network connection is restored
- **Smart retry logic**: Failed requests are retried up to 3 times, but only for:
  - Network errors
  - Server errors (5xx)
  - Not for client errors (4xx)

- **Query key factories**: Hierarchical query keys for easy cache invalidation

### Usage Examples

#### Using the Query Client

```typescript
import { queryClient } from "@/lib/config/query-client";

// The query client is already used in the QueryProvider
// You typically don't need to import it directly
```

#### Using Query Keys

```typescript
import { queryKeys } from "@/lib/config/query-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { restaurantService } from "@/lib/api/services";

// Fetch restaurant list
function useRestaurants(params?: any) {
  return useQuery({
    queryKey: queryKeys.restaurants.list(params),
    queryFn: () => restaurantService.list(params),
  });
}

// Fetch specific restaurant
function useRestaurant(id: string) {
  return useQuery({
    queryKey: queryKeys.restaurants.detail(id),
    queryFn: () => restaurantService.getById(id),
  });
}

// Invalidate cache after mutation
function useUpdateRestaurant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      restaurantService.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific restaurant
      queryClient.invalidateQueries({
        queryKey: queryKeys.restaurants.detail(variables.id),
      });
      // Invalidate restaurant list
      queryClient.invalidateQueries({
        queryKey: queryKeys.restaurants.list(),
      });
    },
  });
}
```

#### Using Custom Stale Times

```typescript
import { staleTimeConfig } from "@/lib/config/query-client";

// Override default stale time for specific query
function useDriverAvailability() {
  return useQuery({
    queryKey: queryKeys.drivers.availableOrders,
    queryFn: () => driverService.getAvailableOrders(),
    staleTime: staleTimeConfig.driverAvailability, // 1 minute
  });
}
```

#### Cache Invalidation Patterns

```typescript
import { queryKeys } from "@/lib/config/query-client";
import { useQueryClient } from "@tanstack/react-query";

function MyComponent() {
  const queryClient = useQueryClient();

  // Invalidate all restaurant queries
  queryClient.invalidateQueries({
    queryKey: queryKeys.restaurants.all,
  });

  // Invalidate all menu queries for a specific restaurant
  queryClient.invalidateQueries({
    queryKey: queryKeys.restaurants.menu(restaurantId),
  });

  // Invalidate all admin queries
  queryClient.invalidateQueries({
    queryKey: queryKeys.admin.all,
  });
}
```

### Requirements Satisfied

This configuration satisfies the following requirements:

- **28.1**: Restaurant and menu data uses 5-minute stale time
- **28.2**: Order data uses 2-minute stale time
- **28.3**: Analytics data uses 10-minute stale time
- **28.4**: Driver availability data uses 1-minute stale time
- **28.5**: Automatic refetch on window focus enabled
- **28.6**: Automatic refetch on network reconnection enabled
- **28.7**: Query key factories for consistent cache management
- **28.8**: Mutation callbacks can invalidate related queries
- **28.9**: Retry logic consistent with API client (3 retries, skip 4xx errors)
