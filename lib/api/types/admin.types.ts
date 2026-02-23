/**
 * Admin management types
 */

import type { PaginatedResponse, ListParams } from "./common.types";
import type { Restaurant } from "./restaurant.types";
import type { DriverProfile, DriverStatus } from "./driver.types";
import type { Order, OrderStatus } from "./order.types";

export interface AdminDashboard {
  totalRevenue: number;
  totalOrders: number;
  activeRestaurants: number;
  activeDrivers: number;
  todayRevenue: number;
  todayOrders: number;
  revenueTrend: Array<{ date: string; amount: number }>;
  orderVolumeTrend: Array<{ date: string; count: number }>;
  topRestaurants: Array<{
    id: string;
    name: string;
    revenue: number;
    orderCount: number;
  }>;
}

export interface AdminRestaurantListResponse extends PaginatedResponse<Restaurant> {}

export interface AdminRestaurantListParams extends ListParams {
  status?: "pending" | "active" | "suspended" | "rejected";
}

export interface UpdateRestaurantStatusRequest {
  status: "pending" | "active" | "suspended" | "rejected";
  reason?: string;
}

export interface AdminDriverListResponse extends PaginatedResponse<DriverProfile> {}

export interface AdminDriverListParams extends ListParams {
  status?: DriverStatus;
  isAvailable?: boolean;
}

export interface UpdateDriverStatusRequest {
  status: DriverStatus;
  reason?: string;
}

export interface AdminOrderListResponse extends PaginatedResponse<Order> {}

export interface AdminOrderListParams extends ListParams {
  status?: OrderStatus;
  restaurantId?: string;
  driverId?: string;
  startDate?: string;
  endDate?: string;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  platformCommission: number;
  restaurantPayouts: number;
  driverPayouts: number;
  revenueTrend: Array<{
    date: string;
    totalRevenue: number;
    commission: number;
  }>;
  revenueByRestaurant: Array<{
    restaurantId: string;
    restaurantName: string;
    revenue: number;
    commission: number;
  }>;
  averageOrderValue: number;
  orderCount: number;
}

export interface DriverPerformanceAnalytics {
  totalDrivers: number;
  activeDrivers: number;
  driverRankings: Array<{
    driverId: string;
    driverName: string;
    deliveryCount: number;
    averageRating: number;
    averageDeliveryTime: number;
    earnings: number;
  }>;
  averageDeliveryTime: number;
  onTimeDeliveryRate: number;
  driverAvailability: Array<{
    hour: number;
    availableDrivers: number;
  }>;
  earningsDistribution: Array<{
    range: string;
    driverCount: number;
  }>;
}
