import { crmApi } from './baseApi';
import type { ApiResponse, TLDashboardMetrics, SEDashboardMetrics, AdminDashboardMetrics } from '@/types/api.types';

export const reportApi = crmApi.injectEndpoints({
  endpoints: (build) => ({
    getTLDashboardMetrics: build.query<ApiResponse<TLDashboardMetrics>, void>({
      query: () => "/reports/dashboard-metrics/team-lead",
      providesTags: ["Metrics", "Dashboard"],
    }),
    getSEDashboardMetrics: build.query<ApiResponse<SEDashboardMetrics>, void>({
      query: () => "/reports/dashboard-metrics/sales-executive",
      providesTags: ["Metrics", "Dashboard"],
    }),
    getAdminDashboardMetrics: build.query<ApiResponse<AdminDashboardMetrics>, void>({
      query: () => "/reports/dashboard-metrics/admin",
      providesTags: ["Metrics", "Dashboard"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetTLDashboardMetricsQuery,
  useGetSEDashboardMetricsQuery,
  useGetAdminDashboardMetricsQuery,
} = reportApi;