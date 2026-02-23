import api from "../../axios";
import type {
  Restaurant,
  RestaurantListResponse,
  RestaurantListParams,
  CreateRestaurantRequest,
  UpdateRestaurantRequest,
  MenuItem,
  MenuItemListResponse,
  CreateMenuItemRequest,
  UpdateMenuItemRequest,
  OperatingHours,
  UpdateOperatingHoursRequest,
  Promotion,
  CreatePromotionRequest,
  UpdatePromotionRequest,
  RestaurantDashboard,
  RestaurantAnalytics,
  OrderAnalytics,
  MenuAnalytics,
} from "../types/restaurant.types";
import type { Order } from "../types/order.types";

export class RestaurantService {
  // Restaurant CRUD
  async list(params?: RestaurantListParams): Promise<RestaurantListResponse> {
    const response = await api.get("/restaurants", { params });
    return response.data;
  }

  async getById(id: string): Promise<Restaurant> {
    const response = await api.get(`/restaurants/${id}`);
    return response.data;
  }

  async create(data: CreateRestaurantRequest): Promise<Restaurant> {
    const response = await api.post("/restaurants", data);
    return response.data;
  }

  async update(id: string, data: UpdateRestaurantRequest): Promise<Restaurant> {
    const response = await api.patch(`/restaurants/${id}`, data);
    return response.data;
  }

  async updateAvailability(
    id: string,
    available: boolean,
  ): Promise<Restaurant> {
    const response = await api.patch(`/restaurants/${id}/availability`, {
      available,
    });
    return response.data;
  }

  // Menu Management
  async getMenu(restaurantId: string): Promise<MenuItemListResponse> {
    const response = await api.get(`/restaurants/${restaurantId}/menu`);
    return response.data;
  }

  async createMenuItem(
    restaurantId: string,
    data: CreateMenuItemRequest,
  ): Promise<MenuItem> {
    const response = await api.post(`/restaurants/${restaurantId}/menu`, data);
    return response.data;
  }

  async updateMenuItem(
    restaurantId: string,
    itemId: string,
    data: UpdateMenuItemRequest,
  ): Promise<MenuItem> {
    const response = await api.patch(
      `/restaurants/${restaurantId}/menu/${itemId}`,
      data,
    );
    return response.data;
  }

  async deleteMenuItem(restaurantId: string, itemId: string): Promise<void> {
    await api.delete(`/restaurants/${restaurantId}/menu/${itemId}`);
  }

  async uploadMenuItemImage(
    restaurantId: string,
    itemId: string,
    file: File,
  ): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append("image", file);
    const response = await api.post(
      `/restaurants/${restaurantId}/menu/${itemId}/image`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  }

  // Operating Hours
  async getOperatingHours(restaurantId: string): Promise<OperatingHours> {
    const response = await api.get(`/restaurants/${restaurantId}/hours`);
    return response.data;
  }

  async updateOperatingHours(
    restaurantId: string,
    data: UpdateOperatingHoursRequest,
  ): Promise<OperatingHours> {
    const response = await api.patch(
      `/restaurants/${restaurantId}/hours`,
      data,
    );
    return response.data;
  }

  // Promotions
  async getPromotions(restaurantId: string): Promise<Promotion[]> {
    const response = await api.get(`/restaurants/${restaurantId}/promotions`);
    return response.data;
  }

  async createPromotion(
    restaurantId: string,
    data: CreatePromotionRequest,
  ): Promise<Promotion> {
    const response = await api.post(
      `/restaurants/${restaurantId}/promotions`,
      data,
    );
    return response.data;
  }

  async updatePromotion(
    restaurantId: string,
    promoId: string,
    data: UpdatePromotionRequest,
  ): Promise<Promotion> {
    const response = await api.patch(
      `/restaurants/${restaurantId}/promotions/${promoId}`,
      data,
    );
    return response.data;
  }

  async deletePromotion(restaurantId: string, promoId: string): Promise<void> {
    await api.delete(`/restaurants/${restaurantId}/promotions/${promoId}`);
  }

  // Analytics
  async getDashboard(restaurantId: string): Promise<RestaurantDashboard> {
    const response = await api.get(`/restaurants/${restaurantId}/dashboard`);
    return response.data;
  }

  async getAnalytics(
    restaurantId: string,
    params?: { startDate?: string; endDate?: string },
  ): Promise<RestaurantAnalytics> {
    const response = await api.get(`/restaurants/${restaurantId}/analytics`, {
      params,
    });
    return response.data;
  }

  async getOrderAnalytics(
    restaurantId: string,
    params?: { startDate?: string; endDate?: string },
  ): Promise<OrderAnalytics> {
    const response = await api.get(
      `/restaurants/${restaurantId}/analytics/orders`,
      { params },
    );
    return response.data;
  }

  async getMenuAnalytics(
    restaurantId: string,
    params?: { startDate?: string; endDate?: string },
  ): Promise<MenuAnalytics> {
    const response = await api.get(
      `/restaurants/${restaurantId}/analytics/menu`,
      { params },
    );
    return response.data;
  }

  // Kitchen Orders
  async getKitchenOrders(restaurantId: string): Promise<Order[]> {
    const response = await api.get(`/restaurants/${restaurantId}/orders`);
    return response.data;
  }
}

export const restaurantService = new RestaurantService();
