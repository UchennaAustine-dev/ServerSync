import api from "../../axios";
import type {
  CustomerAddress,
  CreateAddressRequest,
  UpdateAddressRequest,
  CustomerAnalytics,
  NotificationPreferences,
  UpdateNotificationPreferencesRequest,
} from "../types/customer.types";
import type { Restaurant } from "../types/restaurant.types";

export class CustomerService {
  // Address Management
  async getAddresses(): Promise<CustomerAddress[]> {
    const response = await api.get("/customers/addresses");
    return response.data;
  }

  async createAddress(data: CreateAddressRequest): Promise<CustomerAddress> {
    const response = await api.post("/customers/addresses", data);
    return response.data;
  }

  async updateAddress(
    id: string,
    data: UpdateAddressRequest,
  ): Promise<CustomerAddress> {
    const response = await api.patch(`/customers/addresses/${id}`, data);
    return response.data;
  }

  async deleteAddress(id: string): Promise<void> {
    await api.delete(`/customers/addresses/${id}`);
  }

  // Favorites
  async getFavorites(): Promise<Restaurant[]> {
    const response = await api.get("/customers/favorites");
    return response.data;
  }

  async addFavorite(restaurantId: string): Promise<void> {
    await api.post("/customers/favorites", { restaurantId });
  }

  async removeFavorite(restaurantId: string): Promise<void> {
    await api.delete(`/customers/favorites/${restaurantId}`);
  }

  // Analytics
  async getAnalytics(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<CustomerAnalytics> {
    const response = await api.get("/customers/analytics", { params });
    return response.data;
  }

  // Notification Preferences
  async getNotificationPreferences(): Promise<NotificationPreferences> {
    const response = await api.get("/customers/notification-preferences");
    return response.data;
  }

  async updateNotificationPreferences(
    data: UpdateNotificationPreferencesRequest,
  ): Promise<NotificationPreferences> {
    const response = await api.patch(
      "/customers/notification-preferences",
      data,
    );
    return response.data;
  }
}

export const customerService = new CustomerService();
