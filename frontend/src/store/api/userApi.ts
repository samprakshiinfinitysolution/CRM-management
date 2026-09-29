import { crmApi } from './baseApi';
import type {
  ApiResponse,
  SalesExecutiveSummary,
  SalesExecutiveDetail,
} from '@/types/api.types';

export const userApi = crmApi.injectEndpoints({
  endpoints: (builder) => ({
    getSalesExecutives: builder.query<
      ApiResponse<SalesExecutiveSummary[]>,
      { search?: string; status?: string } | void
    >({
      query: (params) => ({
        url: "/users/sales-executives",
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "Executives" as const,
                id,
              })),
              { type: "Executives", id: "LIST" },
            ]
          : [{ type: "Executives", id: "LIST" }],
    }),

    getSalesExecutiveById: builder.query<
      ApiResponse<SalesExecutiveDetail>,
      string
    >({
      query: (id) => `/users/sales-executives/${id}`,
      providesTags: (_result, _error, id) => [{ type: "ExecutiveDetail", id }],
    }),

    toggleExecutiveStatus: builder.mutation<
      ApiResponse<{ id: string; isActive: boolean }>,
      { id: string; isActive: boolean }
    >({
      query: ({ id, ...body }) => ({
        url: `/users/sales-executives/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Executives", id },
        { type: "Executives", id: "LIST" },
        { type: "ExecutiveDetail", id },
        "Workload",
      ],
    }),
    getExecutives: builder.query<ApiResponse<SalesExecutiveDetail[]>, void>({
      query: () => "/users",
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "Executives" as const,
                id,
              })),
              { type: "Executives", id: "LIST" },
            ]
          : [{ type: "Executives", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSalesExecutivesQuery,
  useGetSalesExecutiveByIdQuery,
  useToggleExecutiveStatusMutation,
} = userApi;
