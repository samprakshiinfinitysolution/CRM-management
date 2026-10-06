"use client";

import React, { useEffect, useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  useAppSelector,
  useAppDispatch,
  setCredentials,
  logout,
} from "@/store";
import { getToken, removeToken } from "@/lib/utils";
import { performLogout } from "@/lib/authService";
import { decodeJwt } from "@/lib/jwt";
import { UserRole } from "@/types/api.types";
import {
  ShieldAlert,
  ShieldCheck,
  Loader2,
  ArrowRight,
  LogOut,
} from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const emptySubscribe = () => () => {};
const useIsMounted = () => {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
};

/**
 * Reusable RBAC Protected Route Component
 * Validates authentication status, navigates to "/" when token is not found,
 * rehydrates Redux state on reload, and restricts access based on UserRole.
 */
export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isMounted = useIsMounted();
  const { user } = useAppSelector((state) => state.auth);

  // Cookie is authoritative source of truth for persistent authentication
  const cookieToken = isMounted ? getToken() : "";

  const hasToken = Boolean(cookieToken?.trim());

  const decoded = useMemo(() => {
    if (!hasToken) return null;

    return decodeJwt(cookieToken);
  }, [cookieToken, hasToken]);

  const currentRole = user?.role ?? decoded?.role;

  const isAccessDenied = Boolean(
    isMounted &&
    hasToken &&
    decoded &&
    currentRole &&
    allowedRoles?.length &&
    !allowedRoles.includes(currentRole),
  );

  const isAuthorized = Boolean(
    isMounted &&
    hasToken &&
    decoded &&
    currentRole &&
    (!allowedRoles?.length || allowedRoles.includes(currentRole)),
  );

  useEffect(() => {
    if (!isMounted) return;

    const token = getToken();

    // No token
    if (!token?.trim()) {
      dispatch(logout());
      router.replace("/");
      return;
    }

    // Invalid / expired token
    const decodedToken = decodeJwt(token);

    if (!decodedToken) {
      removeToken();
      dispatch(logout());
      router.replace("/");
      return;
    }

    // Restore Redux state after page refresh
    if (!user) {
      dispatch(
        setCredentials({
          user: {
            id: decodedToken.id,
            name:
              decodedToken.name ||
              (decodedToken.role === UserRole.TEAM_LEADER
                ? "Team Leader"
                : "Sales Executive"),
            email: decodedToken.email,
            role: decodedToken.role,
            isActive: true,
          },
          token,
        }),
      );
    }
  }, [isMounted, user, dispatch, router]);

  // Loading State - Rendered while verifying session or redirecting to "/"
  if (!isMounted || (!isAuthorized && !isAccessDenied)) {
    return (
      <div className="min-h-screen bg-crm-canvas flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 bg-white border border-slate-200/80 rounded-lg p-8 max-w-sm w-full text-center shadow-lg">
          <div className="relative flex items-center justify-center w-14 h-14 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
            <ShieldCheck className="w-7 h-7 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600"></span>
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <h3 className="text-base font-semibold text-slate-900 tracking-tight">
              Verifying IAM Permissions
            </h3>
            <p className="text-xs text-slate-500">
              Checking credentials & workspace authorization...
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-1.5 w-full justify-center">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
            <span className="font-medium">Securing LeadFlow Workspace</span>
          </div>
        </div>
      </div>
    );
  }

  // Access Denied State (403 Forbidden)
  if (isAccessDenied) {
    const targetRoute =
      currentRole === UserRole.TEAM_LEADER
        ? "/team_leader"
        : "/sales_executive";

    return (
      <div className="min-h-screen bg-crm-canvas flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-5 bg-white border border-rose-200 rounded-lg p-8 max-w-md w-full text-center shadow-lg">
          <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-rose-50 border border-rose-100 text-rose-600">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="inline-flex items-center justify-center self-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
              403 FORBIDDEN
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Access Restricted by RBAC Policy
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your active account role is not authorized to access this portal.
              This incident has been logged for security compliance.
            </p>
          </div>

          <div className="w-full bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs flex flex-col gap-2 text-left">
            <div className="flex items-center justify-between text-slate-600">
              <span>Your Active Role:</span>
              <span className="font-semibold text-amber-700">
                {currentRole || "Unassigned"}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Required Role:</span>
              <span className="font-semibold text-emerald-700">
                {allowedRoles?.join(" / ") || "None"}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 w-full pt-1">
            <button
              onClick={() => router.push(targetRoute)}
              className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <span>Go to My Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={async () => {
                await performLogout({ callBackend: true, redirectTo: "/" });
              }}
              className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Higher-Order Component (HOC) wrapper for route protection
 * Usage:
 * export default withAuth(TeamLeaderOverviewPage, [UserRole.TEAM_LEADER]);
 */
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles?: UserRole[],
) {
  return function WithAuthComponent(props: P) {
    return (
      <ProtectedRoute allowedRoles={allowedRoles}>
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };
}

export default ProtectedRoute;
