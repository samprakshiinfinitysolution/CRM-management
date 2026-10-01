"use client";

import React, { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/types/api.types";
import { useAppSelector } from "@/store";
import { performLogout } from "@/lib/authService";
import LogOutPopUp from "@/components/LogOutPopUp";

export default function SalesExecutiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAppSelector((state) => state.auth);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await performLogout({ callBackend: true, redirectTo: "/" });
    } catch {
      await performLogout({ callBackend: false, redirectTo: "/" });
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "SE";

  return (
    <ProtectedRoute allowedRoles={[UserRole.SALES_EXECUTIVE]}>
      <div className="min-h-screen bg-crm-canvas text-crm-primary flex flex-col font-sans relative">
        {/* Sales Executive Header matching TLHeader */}
        <header className="fixed top-0 w-full z-50 bg-(--crm-brand-primary) backdrop-blur-xl border-b border-crm-subtle shadow-xs">
          <div className="max-w-7xl mx-auto h-16 px-4 flex items-center justify-between gap-3">
            {/* Brand & Sales Executive Workspace Context */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-crm-subtle flex items-center justify-center p-1.5 shrink-0">
                <div className="w-full h-full rounded-lg bg-linear-to-tr from-indigo-700 to-indigo-500 flex items-center justify-center text-white font-black text-sm shadow-inner">
                  LF
                </div>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white tracking-tight truncate leading-tight">
                    LeadFlow
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-crm-warning text-crm-dark text-[10px] font-bold tracking-wide leading-none shrink-0">
                    SE/REP
                  </span>
                </div>
                <div className="flex items-center gap-1 text-white/90">
                  <span className="text-xs font-medium truncate max-w-45">
                    Executive Workspace
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Info, Avatar & Logout PopUp */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-white">
                  {user?.name || "Sales Executive"}
                </span>
                <span className="text-[10px] text-white/80 font-medium">
                  {user?.email}
                </span>
              </div>

              <div
                className="w-9 h-9 rounded-xl bg-crm-dark text-crm-inverse flex items-center justify-center font-bold text-xs shadow-xs"
                title={`Logged in as ${user?.name || "Sales Executive"}`}
              >
                {initials}
              </div>

              <LogOutPopUp
                open={isLogoutModalOpen}
                setOpen={setIsLogoutModalOpen}
                onLogout={handleSignOut}
                isPending={isLoggingOut}
              />
            </div>
          </div>
        </header>

        {/* Main Content Area with offset for fixed header */}
        <div className="flex-1 w-full pt-16 transition-all duration-300">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}
