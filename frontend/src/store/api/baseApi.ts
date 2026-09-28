import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import { getToken } from '@/lib/utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * RTK Query Base API Slice
 * Centralizes network configuration, authentication tokens, credentials, and cache tags.
 */
export const crmApi = createApi({
  reducerPath: 'crmApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include', // Includes HTTP-only cookies
    prepareHeaders: (headers, { getState }) => {
      // 1. Check Redux Auth State
      const token = (getState() as RootState)?.auth?.token || getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
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
