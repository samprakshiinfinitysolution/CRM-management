import { crmApi } from './baseApi';
import type { ApiResponse, TLDashboardMetrics } from '@/types/api.types';

export const reportApi = crmApi.injectEndpoints({
  endpoints: (build) => ({
    getTLDashboardMetrics: build.query<ApiResponse<TLDashboardMetrics>, void>({
      query: () => '/reports/dashboard-metrics/team-lead',
      providesTags: ['Metrics'],
    }),
  }),
  overrideExisting: true,
});

export const { useGetTLDashboardMetricsQuery } = reportApi;