import { crmApi } from './baseApi';
import type {
  ApiResponse,
  FollowUpItem,
  FollowUpSummary,
  FollowUpQueryParams,
  CreateFollowUpPayload,
  CompleteFollowUpPayload,
  RescheduleFollowUpPayload,
} from '@/types/api.types';

export const followUpApi = crmApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * GET /api/followups
     * List follow-ups with scope filtering and pagination.
     * Role-scoped: SE sees own; TL sees all or filtered by executiveId.
     */
    getFollowUps: builder.query<ApiResponse<FollowUpItem[]>, FollowUpQueryParams | void>({
      query: (params) => ({
        url: '/followups',
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'FollowUp' as const, id })),
              { type: 'FollowUp', id: 'LIST' },
            ]
          : [{ type: 'FollowUp', id: 'LIST' }],
    }),

    /**
     * GET /api/followups/summary
     * Aggregated counts: due today, upcoming, overdue, completed this month.
     */
    getFollowUpSummary: builder.query<ApiResponse<FollowUpSummary>, void>({
      query: () => '/followups/summary',
      providesTags: ['FollowUpSummary'],
    }),

    /**
     * POST /api/followups
     * Schedule a new follow-up task for a lead.
     */
    createFollowUp: builder.mutation<ApiResponse<FollowUpItem>, CreateFollowUpPayload>({
      query: (payload) => ({
        url: '/followups',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: [
        { type: 'FollowUp', id: 'LIST' },
        'FollowUpSummary',
        'Lead',
        { type: 'Leads', id: 'LIST' },
        'Dashboard',
        'Metrics',
      ],
    }),

    /**
     * PATCH /api/followups/:id/complete
     * Mark a follow-up as completed with optional outcome notes and next status.
     */
    completeFollowUp: builder.mutation<
      ApiResponse<FollowUpItem>,
      { id: string } & CompleteFollowUpPayload
    >({
      query: ({ id, ...body }) => ({
        url: `/followups/${id}/complete`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'FollowUp', id },
        { type: 'FollowUp', id: 'LIST' },
        'FollowUpSummary',
        'Lead',
        { type: 'Leads', id: 'LIST' },
        'Dashboard',
        'Metrics',
        'Workload',
      ],
    }),

    /**
     * PATCH /api/followups/:id/reschedule
     * Reschedule a follow-up to a new date/time.
     */
    rescheduleFollowUp: builder.mutation<
      ApiResponse<FollowUpItem>,
      { id: string } & RescheduleFollowUpPayload
    >({
      query: ({ id, ...body }) => ({
        url: `/followups/${id}/reschedule`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'FollowUp', id },
        { type: 'FollowUp', id: 'LIST' },
        'FollowUpSummary',
        'Dashboard',
      ],
    }),

    /**
     * DELETE /api/followups/:id
     * Soft-delete a follow-up task.
     */
    deleteFollowUp: builder.mutation<ApiResponse<{ success: boolean }>, string>({
      query: (id) => ({
        url: `/followups/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'FollowUp', id },
        { type: 'FollowUp', id: 'LIST' },
        'FollowUpSummary',
      ],
    }),

    /**
     * GET /api/leads/:leadId/followups
     * Retrieve the full follow-up timeline for a specific lead.
     */
    getLeadFollowUps: builder.query<ApiResponse<FollowUpItem[]>, string>({
      query: (leadId) => `/leads/${leadId}/followups`,
      providesTags: (_result, _error, leadId) => [
        { type: 'FollowUp', id: `lead-${leadId}` },
        { type: 'FollowUp', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetFollowUpsQuery,
  useGetFollowUpSummaryQuery,
  useCreateFollowUpMutation,
  useCompleteFollowUpMutation,
  useRescheduleFollowUpMutation,
  useDeleteFollowUpMutation,
  useGetLeadFollowUpsQuery,
} = followUpApi;
