import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import { getToken, removeToken } from '@/lib/utils';
import { toast } from 'sonner';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: 'include', // Includes HTTP-only cookies
  prepareHeaders: (headers, { getState }) => {
    // 1. Check Redux Auth State or Cookie/Storage
    const token = (getState() as RootState)?.auth?.token || getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithSessionManagement: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    if (result.error.status === 401 && typeof window !== 'undefined') {
      if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
        removeToken();
        toast.error('Your session has expired. Please sign in again.');
      }
    }
  }

  return result;
};

/**
 * RTK Query Base API Slice
 * Centralizes network configuration, authentication tokens, credentials, and cache tags.
 */
export const crmApi = createApi({
  reducerPath: 'crmApi',
  baseQuery: baseQueryWithSessionManagement,
  tagTypes: [
    'Auth',
    'Leads',
    'Lead',
    'Distribution',
    'Workload',
    'Escalations',
    'Metrics',
    'Executives',
    'ExecutiveDetail',
  ],
  endpoints: () => ({}),
});
