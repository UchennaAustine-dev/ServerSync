import api from "../../axios";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RefreshTokenResponse,
  UserProfile,
  UpdateProfileRequest,
} from "../types/auth.types";

export class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await api.post("/auth/register", data);
    return response.data;
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    await api.post("/auth/forgot-password", data);
  }

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await api.post("/auth/reset-password", data);
  }

  async refreshToken(): Promise<RefreshTokenResponse> {
    const response = await api.post("/auth/refresh-token");
    return response.data;
  }

  async getProfile(): Promise<UserProfile> {
    const response = await api.get("/auth/profile");
    return response.data;
  }

  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    const response = await api.patch("/auth/profile", data);
    return response.data;
  }

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  }
}

export const authService = new AuthService();
