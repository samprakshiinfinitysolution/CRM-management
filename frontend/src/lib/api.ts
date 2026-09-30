import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getToken, removeToken } from './utils';
import { toast } from 'sonner';
import { getApiErrorMessage } from './errorHandler';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Pre-configured Axios instance for the CRM frontend.
 * Provides JWT token attachment, credentials inclusion, and centralized error handling.
 */
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true, // Send and receive HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
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
  }
);

// Response Interceptor: Centralized error normalization and user notifications
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;

    // Unauthorized - session expired or invalid credentials
    if (status === 401 && typeof window !== 'undefined') {
      if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
        removeToken();
        const msg = getApiErrorMessage(error, 'Session expired. Please sign in again.');
        toast.error(msg);
        return Promise.reject(error);
      }
    }

    // Server unreachable / network failure
    if (!error.response && error.request) {
      console.error('CRM Network/Server unreachable:', error.message);
      toast.error('Cannot connect to CRM server. Please check your network or server status.');
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
