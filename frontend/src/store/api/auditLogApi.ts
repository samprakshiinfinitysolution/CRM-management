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
  oldValue?: any;
  newValue?: any;
  ipAddress?: string | null;
  createdAt: string;
}

export const auditLogApi = crmApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<
      ApiResponse<AuditLogItem[]>,
      { page?: number; limit?: number } | void
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
