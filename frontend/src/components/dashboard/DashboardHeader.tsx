"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bell, Menu } from "lucide-react";
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
    <header className="fixed top-0 inset-x-0 h-16 z-40 bg-brand-primary border-b border-slate-200/80 shadow-2xs">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-3 mx-auto ">
        {/* Left: Mobile Nav Toggle & Brand Logo */}
        <div className="flex items-center gap-3 min-w-0">
          {onToggleMobileNav && (
            <button
              type="button"
              onClick={onToggleMobileNav}
              className="lg:hidden p-2 rounded-xl text-card hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-indigo-600 to-blue-600 shadow-xs flex items-center justify-center text-white font-bold text-sm shrink-0">
              LF
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-card tracking-tight truncate leading-tight">
                  LeadFlow
                </span>
                <span className="px-2 py-0.5 rounded-full bg-card border border-indigo-100 text-indigo-700 text-[10px] font-semibold tracking-wide leading-none shrink-0">
                  {isTL ? "Team Leader" : "Sales Rep"}
                </span>
              </div>
              <span className="text-[11px] text-card/70 font-medium truncate hidden sm:inline">
                {isTL ? "Supervisor Dashboard" : "Personal Workspace"}
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Notifications, Profile, Logout */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/dashboard/notifications"
            className="w-9 h-9 flex items-center justify-center rounded-xl text-card hover:text-white hover:bg-white/10 relative active:scale-95 transition-all"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-brand-primary shadow-xs">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          <Link
            href="/dashboard/profile"
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-all"
            title="View Profile"
          >
            <div className="w-8 h-8 rounded-lg bg-card text-indigo-700 font-bold flex items-center justify-center text-xs">
              {initials}
            </div>
            <div className="hidden lg:flex flex-col text-left min-w-0">
              <span className="text-xs font-semibold text-card truncate max-w-28">
                {user?.name || (isTL ? "Team Leader" : "Sales Executive")}
              </span>
              <span className="text-[11px] text-card/70 truncate max-w-28">
                {user?.email || (isTL ? "Supervisor" : "Sales Rep")}
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
