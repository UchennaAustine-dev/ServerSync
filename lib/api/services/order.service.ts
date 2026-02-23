import api from "../../axios";
import type {
  Order,
  OrderListResponse,
  OrderListParams,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  CancelOrderRequest,
  RateOrderRequest,
  ValidatePromoRequest,
  ValidatePromoResponse,
} from "../types/order.types";

export class OrderService {
  async list(params?: OrderListParams): Promise<OrderListResponse> {
    const response = await api.get("/orders", { params });
    return response.data;
  }

  async getById(id: string): Promise<Order> {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  }

  async create(data: CreateOrderRequest): Promise<Order> {
    const response = await api.post("/orders", data);
    return response.data;
  }

  async updateStatus(
    id: string,
    data: UpdateOrderStatusRequest,
  ): Promise<Order> {
    const response = await api.patch(`/orders/${id}/status`, data);
    return response.data;
  }

  async cancel(id: string, data: CancelOrderRequest): Promise<Order> {
    const response = await api.patch(`/orders/${id}/cancel`, data);
    return response.data;
  }

  async rate(id: string, data: RateOrderRequest): Promise<Order> {
    const response = await api.post(`/orders/${id}/rating`, data);
    return response.data;
  }

  async validatePromo(
    data: ValidatePromoRequest,
  ): Promise<ValidatePromoResponse> {
    const response = await api.post("/orders/validate-promo", data);
    return response.data;
  }
}

export const orderService = new OrderService();
