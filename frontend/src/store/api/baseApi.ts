import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import { logout } from '../slices/authSlice';
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

// Module-level flag prevents multiple concurrent 401 errors from triggering
// duplicate logout/redirect cycles when parallel requests all receive 401.
let isRedirecting = false;

const baseQueryWithSessionManagement: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    if (
      result.error.status === 401 &&
      typeof window !== 'undefined' &&
      !isRedirecting
    ) {
      isRedirecting = true;
      api.dispatch(logout());
      removeToken();
      if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
        toast.error('Your session has expired. Please sign in again.');
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = '/login';
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
    'Dashboard',
  ],
  endpoints: () => ({}),
});
