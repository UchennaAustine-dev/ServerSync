/**
 * Payment processing types
 */

import type { Order, PaymentStatus } from "./order.types";

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  stripePaymentIntentId?: string;
  refundAmount?: number;
  refundReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InitiatePaymentRequest {
  orderId: string;
}

export interface InitiatePaymentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
  orderId: string;
}

export interface ConfirmPaymentResponse {
  payment: Payment;
  order: Order;
}

export interface RefundPaymentRequest {
  amount?: number;
  reason: string;
}

export interface RefundPaymentResponse {
  payment: Payment;
  refundId: string;
}
