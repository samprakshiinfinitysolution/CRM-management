import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import { logout } from "../slices/authSlice";
import { getToken, removeToken } from "@/lib/utils";
import { toast } from "sonner";

const getApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // In production browser, route through Next.js proxy rewrites (/api)
  if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
    return "/api";
  }
  return "http://localhost:5000/api";
};

const API_BASE_URL = getApiBaseUrl();

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: "include", // Includes HTTPs-only cookies
  prepareHeaders: (headers, { getState }) => {
    // 1. Check Redux Auth State or Cookie/Storage
    const token = (getState() as RootState)?.auth?.token || getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Module-level flag prevents multiple concurrent 401 errors from triggering
// duplicate logout/redirect cycles when parallel requests all receive 401.
let isRedirecting = false;

const baseQueryWithSessionManagement: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    if (
      result.error.status === 401 &&
      typeof window !== "undefined" &&
      !isRedirecting
    ) {
      // Do not log out if the endpoint was /auth/login or /auth/register
      const endpoint = typeof args === "string" ? args : args.url;
      if (endpoint?.includes("/auth/login") || endpoint?.includes("/auth/register")) {
        return result;
      }

      api.dispatch(logout());
      removeToken();
      if (
        window.location.pathname !== "/" &&
        window.location.pathname !== "/login"
      ) {
        isRedirecting = true;
        toast.error("Your session has expired. Please sign in again.");
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = "/login";
      }
    }
  }

  return result;
};

/**
 * RTK Query Base API Slice
 * Centralizes network configuration, authentication tokens, credentials, and cache tags.
 */
export const crmApi = createApi({
  reducerPath: "crmApi",
  baseQuery: baseQueryWithSessionManagement,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  tagTypes: [
    "Auth",
    "Leads",
    "Lead",
    "Distribution",
    "Workload",
    "Escalations",
    "Metrics",
    "Executives",
    "ExecutiveDetail",
    "Dashboard",
    "FollowUp",
    "FollowUpSummary",
    "Imports",
    "AuditLogs",
    "Notifications",
  ],
  endpoints: () => ({}),
});
