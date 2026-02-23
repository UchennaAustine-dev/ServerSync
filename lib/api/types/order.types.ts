/**
 * Order management types
 */

import type { PaginatedResponse, ListParams } from "./common.types";

export interface Order {
  id: string;
  customerId: string;
  restaurantId: string;
  driverId?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  deliveryAddress: Address;
  contactPhone: string;
  specialInstructions?: string;
  promoCode?: string;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  rating?: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: Array<{
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }>;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded";

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface OrderListResponse extends PaginatedResponse<Order> {}

export interface OrderListParams extends ListParams {
  status?: OrderStatus;
  restaurantId?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateOrderRequest {
  restaurantId: string;
  items: Array<{
    menuItemId: string;
    quantity: number;
    specialInstructions?: string;
  }>;
  deliveryAddress: Address;
  contactPhone: string;
  specialInstructions?: string;
  promoCode?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  note?: string;
}

export interface CancelOrderRequest {
  reason: string;
}

export interface RateOrderRequest {
  rating: number;
  review?: string;
}

export interface ValidatePromoRequest {
  promoCode: string;
  restaurantId: string;
  subtotal: number;
}

export interface ValidatePromoResponse {
  valid: boolean;
  discountAmount: number;
  message?: string;
}
