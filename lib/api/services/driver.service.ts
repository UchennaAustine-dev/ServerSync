import api from "../../axios";
import type {
  DriverProfile,
  RegisterDriverRequest,
  UpdateDriverProfileRequest,
  DriverOrder,
  DriverOrderListResponse,
  AcceptOrderRequest,
  UpdateDeliveryStatusRequest,
  UpdateAvailabilityRequest,
  DriverEarnings,
  DriverMetrics,
  LocationUpdate,
} from "../types/driver.types";

export class DriverService {
  async register(data: RegisterDriverRequest): Promise<DriverProfile> {
    const response = await api.post("/drivers/register", data);
    return response.data;
  }

  async getProfile(): Promise<DriverProfile> {
    const response = await api.get("/drivers/profile");
    return response.data;
  }

  async updateProfile(
    data: UpdateDriverProfileRequest,
  ): Promise<DriverProfile> {
    const response = await api.patch("/drivers/profile", data);
    return response.data;
  }

  async getAvailableOrders(): Promise<DriverOrderListResponse> {
    const response = await api.get("/drivers/orders/available");
    return response.data;
  }

  async getActiveOrders(): Promise<DriverOrderListResponse> {
    const response = await api.get("/drivers/orders/active");
    return response.data;
  }

  async acceptOrder(
    orderId: string,
    data: AcceptOrderRequest,
  ): Promise<DriverOrder> {
    const response = await api.post(`/drivers/orders/${orderId}/accept`, data);
    return response.data;
  }

  async updateDeliveryStatus(
    orderId: string,
    data: UpdateDeliveryStatusRequest,
  ): Promise<DriverOrder> {
    const response = await api.patch(`/drivers/orders/${orderId}/status`, data);
    return response.data;
  }

  async updateAvailability(
    data: UpdateAvailabilityRequest,
  ): Promise<DriverProfile> {
    const response = await api.patch("/drivers/availability", data);
    return response.data;
  }

  async getEarnings(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<DriverEarnings> {
    const response = await api.get("/drivers/earnings", { params });
    return response.data;
  }

  async getMetrics(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<DriverMetrics> {
    const response = await api.get("/drivers/metrics", { params });
    return response.data;
  }

  async updateLocation(data: LocationUpdate): Promise<void> {
    // This will be sent via WebSocket, but we keep the method for consistency
    await api.post("/drivers/location", data);
  }
}

export const driverService = new DriverService();
