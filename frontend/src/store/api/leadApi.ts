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
  ReportSummaryData,
  ReportQueryParams,
  ImportPreviewResult,
  CommitImportPayload,
  CommitImportResult,
} from '@/types/api.types';

export const leadApi = crmApi.injectEndpoints({
  endpoints: (builder) => ({
    getLeads: builder.query<ApiResponse<LeadItem[]>, LeadFilterParams | void>({
      query: (params) => ({
        url: "/leads",
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Lead" as const, id })),
              { type: "Leads", id: "LIST" },
            ]
          : [{ type: "Leads", id: "LIST" }],
    }),

    getLeadById: builder.query<ApiResponse<LeadItem>, string>({
      query: (id) => `/leads/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Lead", id }],
    }),

    createLead: builder.mutation<ApiResponse<LeadItem>, Partial<LeadItem>>({
      query: (newLead) => ({
        url: "/leads",
        method: "POST",
        body: newLead,
      }),
      invalidatesTags: [{ type: "Leads", id: "LIST" }, "Metrics"],
    }),

    updateLeadStatus: builder.mutation<
      ApiResponse<LeadItem>,
      { id: string; status: LeadStatus; note?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/leads/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Lead", id },
        { type: "Leads", id: "LIST" },
        "Metrics",
        "Workload",
      ],
    }),

    distributeLeads: builder.mutation<
      ApiResponse<DistributionResult>,
      DistributionPayload
    >({
      query: (payload) => ({
        url: "/leads/distribute",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [
        { type: "Leads", id: "LIST" },
        "Distribution",
        "Workload",
        "Metrics",
      ],
    }),

    getExecutiveWorkload: builder.query<
      ApiResponse<ExecutiveWorkloadItem[]>,
      void
    >({
      query: () => "/leads/workload",
      providesTags: ["Workload"],
    }),

    getCriticalEscalations: builder.query<
      ApiResponse<CriticalEscalationItem[]>,
      void
    >({
      query: () => "/leads/escalations",
      providesTags: ["Escalations"],
    }),

    getPipelineMetrics: builder.query<ApiResponse<PipelineMetrics>, void>({
      query: () => "/leads/metrics",
      providesTags: ["Metrics"],
    }),

    getReportsSummary: builder.query<
      ApiResponse<ReportSummaryData>,
      ReportQueryParams | void
    >({
      query: (params) => ({
        url: "/reports/leads",
        params: params || {},
      }),
      providesTags: ["Metrics", "Workload", "Leads"],
    }),

    postImportFile: builder.mutation<
      ApiResponse<ImportPreviewResult>,
      FormData
    >({
      query: (formData) => ({
        url: "/imports/upload",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [{ type: "Leads", id: "LIST" }, "Metrics"],
    }),

    commitImport: builder.mutation<
      ApiResponse<CommitImportResult>,
      CommitImportPayload
    >({
      query: (payload) => ({
        url: "/imports/commit",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [
        { type: "Leads", id: "LIST" },
        "Metrics",
        "Workload",
        "Imports",
      ],
    }),

    recallLeads: builder.mutation<
      ApiResponse<{ recalledCount: number }>,
      { leadIds: string[]; reason?: string }
    >({
      query: (payload) => ({
        url: "/leads/recall",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [
        { type: "Leads", id: "LIST" },
        "Metrics",
        "Workload",
        "Distribution",
      ],
    }),

    reassignLeads: builder.mutation<
      ApiResponse<{ reassignedCount: number; targetExecutive: string }>,
      { leadIds: string[]; targetExecutiveId: string; reason?: string }
    >({
      query: (payload) => ({
        url: "/leads/reassign",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [
        { type: "Leads", id: "LIST" },
        "Metrics",
        "Workload",
        "Distribution",
      ],
    }),

    getImportBatches: builder.query<
      ApiResponse<any[]>,
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/imports/batches",
        params: params || {},
      }),
      providesTags: ["Imports"],
    }),

    getImportBatchById: builder.query<ApiResponse<any>, string>({
      query: (id) => `/imports/batches/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Imports", id }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetLeadsQuery,
  useLazyGetLeadsQuery,
  useGetLeadByIdQuery,
  useCreateLeadMutation,
  useUpdateLeadStatusMutation,
  useDistributeLeadsMutation,
  useGetExecutiveWorkloadQuery,
  useGetCriticalEscalationsQuery,
  useGetPipelineMetricsQuery,
  useGetReportsSummaryQuery,
  usePostImportFileMutation,
  useCommitImportMutation,
  useRecallLeadsMutation,
  useReassignLeadsMutation,
  useGetImportBatchesQuery,
  useGetImportBatchByIdQuery,
} = leadApi;


