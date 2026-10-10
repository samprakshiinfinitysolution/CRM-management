"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { logout, setCredentials } from "@/store/slices/authSlice";
import { useGetMeQuery } from "@/store/api/authApi";
import { UserRole } from "@/types/api.types";
import { Button } from "../ui";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function FullPageLoader({
  title = "Verifying your session…",
  subtitle = "Checking authorization with LeadFlow CRM",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md select-none transition-colors">
      {/* Background ambient gradient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent dark:from-blue-600/15 pointer-events-none" />

      <div className="relative flex flex-col items-center max-w-sm w-full mx-4 p-8 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-2xl shadow-blue-500/5 text-center">
        {/* Animated Brand Emblem / Spinner */}
        <div className="relative flex items-center justify-center mb-5">
          <div className="size-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center border border-blue-100 dark:border-blue-900/60 shadow-inner">
            <Loader2 className="size-6 text-blue-600 dark:text-blue-400 animate-spin" />
          </div>
          <div className="absolute inset-0 rounded-2xl border-2 border-blue-500/20 dark:border-blue-400/20 animate-ping opacity-35" />
        </div>

        {/* Text Details */}
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 max-w-[260px] leading-relaxed">
            {subtitle}
          </p>
        )}

        {/* Shimmer loading bar */}
        <div className="w-36 h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-5 overflow-hidden">
          <div className="h-full w-1/2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/** Client-side UX guard. The server proxy and API remain authoritative for access. */
export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isLoggingOut = useAppSelector((state) => state.auth.isLoggingOut);
  const { data, isLoading, isError } = useGetMeQuery(undefined, {
    skip: isLoggingOut,
  });
  const user = data?.data;

  useEffect(() => {
    if (isLoggingOut) return;
    if (isError) {
      dispatch(logout());
      router.replace("/login");
      return;
    }
    if (user) dispatch(setCredentials({ user }));
  }, [dispatch, isError, router, user, isLoggingOut]);

  if (isLoggingOut) {
    return (
      <FullPageLoader
        title="Signing out…"
        subtitle="Safely ending your session and clearing credentials"
      />
    );
  }

  if (isLoading || !user) {
    return (
      <FullPageLoader
        title="Verifying your session…"
        subtitle="Checking authorization with LeadFlow CRM"
      />
    );
  }

  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-crm-canvas flex items-center justify-center p-4">
        <div className="max-w-sm rounded-xl border border-rose-200 dark:border-rose-800 bg-card p-6 text-center">
          <ShieldAlert className="mx-auto mb-3 size-8 text-rose-600 dark:text-rose-400" />
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Access restricted</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Your account does not have access to this page.
          </p>
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="rounded-full"
            >
              Go back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

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
