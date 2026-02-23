/**
 * Customer profile and preferences types
 */

import type { Restaurant } from "./restaurant.types";

export interface CustomerAddress {
  id: string;
  customerId: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressRequest {
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {}

export interface CustomerAnalytics {
  totalSpending: number;
  totalOrders: number;
  averageOrderValue: number;
  spendingTrend: Array<{
    date: string;
    amount: number;
  }>;
  favoriteRestaurants: Array<{
    restaurantId: string;
    restaurantName: string;
    orderCount: number;
    totalSpent: number;
  }>;
  mostOrderedItems: Array<{
    itemId: string;
    itemName: string;
    restaurantName: string;
    orderCount: number;
  }>;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  newsletter: boolean;
  restaurantUpdates?: boolean;
  driverUpdates?: boolean;
}

export interface UpdateNotificationPreferencesRequest extends Partial<NotificationPreferences> {}
