"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, User, LogOut, Loader2, Menu } from "lucide-react";
import { useAppSelector } from "@/store";
import { performLogout } from "@/lib/authService";
import LogOutPopUp from "@/components/LogOutPopUp";
import { UserRole } from "@/types/api.types";
import { useGetNotificationsQuery } from "@/store/api/notificationApi";

interface DashboardHeaderProps {
  onToggleMobileNav?: () => void;
}

export default function DashboardHeader({
  onToggleMobileNav,
}: DashboardHeaderProps) {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const { data: notifData } = useGetNotificationsQuery(undefined, {
    pollingInterval: 30000,
  });
  const unreadCount = notifData?.data?.filter((n) => !n.isRead).length || 0;

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await performLogout({ callBackend: true, redirectTo: "/login" });
    } catch {
      await performLogout({ callBackend: false, redirectTo: "/login" });
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  const isTL = user?.role === UserRole.TEAM_LEADER;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : isTL
      ? "TL"
      : "SE";

  return (
    <header className="fixed top-0 inset-x-0 h-16 z-40 bg-(--crm-brand-primary) border-b border-indigo-700/50 shadow-xs backdrop-blur-md">
      <div className="h-full px-4 flex items-center justify-between gap-3 mx-auto">
        {/* Left: Mobile Nav Toggle & Brand Logo */}
        <div className="flex items-center gap-3 min-w-0">
          {onToggleMobileNav && (
            <button
              type="button"
              onClick={onToggleMobileNav}
              className="lg:hidden p-2 rounded-xl text-white hover:bg-white/10 active:scale-95 transition-all"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white shadow-xs border border-crm-subtle flex items-center justify-center p-1 shrink-0">
              <div className="w-full h-full rounded-lg bg-gradient-to-tr from-indigo-700 to-indigo-500 flex items-center justify-center text-white font-black text-xs shadow-inner">
                LF
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white tracking-tight truncate leading-tight">
                  LeadFlow
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold tracking-wide leading-none shrink-0">
                  {isTL ? "TL/OPS" : "SE/REP"}
                </span>
              </div>
              <span className="text-[11px] text-white/80 font-medium truncate hidden sm:inline">
                {isTL ? "Supervisor Workspace" : "Executive Workbench"}
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Actions, Notifications, Profile, Logout */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/dashboard/notifications"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white relative active:scale-95 transition-all"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-[var(--crm-brand-primary)]">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          <Link
            href="/dashboard/profile"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-white transition-all"
            title="View Profile"
          >
            <div className="w-8 h-8 rounded-lg bg-white/20 border border-white/25 flex items-center justify-center text-xs font-bold text-white">
              {initials}
            </div>
            <div className="hidden lg:flex flex-col text-left min-w-0">
              <span className="text-xs font-semibold text-white truncate max-w-28">
                {user?.name || (isTL ? "Team Leader" : "Sales Executive")}
              </span>
              <span className="text-[10px] text-white/70 truncate max-w-28">
                {isTL ? "Supervisor" : "Executive"}
              </span>
            </div>
          </Link>

          <div className="hidden md:flex">
            <LogOutPopUp
              open={isLogoutModalOpen}
              setOpen={setIsLogoutModalOpen}
              onLogout={handleSignOut}
              onClose={() => setIsLogoutModalOpen(false)}
              isPending={isLoggingOut}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
