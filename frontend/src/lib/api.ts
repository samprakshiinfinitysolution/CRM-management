import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getToken, removeToken } from './utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create a pre-configured Axios instance for the CRM frontend
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true, // Send and receive HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach bearer token from configured token key
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

// Response Interceptor: Centralized error normalization and handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<{ message?: string; error?: { code?: string; details?: unknown } }>) => {
    if (error.response) {
      // Server responded with an error code (4xx, 5xx)
      const status = error.response.status;

      if (status === 401 && typeof window !== 'undefined') {
        // Unauthorized - session expired or invalid credentials
        if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
          removeToken();
        }
      }
    } else if (error.request) {
      // Request was made but no response was received (network failure or server down)
      console.error('CRM Network/Server unreachable:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
