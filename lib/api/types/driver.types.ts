/**
 * Driver management types
 */

import type { PaginatedResponse } from "./common.types";
import type { Order, Address } from "./order.types";

export interface DriverProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  vehicleType: string;
  vehiclePlate: string;
  vehicleColor: string;
  status: DriverStatus;
  isAvailable: boolean;
  rating: number;
  totalDeliveries: number;
  documents: {
    license?: string;
    insurance?: string;
    registration?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type DriverStatus = "pending" | "approved" | "suspended" | "rejected";

export interface RegisterDriverRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  licenseNumber: string;
  vehicleType: string;
  vehiclePlate: string;
  vehicleColor: string;
  documents?: {
    license?: File;
    insurance?: File;
    registration?: File;
  };
}

export interface UpdateDriverProfileRequest {
  phone?: string;
  vehicleType?: string;
  vehiclePlate?: string;
  vehicleColor?: string;
}

export interface DriverOrder extends Order {
  restaurant: {
    id: string;
    name: string;
    address: string;
    phone: string;
  };
  pickupLocation: Address;
  deliveryLocation: Address;
  estimatedDistance: number;
  estimatedDuration: number;
  deliveryFee: number;
}

export interface DriverOrderListResponse extends PaginatedResponse<DriverOrder> {}

export interface AcceptOrderRequest {
  estimatedPickupTime: string;
}

export interface UpdateDeliveryStatusRequest {
  status: "accepted" | "picked_up" | "in_transit" | "delivered";
  note?: string;
}

export interface UpdateAvailabilityRequest {
  isAvailable: boolean;
}

export interface DriverEarnings {
  totalEarnings: number;
  completedDeliveries: number;
  averagePerDelivery: number;
  earningsByDate: Array<{
    date: string;
    earnings: number;
    deliveries: number;
  }>;
  earningsByWeek: Array<{
    week: string;
    earnings: number;
    deliveries: number;
  }>;
}

export interface DriverMetrics {
  totalDeliveries: number;
  averageDeliveryTime: number;
  onTimeDeliveryRate: number;
  acceptanceRate: number;
  averageRating: number;
  earningsPerHour: number;
  performanceTrend: Array<{
    date: string;
    deliveries: number;
    averageTime: number;
    rating: number;
  }>;
}

export interface LocationUpdate {
  orderId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}
