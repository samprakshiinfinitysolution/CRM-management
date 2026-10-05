import { crmApi } from './baseApi';
import type { ApiResponse } from '@/types/api.types';

export interface AuditLogItem {
  id: string;
  actorUserId?: string | null;
  actor?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  oldValue?: Record<string, unknown> | string | number | boolean | null;
  newValue?: Record<string, unknown> | string | number | boolean | null;
  ipAddress?: string | null;
  createdAt: string;
}

export interface GetAuditLogsParams {
  page?: number;
  limit?: number;
  action?: string;
  entityType?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export const auditLogApi = crmApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<
      ApiResponse<AuditLogItem[]>,
      GetAuditLogsParams | void
    >({
      query: (params) => ({
        url: '/audit-logs',
        params: params || {},
      }),
      providesTags: ['AuditLogs'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAuditLogsQuery } = auditLogApi;
