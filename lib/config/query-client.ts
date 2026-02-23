import { QueryClient } from "@tanstack/react-query";

/**
 * Stale time configurations by domain (in milliseconds)
 * Defines how long data is considered fresh before refetching
 */
export const staleTimeConfig = {
  restaurants: 5 * 60 * 1000, // 5 minutes - restaurant and menu data changes infrequently
  menu: 5 * 60 * 1000, // 5 minutes - menu items are relatively stable
  orders: 2 * 60 * 1000, // 2 minutes - order data needs more frequent updates
  analytics: 10 * 60 * 1000, // 10 minutes - analytics data can be cached longer
  driverAvailability: 1 * 60 * 1000, // 1 minute - driver availability changes frequently
  profile: 5 * 60 * 1000, // 5 minutes - user profile data is relatively stable
};

/**
 * Configured QueryClient instance with optimized defaults
 * Implements requirements 28.1-28.9 for efficient data fetching
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes default (Requirement 28.1)
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collection time (formerly cacheTime)
      refetchOnWindowFocus: true, // Requirement 28.5 - refetch on window focus for critical data
      refetchOnReconnect: true, // Requirement 28.6 - refetch on network reconnection
      retry: (failureCount, error: any) => {
        // Requirement 28.9 - retry logic consistent with API client
        // Don't retry on 4xx client errors (user/request errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 3 times for network errors and 5xx server errors
        return failureCount < 3;
      },
    },
    mutations: {
      // Mutations should not be retried automatically
      // Each mutation should handle its own retry logic if needed
      retry: false,
    },
  },
});

/**
 * Query key factories for consistent cache management (Requirement 28.7)
 * Hierarchical structure allows for easy cache invalidation
 *
 * Usage examples:
 * - queryKeys.restaurants.all - invalidates all restaurant queries
 * - queryKeys.restaurants.detail(id) - specific restaurant
 * - queryKeys.orders.list(params) - orders with specific filters
 */
export const queryKeys = {
  // Authentication domain
  auth: {
    all: ["auth"] as const,
    profile: ["auth", "profile"] as const,
  },

  // Restaurants domain
  restaurants: {
    all: ["restaurants"] as const,
    list: (params?: any) => ["restaurants", "list", params] as const,
    detail: (id: string) => ["restaurants", "detail", id] as const,
    menu: (id: string) => ["restaurants", "menu", id] as const,
    hours: (id: string) => ["restaurants", "hours", id] as const,
    promotions: (id: string) => ["restaurants", "promotions", id] as const,
    dashboard: (id: string) => ["restaurants", "dashboard", id] as const,
    analytics: (id: string, params?: any) =>
      ["restaurants", "analytics", id, params] as const,
    orderAnalytics: (id: string, params?: any) =>
      ["restaurants", "order-analytics", id, params] as const,
    menuAnalytics: (id: string, params?: any) =>
      ["restaurants", "menu-analytics", id, params] as const,
    kitchenOrders: (id: string) =>
      ["restaurants", "kitchen-orders", id] as const,
  },

  // Orders domain
  orders: {
    all: ["orders"] as const,
    list: (params?: any) => ["orders", "list", params] as const,
    detail: (id: string) => ["orders", "detail", id] as const,
  },

  // Payment domain
  payments: {
    all: ["payments"] as const,
    initiate: (orderId: string) => ["payments", "initiate", orderId] as const,
  },

  // Drivers domain
  drivers: {
    all: ["drivers"] as const,
    profile: ["drivers", "profile"] as const,
    availableOrders: ["drivers", "orders", "available"] as const,
    activeOrders: ["drivers", "orders", "active"] as const,
    earnings: (params?: any) => ["drivers", "earnings", params] as const,
    metrics: (params?: any) => ["drivers", "metrics", params] as const,
  },

  // Admin domain
  admin: {
    all: ["admin"] as const,
    dashboard: (params?: any) => ["admin", "dashboard", params] as const,
    restaurants: {
      all: ["admin", "restaurants"] as const,
      list: (params?: any) => ["admin", "restaurants", "list", params] as const,
      detail: (id: string) => ["admin", "restaurants", "detail", id] as const,
    },
    drivers: {
      all: ["admin", "drivers"] as const,
      list: (params?: any) => ["admin", "drivers", "list", params] as const,
      detail: (id: string) => ["admin", "drivers", "detail", id] as const,
    },
    orders: {
      all: ["admin", "orders"] as const,
      list: (params?: any) => ["admin", "orders", "list", params] as const,
      detail: (id: string) => ["admin", "orders", "detail", id] as const,
    },
    analytics: {
      revenue: (params?: any) =>
        ["admin", "analytics", "revenue", params] as const,
      driverPerformance: (params?: any) =>
        ["admin", "analytics", "drivers", params] as const,
    },
  },

  // Customers domain
  customers: {
    all: ["customers"] as const,
    addresses: ["customers", "addresses"] as const,
    favorites: ["customers", "favorites"] as const,
    analytics: (params?: any) => ["customers", "analytics", params] as const,
    notificationPreferences: ["customers", "notification-preferences"] as const,
  },
};
