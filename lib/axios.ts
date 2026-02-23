import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getApiUrl } from "./config/env";
import { useAuthStore } from "./store"; // Validation will be fixed in next step
import { createLogger } from "./utils/logger";

// Create logger for API client
const logger = createLogger({ component: "AxiosClient" });

// Configuration
const API_URL = getApiUrl();
const TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Idempotent HTTP methods that are safe to retry
const IDEMPOTENT_METHODS = ["GET", "PUT", "DELETE"];

// Track retry attempts per request
interface RetryConfig extends InternalAxiosRequestConfig {
  _retryCount?: number;
  _startTime?: number;
}

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to prevent multiple simultaneous token refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor - inject authentication token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Track request start time for duration calculation
    (config as RetryConfig)._startTime = Date.now();

    // Log API request
    logger.logRequest(config.method?.toUpperCase() || "GET", config.url || "", {
      params: config.params,
      retryCount: (config as RetryConfig)._retryCount || 0,
    });

    return config;
  },
  (error) => {
    logger.error("Request interceptor error", {}, error);
    return Promise.reject(error);
  },
);

// Response interceptor - handle errors and token refresh
api.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const config = response.config as RetryConfig;
    const duration = config._startTime
      ? Date.now() - config._startTime
      : undefined;

    // Log successful response
    logger.logResponse(
      config.method?.toUpperCase() || "GET",
      config.url || "",
      response.status,
      duration,
      {
        retryCount: config._retryCount || 0,
      },
    );

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig;

    // Calculate request duration
    const duration = originalRequest?._startTime
      ? Date.now() - originalRequest._startTime
      : undefined;

    // Log error response
    if (error.response) {
      logger.logResponse(
        originalRequest?.method?.toUpperCase() || "GET",
        originalRequest?.url || "",
        error.response.status,
        duration,
        {
          retryCount: originalRequest?._retryCount || 0,
          error: error.message,
        },
      );
    } else {
      logger.error(
        `API Request Failed: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`,
        {
          error: error.message,
          duration,
        },
        error,
      );
    }

    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && originalRequest) {
      logger.warn("Unauthorized request, attempting token refresh", {
        url: originalRequest.url,
      });

      if (isRefreshing) {
        // Queue this request while token is being refreshed
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        // Attempt to refresh the token
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        logger.info("Refreshing authentication token");

        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { token: newToken } = response.data;
        localStorage.setItem("token", newToken);

        logger.info("Token refresh successful");

        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // Process queued requests
        processQueue(null, newToken);

        isRefreshing = false;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Token refresh failed - logout user
        logger.error(
          "Token refresh failed, logging out user",
          {},
          refreshError as Error,
        );

        processQueue(refreshError as Error, null);
        isRefreshing = false;

        useAuthStore.getState().clearAuth();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    // Handle network errors and implement retry logic with exponential backoff
    if (shouldRetry(error, originalRequest)) {
      originalRequest._retryCount = originalRequest._retryCount || 0;
      originalRequest._retryCount += 1;

      const delay = calculateRetryDelay(originalRequest._retryCount);

      logger.warn(
        `Retrying request (attempt ${originalRequest._retryCount}/${MAX_RETRIES})`,
        {
          method: originalRequest.method,
          url: originalRequest.url,
          delay,
        },
      );

      await sleep(delay);

      return api(originalRequest);
    }

    return Promise.reject(error);
  },
);

/**
 * Determine if a request should be retried
 */
function shouldRetry(error: AxiosError, config?: RetryConfig): boolean {
  if (!config) return false;

  // Don't retry if we've exceeded max retries
  const retryCount = config._retryCount || 0;
  if (retryCount >= MAX_RETRIES) return false;

  // Only retry idempotent methods
  const method = config.method?.toUpperCase();
  if (!method || !IDEMPOTENT_METHODS.includes(method)) return false;

  // Retry on network errors (no response)
  if (!error.response) return true;

  // Retry on 5xx server errors
  const status = error.response.status;
  if (status >= 500 && status < 600) return true;

  // Retry on 429 (Too Many Requests)
  if (status === 429) return true;

  return false;
}

/**
 * Calculate exponential backoff delay
 */
function calculateRetryDelay(retryCount: number): number {
  // Exponential backoff: 1s, 2s, 4s
  const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount - 1);
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 1000;
  return delay + jitter;
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default api;
