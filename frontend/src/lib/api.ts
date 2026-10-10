import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
} from "axios";
import { toast } from "sonner";
import { handleUnauthorized } from "./sessionGuard";

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
 * Sends the browser-managed httpOnly session cookie with each request.
 */
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true, // Send and receive HTTP-only cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Response Interceptor: Centralized error normalization and user notifications
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Unauthorized - session expired or invalid credentials.
    // Delegate to the shared, idempotent guard so 401 handling (cookie purge +
    // single redirect) is identical to RTK Query and cannot loop.
    if (error.response?.status === 401 && typeof window !== "undefined") {
      handleUnauthorized(error.config?.url);
      return Promise.reject(error);
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
