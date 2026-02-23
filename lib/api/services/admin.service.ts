import api from "../../axios";
import type {
  AdminDashboard,
  AdminRestaurantListResponse,
  AdminRestaurantListParams,
  UpdateRestaurantStatusRequest,
  AdminDriverListResponse,
  AdminDriverListParams,
  UpdateDriverStatusRequest,
  AdminOrderListResponse,
  AdminOrderListParams,
  RevenueAnalytics,
  DriverPerformanceAnalytics,
} from "../types/admin.types";
import type { Restaurant } from "../types/restaurant.types";
import type { DriverProfile } from "../types/driver.types";
import type { Order, CancelOrderRequest } from "../types/order.types";

export class AdminService {
  async getDashboard(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<AdminDashboard> {
    const response = await api.get("/admin/dashboard", { params });
    return response.data;
  }

  // Restaurant Management
  async getRestaurants(
    params?: AdminRestaurantListParams,
  ): Promise<AdminRestaurantListResponse> {
    const response = await api.get("/admin/restaurants", { params });
    return response.data;
  }

  async getRestaurantById(id: string): Promise<Restaurant> {
    const response = await api.get(`/admin/restaurants/${id}`);
    return response.data;
  }

  async updateRestaurantStatus(
    id: string,
    data: UpdateRestaurantStatusRequest,
  ): Promise<Restaurant> {
    const response = await api.patch(`/admin/restaurants/${id}/status`, data);
    return response.data;
  }

  // Driver Management
  async getDrivers(
    params?: AdminDriverListParams,
  ): Promise<AdminDriverListResponse> {
    const response = await api.get("/admin/drivers", { params });
    return response.data;
  }

  async getDriverById(id: string): Promise<DriverProfile> {
    const response = await api.get(`/admin/drivers/${id}`);
    return response.data;
  }

  async updateDriverStatus(
    id: string,
    data: UpdateDriverStatusRequest,
  ): Promise<DriverProfile> {
    const response = await api.patch(`/admin/drivers/${id}/status`, data);
    return response.data;
  }

  // Order Management
  async getOrders(
    params?: AdminOrderListParams,
  ): Promise<AdminOrderListResponse> {
    const response = await api.get("/admin/orders", { params });
    return response.data;
  }

  async getOrderById(id: string): Promise<Order> {
    const response = await api.get(`/admin/orders/${id}`);
    return response.data;
  }

  async cancelOrder(id: string, data: CancelOrderRequest): Promise<Order> {
    const response = await api.patch(`/admin/orders/${id}/cancel`, data);
    return response.data;
  }

  // Analytics
  async getRevenueAnalytics(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<RevenueAnalytics> {
    const response = await api.get("/admin/analytics/revenue", { params });
    return response.data;
  }

  async getDriverPerformance(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<DriverPerformanceAnalytics> {
    const response = await api.get("/admin/analytics/drivers", { params });
    return response.data;
  }
}

export const adminService = new AdminService();
