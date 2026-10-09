import { crmApi } from "./baseApi";
import type {
  ApiResponse,
  SalesExecutiveSummary,
  SalesExecutiveDetail,
} from "@/types/api.types";

export const userApi = crmApi.injectEndpoints({
  endpoints: (builder) => ({
    getSalesExecutives: builder.query<
      ApiResponse<SalesExecutiveSummary[]>,
      {
        search?: string;
        status?: string;
        workloadStatus?: string;
        page?: number;
        limit?: number;
      } | void
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

    getUsers: builder.query<
      ApiResponse<SalesExecutiveSummary[]>,
      {
        search?: string;
        status?: string;
        workloadStatus?: string;
        page?: number;
        limit?: number;
        role?: string;
      } | void
    >({
      query: (params) => ({
        url: "/users/",
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "Users" as const,
                id,
              })),
              { type: "Users", id: "LIST" },
            ]
          : [{ type: "Users", id: "LIST" }],
    }),

    getUserById: builder.query<ApiResponse<SalesExecutiveDetail>, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Users", id }],
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
        { type: "TeamLeaders", id },
        { type: "TeamLeaders", id: "LIST" },
        { type: "TeamLeaderDetail", id },
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
    toggleUserStatus: builder.mutation<
      ApiResponse<{ id: string; isActive: boolean }>,
      { id: string; isActive: boolean }
    >({
      query: ({ id, ...body }) => ({
        url: `/users/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
        { type: "Executives", id },
        { type: "Executives", id: "LIST" },
        { type: "TeamLeaders", id },
        { type: "TeamLeaders", id: "LIST" },
        "Workload",
      ],
    }),
    createUser: builder.mutation<
      ApiResponse<SalesExecutiveDetail>,
      { name: string; email: string; password?: string; role?: string }
    >({
      query: (body) => ({
        url: "/users",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Users", id: "LIST" },
        { type: "Executives", id: "LIST" },
        { type: "TeamLeaders", id: "LIST" },
        "Workload",
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSalesExecutivesQuery,
  useLazyGetSalesExecutivesQuery,
  useGetSalesExecutiveByIdQuery,
  useLazyGetSalesExecutiveByIdQuery,
  useGetUsersQuery,
  useLazyGetUsersQuery,
  useGetUserByIdQuery,
  useLazyGetUserByIdQuery,
  useToggleExecutiveStatusMutation,
  useToggleUserStatusMutation,
  useGetExecutivesQuery,
  useCreateUserMutation,
} = userApi;
