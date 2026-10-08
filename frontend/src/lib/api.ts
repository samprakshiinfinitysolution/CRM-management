import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { getToken, removeToken } from "./utils";
import { toast } from "sonner";
import { getApiErrorMessage } from "./errorHandler";

const getApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // In production browser, route through Next.js proxy rewrites (/api)
  if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
    return "/api";
  }
  return "http://localhost:5000/api";
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Pre-configured Axios instance for the CRM frontend.
 * Provides JWT token attachment, credentials inclusion, and centralized error handling.
 */
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true, // Send and receive HTTP-only cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach bearer token from configured token storage
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Response Interceptor: Centralized error normalization and user notifications
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Unauthorized - session expired or invalid credentials
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const requestUrl = error.config?.url || "";
      if (requestUrl.includes("/auth/login") || requestUrl.includes("/auth/register")) {
        return Promise.reject(error);
      }

      if (
        window.location.pathname !== "/" &&
        window.location.pathname !== "/login"
      ) {
        removeToken();
        const msg = getApiErrorMessage(
          error,
          "Session expired. Please sign in again.",
        );
        toast.error(msg);
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    // Server unreachable / network failure
    if (!error.response && error.request) {
      console.error("CRM Network/Server unreachable:", error.message);
      toast.error(
        "Cannot connect to CRM server. Please check your network or server status.",
      );
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

export default api;
