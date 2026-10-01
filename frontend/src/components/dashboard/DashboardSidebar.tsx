"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GitFork,
  CalendarClock,
  BarChart3,
  UploadCloud,
  Bell,
  ShieldCheck,
  UserCheck,
  Briefcase,
  ChevronRight,
  Sparkles,
  X,
  CircleX,
} from "lucide-react";
import { useAppSelector } from "@/store";
import { UserRole } from "@/types/api.types";
import { performLogout } from "@/lib/authService";
import LogOutPopUp from "../LogOutPopUp";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  exact?: boolean;
  badge?: string;
}

interface DashboardSidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

const tlNavItems: NavItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  { label: "Leads", href: "/dashboard/leads", icon: Users },
  {
    label: "Distributions",
    href: "/dashboard/distributions",
    icon: GitFork,
    badge: "TL",
  },
  { label: "Follow-ups", href: "/dashboard/follow-ups", icon: CalendarClock },
  { label: "Sales Team", href: "/dashboard/users", icon: Users, badge: "TL" },
  {
    label: "Reports",
    href: "/dashboard/reports",
    icon: BarChart3,
    badge: "TL",
  },
  {
    label: "Excel Imports",
    href: "/dashboard/imports",
    icon: UploadCloud,
    badge: "TL",
  },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  {
    label: "Audit Logs",
    href: "/dashboard/audit-logs",
    icon: ShieldCheck,
    badge: "TL",
  },
  { label: "Profile", href: "/dashboard/profile", icon: UserCheck },
];

const seNavItems: NavItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "My Leads",
    href: "/dashboard/my-leads",
    icon: Briefcase,
    badge: "SE",
  },
  { label: "Follow-ups", href: "/dashboard/follow-ups", icon: CalendarClock },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Profile", href: "/dashboard/profile", icon: UserCheck },
];

export default function DashboardSidebar({
  isOpenMobile = false,
  onCloseMobile,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.auth);
  const isTL = user?.role === UserRole.TEAM_LEADER;

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

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

  const items = isTL ? tlNavItems : seNavItems;

  const isLinkActive = (item: NavItem) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  useEffect(() => {
    if (isOpenMobile) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpenMobile]);

  return (
    <>
      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 lg:top-16 bottom-0 left-0 z-50 lg:z-30 w-64 bg-white border-r border-slate-200/80 shadow-xs flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Backdrop */}
        {isOpenMobile && (
          <div
            role="button"
            tabIndex={0}
            onClick={onCloseMobile}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onCloseMobile?.();
              }
            }}
            className="absolute inset-0 left-[92%] top-2 z-40 lg:hidden"
            aria-label="Close navigation"
          >
            <X className="size-5 text-crm-brand" />
          </div>
        )}
        {/* Role Workspace Banner */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Workspace Context
            </span>
            <span className="text-xs font-bold text-slate-800">
              {isTL ? "Supervisor Control" : "Sales Executive Portal"}
            </span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isTL
                ? "bg-amber-50 text-amber-700 border border-amber-200"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            }`}
          >
            {isTL ? "TL ROLE" : "SE ROLE"}
          </span>
        </div>

        {/* Navigation Items */}
        <style dangerouslySetInnerHTML={{ __html: `
          .sidebar-nav-scroll {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }
          .sidebar-nav-scroll::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
            background: transparent !important;
          }
        `}} />
        <nav
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
          className="flex-1 overflow-y-auto p-3 space-y-1 no-scrollbar sidebar-nav-scroll"
        >
          {items.map((item) => {
            const active = isLinkActive(item);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? "bg-indigo-50 text-indigo-700 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                      active
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-500 group-hover:text-slate-800 group-hover:bg-slate-200"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        active
                          ? "bg-indigo-100 text-indigo-800"
                          : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {active && (
                    <ChevronRight className="w-3.5 h-3.5 text-indigo-600" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer Quick Action / Status */}
        <div className="p-3 flex justify-between rounded-xl bg-linear-to-br from-indigo-50 to-blue-50 border border-indigo-100">
          <div className="p-2.5  flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-indigo-950 truncate">
                Authoritative CRM
              </span>
              <span className="text-[10px] text-indigo-700/80 truncate">
                ACID Ingestion & RBAC
              </span>
            </div>
          </div>

          <div className="md:hidden">
            <LogOutPopUp
              open={isLogoutModalOpen}
              setOpen={setIsLogoutModalOpen}
              onLogout={handleSignOut}
              onClose={() => setIsLogoutModalOpen(false)}
              isPending={isLoggingOut}
            />
          </div>
        </div>
      </aside>
    </>
  );
}
