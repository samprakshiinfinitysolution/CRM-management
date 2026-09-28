import { crmApi } from './baseApi';
import type {
  ApiResponse,
  LeadItem,
  LeadFilterParams,
  LeadStatus,
  DistributionPayload,
  DistributionResult,
  ExecutiveWorkloadItem,
  CriticalEscalationItem,
  PipelineMetrics,
} from '@/types/api.types';

export const leadApi = crmApi.injectEndpoints({
  endpoints: (builder) => ({
    getLeads: builder.query<ApiResponse<LeadItem[]>, LeadFilterParams | void>({
      query: (params) => ({
        url: '/leads',
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Lead' as const, id })),
              { type: 'Leads', id: 'LIST' },
            ]
          : [{ type: 'Leads', id: 'LIST' }],
    }),

    getLeadById: builder.query<ApiResponse<LeadItem>, string>({
      query: (id) => `/leads/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Lead', id }],
    }),

    createLead: builder.mutation<ApiResponse<LeadItem>, Partial<LeadItem>>({
      query: (newLead) => ({
        url: '/leads',
        method: 'POST',
        body: newLead,
      }),
      invalidatesTags: [{ type: 'Leads', id: 'LIST' }, 'Metrics'],
    }),

    updateLeadStatus: builder.mutation<
      ApiResponse<LeadItem>,
      { id: string; status: LeadStatus; note?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/leads/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Lead', id },
        { type: 'Leads', id: 'LIST' },
        'Metrics',
        'Workload',
      ],
    }),

    distributeLeads: builder.mutation<ApiResponse<DistributionResult>, DistributionPayload>({
      query: (payload) => ({
        url: '/leads/distribute',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: [
        { type: 'Leads', id: 'LIST' },
        'Distribution',
        'Workload',
        'Metrics',
      ],
    }),

    getExecutiveWorkload: builder.query<ApiResponse<ExecutiveWorkloadItem[]>, void>({
      query: () => '/leads/workload',
      providesTags: ['Workload'],
    }),

    getCriticalEscalations: builder.query<ApiResponse<CriticalEscalationItem[]>, void>({
      query: () => '/leads/escalations',
      providesTags: ['Escalations'],
    }),

    getPipelineMetrics: builder.query<ApiResponse<PipelineMetrics>, void>({
      query: () => '/leads/metrics',
      providesTags: ['Metrics'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetLeadsQuery,
  useGetLeadByIdQuery,
  useCreateLeadMutation,
  useUpdateLeadStatusMutation,
  useDistributeLeadsMutation,
  useGetExecutiveWorkloadQuery,
  useGetCriticalEscalationsQuery,
  useGetPipelineMetricsQuery,
} = leadApi;
