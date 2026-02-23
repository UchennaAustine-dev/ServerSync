/**
 * Restaurant and menu management types
 */

import type { PaginatedResponse, ListParams } from "./common.types";
import type { Order } from "./order.types";

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisineType: string[];
  address: string;
  phone: string;
  email: string;
  logo?: string;
  coverImage?: string;
  rating: number;
  reviewCount: number;
  priceRange: 1 | 2 | 3 | 4;
  deliveryFee: number;
  minimumOrder: number;
  estimatedDeliveryTime: number;
  isOpen: boolean;
  isAvailable: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface RestaurantListResponse extends PaginatedResponse<Restaurant> {}

export interface RestaurantListParams extends ListParams {
  cuisineType?: string;
  priceRange?: string;
  rating?: number;
  isOpen?: boolean;
}

export interface CreateRestaurantRequest {
  name: string;
  description: string;
  cuisineType: string[];
  address: string;
  phone: string;
  email: string;
  priceRange: 1 | 2 | 3 | 4;
  deliveryFee: number;
  minimumOrder: number;
  estimatedDeliveryTime: number;
}

export interface UpdateRestaurantRequest extends Partial<CreateRestaurantRequest> {}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isAvailable: boolean;
  preparationTime: number;
  allergens?: string[];
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MenuItemListResponse {
  items: MenuItem[];
  categories: string[];
}

export interface CreateMenuItemRequest {
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  preparationTime: number;
  allergens?: string[];
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface UpdateMenuItemRequest extends Partial<CreateMenuItemRequest> {
  isAvailable?: boolean;
}

export interface OperatingHours {
  restaurantId: string;
  schedule: {
    [key: string]: {
      isOpen: boolean;
      openTime: string;
      closeTime: string;
    };
  };
}

export interface UpdateOperatingHoursRequest {
  schedule: OperatingHours["schedule"];
}

export interface Promotion {
  id: string;
  restaurantId: string;
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minimumOrder?: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
  createdAt: string;
}

export interface CreatePromotionRequest {
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minimumOrder?: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
}

export interface UpdatePromotionRequest extends Partial<CreatePromotionRequest> {
  isActive?: boolean;
}

export interface RestaurantDashboard {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  todayRevenue: number;
  todayOrders: number;
  pendingOrders: number;
  recentOrders: Order[];
}

export interface RestaurantAnalytics {
  revenue: {
    total: number;
    trend: Array<{ date: string; amount: number }>;
  };
  orders: {
    total: number;
    trend: Array<{ date: string; count: number }>;
  };
  topItems: Array<{
    itemId: string;
    name: string;
    orderCount: number;
    revenue: number;
  }>;
  peakHours: Array<{
    hour: number;
    orderCount: number;
  }>;
}

export interface OrderAnalytics {
  totalOrders: number;
  averageOrderValue: number;
  ordersByStatus: Record<string, number>;
  orderTrends: Array<{ date: string; count: number }>;
  averageFulfillmentTime: number;
  cancellationRate: number;
  peakOrderingTimes: Array<{
    hour: number;
    dayOfWeek: number;
    count: number;
  }>;
}

export interface MenuAnalytics {
  topSellingItems: Array<{
    itemId: string;
    name: string;
    quantitySold: number;
    revenue: number;
  }>;
  leastSellingItems: Array<{
    itemId: string;
    name: string;
    quantitySold: number;
  }>;
  itemRatings: Array<{
    itemId: string;
    name: string;
    averageRating: number;
    reviewCount: number;
  }>;
  categoryPerformance: Array<{
    category: string;
    itemCount: number;
    revenue: number;
  }>;
}
