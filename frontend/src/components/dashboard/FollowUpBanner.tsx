"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store";
import {
  useGetFollowUpsQuery,
  useGetFollowUpSummaryQuery,
} from "@/store/api/followUpApi";
import {
  UserRole,
  type FollowUpItem,
  type FollowUpType,
} from "@/types/api.types";
import {
  CalendarClock,
  AlertTriangle,
  Clock,
  Phone,
  MessageSquare,
  Mail,
  Users,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  RotateCcw,
  CalendarCheck,
  UserCheck,
  Building2,
  ArrowRight,
} from "lucide-react";
import CompleteFollowUpModal from "@/components/sales_executive/CompleteFollowUpModal";
import RescheduleFollowUpModal from "@/components/sales_executive/RescheduleFollowUpModal";

interface FollowUpBannerProps {
  className?: string;
  defaultExpanded?: boolean;
}

export default function FollowUpBanner({
  className = "",
  defaultExpanded = false,
}: FollowUpBannerProps) {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const isTL = user?.role === UserRole.TEAM_LEADER;

  // TL can toggle between "My Follow-ups" and "Team Follow-ups"
  const [tlViewMode, setTlViewMode] = useState<"my" | "team">("my");
  const [activeTab, setActiveTab] = useState<"today" | "overdue">("today");
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Selected follow-up for action modals
  const [completingFollowUp, setCompletingFollowUp] =
    useState<FollowUpItem | null>(null);
  const [reschedulingFollowUp, setReschedulingFollowUp] =
    useState<FollowUpItem | null>(null);

  // Determine query executive filter
  // For SE: backend automatically scopes to user.id
  // For TL: 'my' passes executiveId=user.id, 'team' passes undefined (all team)
  const executiveId = isTL && tlViewMode === "my" ? user?.id : undefined;

  // Summary counts
  const { data: summaryRes } = useGetFollowUpSummaryQuery(undefined, {
    pollingInterval: 30000,
  });
  const summary = summaryRes?.data;

  // Today's follow-ups query (scheduledAt >= startOfToday && scheduledAt <= endOfToday, status: PENDING)
  const {
    data: todayRes,
    isLoading: isTodayLoading,
    isFetching: isTodayFetching,
  } = useGetFollowUpsQuery(
    {
      scope: "today",
      executiveId,
      limit: 10,
    },
    {
      pollingInterval: 30000,
    },
  );

  // Pending / Overdue follow-ups query (scheduledAt < startOfToday, status: PENDING)
  const {
    data: overdueRes,
    isLoading: isOverdueLoading,
    isFetching: isOverdueFetching,
  } = useGetFollowUpsQuery(
    {
      scope: "overdue",
      executiveId,
      limit: 10,
    },
    {
      pollingInterval: 30000,
    },
  );

  const todayList = todayRes?.data || [];
  const overdueList = overdueRes?.data || [];

  const todayCount =
    isTL && tlViewMode === "team"
      ? (summary?.dueToday ?? todayList.length)
      : todayList.length;

  const overdueCount =
    isTL && tlViewMode === "team"
      ? (summary?.overdue ?? overdueList.length)
      : overdueList.length;

  const currentList = activeTab === "today" ? todayList : overdueList;
  const isCurrentLoading =
    activeTab === "today" ? isTodayLoading : isOverdueLoading;
  const isCurrentFetching =
    activeTab === "today" ? isTodayFetching : isOverdueFetching;

  const getTypeIcon = (type: FollowUpType | string) => {
    switch (type) {
      case "Call":
        return <Phone className="w-3.5 h-3.5 text-blue-600" />;
      case "WhatsApp":
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />;
      case "Email":
        return <Mail className="w-3.5 h-3.5 text-amber-600" />;
      case "Meeting":
        return <Users className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const formatScheduledTime = (isoString: string, isOverdue: boolean) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;

      if (isOverdue) {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) {
          return `${diffDays}d overdue (${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })})`;
        }
        return `${Math.max(1, diffHours)}h overdue (${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })})`;
      }

      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  return (
    <>
      <section
        className={`bg-white rounded-lg border transition-all duration-200 shadow-xs overflow-hidden ${
          overdueCount > 0
            ? "border-amber-200/90 hover:border-amber-300"
            : "border-slate-200/90 hover:border-slate-300"
        } ${className}`}
        aria-label="Follow-ups Overview Banner"
      >
        {/* Banner Header Ribbon */}
        <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-linear-to-r from-slate-50/80 via-white to-indigo-50/30">
          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
            <div
              className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 shadow-2xs border ${
                overdueCount > 0
                  ? "bg-amber-50 border-amber-200 text-amber-600"
                  : "bg-indigo-50 border-indigo-200 text-indigo-600"
              }`}
            >
              {overdueCount > 0 ? (
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              ) : (
                <CalendarClock className="w-5 h-5" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Follow-Up Command Hub
                </span>
                {isTL && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    SUPERVISOR VIEW
                  </span>
                )}
                {overdueCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    ACTION REQUIRED
                  </span>
                )}
              </div>

              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2 truncate">
                <span>
                  {todayCount === 0 && overdueCount === 0
                    ? "You are all caught up on follow-ups!"
                    : overdueCount > 0
                      ? `${overdueCount} Pending Overdue • ${todayCount} Due Today`
                      : `${todayCount} Follow-Up${todayCount > 1 ? "s" : ""} Scheduled For Today`}
                </span>
              </h2>

              <p className="text-xs text-slate-500 truncate max-w-xl">
                {isTL
                  ? tlViewMode === "my"
                    ? "Showing your personal follow-up schedule and SLA commitments."
                    : "Supervising all pending and active follow-up tasks across your team."
                  : "Stay on top of customer touches to maintain high conversion rates and avoid SLA breaches."}
              </p>
            </div>
          </div>

          {/* Quick Controls & Tabs */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 self-stretch sm:self-auto justify-between sm:justify-end">
            {/* TL Scope Toggle: My vs Team */}
            {isTL && (
              <div className="inline-flex p-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setTlViewMode("my")}
                  className={`px-2.5 py-1 rounded-lg transition-all text-xs font-semibold cursor-pointer ${
                    tlViewMode === "my"
                      ? "bg-white text-indigo-700 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  My Follow-ups
                </button>
                <button
                  type="button"
                  onClick={() => setTlViewMode("team")}
                  className={`px-2.5 py-1 rounded-lg transition-all text-xs font-semibold cursor-pointer ${
                    tlViewMode === "team"
                      ? "bg-white text-indigo-700 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Team Queue
                </button>
              </div>
            )}

            {/* Today Pill Button */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("today");
                setIsExpanded(true);
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "today" && isExpanded
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Today&apos;s List</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === "today" && isExpanded
                    ? "bg-white/20 text-white"
                    : "bg-indigo-50 text-indigo-700"
                }`}
              >
                {todayCount}
              </span>
            </button>

            {/* Pending / Overdue Pill Button */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("overdue");
                setIsExpanded(true);
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "overdue" && isExpanded
                  ? "bg-rose-600 border-rose-600 text-white shadow-xs"
                  : overdueCount > 0
                    ? "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Pending List</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === "overdue" && isExpanded
                    ? "bg-white/20 text-white"
                    : overdueCount > 0
                      ? "bg-rose-200 text-rose-900"
                      : "bg-slate-100 text-slate-700"
                }`}
              >
                {overdueCount}
              </span>
            </button>

            {/* Expand / Collapse Toggle */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
              title={
                isExpanded
                  ? "Collapse follow-ups list"
                  : "Expand follow-ups list"
              }
              aria-label={
                isExpanded
                  ? "Collapse follow-ups list"
                  : "Expand follow-ups list"
              }
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Follow-up Item List */}
        {isExpanded && (
          <div className="border-t border-slate-200/80 bg-slate-50/50 p-4 sm:p-5">
            {/* List Sub-Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-200/60">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">
                  {activeTab === "today"
                    ? `Today's Follow-up Queue (${currentList.length})`
                    : `Pending / Overdue Follow-ups (${currentList.length})`}
                </span>
                {isCurrentFetching && (
                  <span className="text-[10px] text-slate-400 animate-pulse">
                    Refreshing...
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard/follow-ups"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
                >
                  <span>Open Full Follow-Up Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Loading Skeleton */}
            {isCurrentLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg bg-white border border-slate-200 animate-pulse flex flex-col gap-2.5"
                  >
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                    <div className="h-3 bg-slate-100 rounded w-3/4"></div>
                    <div className="h-8 bg-slate-50 rounded mt-2"></div>
                  </div>
                ))}
              </div>
            ) : currentList.length === 0 ? (
              /* Empty State */
              <div className="py-8 px-4 rounded-lg bg-white border border-dashed border-slate-200 flex flex-col items-center justify-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-slate-800">
                  {activeTab === "today"
                    ? "No follow-ups scheduled for today"
                    : "No pending or overdue follow-ups"}
                </h3>
                <p className="text-[11px] text-slate-500 max-w-sm">
                  {activeTab === "today"
                    ? "Great job! All scheduled customer interactions for today have been completed."
                    : "Excellent work maintaining prompt SLAs with no overdue records."}
                </p>
              </div>
            ) : (
              /* Follow-ups Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {currentList.map((item) => {
                  const isItemOverdue =
                    activeTab === "overdue" ||
                    new Date(item.scheduledAt).getTime() <
                      new Date().setHours(0, 0, 0, 0);

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg p-3.5 border border-slate-200/90 hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between gap-3 group"
                    >
                      {/* Top Row: Type, Scheduled Time & Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800">
                            {getTypeIcon(item.type)}
                            <span>{item.type}</span>
                          </span>

                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${
                              isItemOverdue
                                ? "bg-rose-50 border-rose-200 text-rose-700"
                                : "bg-indigo-50 border-indigo-200 text-indigo-700"
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>
                              {formatScheduledTime(
                                item.scheduledAt,
                                isItemOverdue,
                              )}
                            </span>
                          </span>
                        </div>

                        {item.lead?.leadCode && (
                          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                            {item.lead.leadCode}
                          </span>
                        )}
                      </div>

                      {/* Middle: Customer Details */}
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h4
                            onClick={() =>
                              router.push(`/dashboard/leads/${item.leadId}`)
                            }
                            className="text-xs font-bold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer truncate"
                          >
                            {item.lead?.customerName || "Customer Lead"}
                          </h4>
                          {item.lead?.status && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-100 text-slate-600 shrink-0">
                              {item.lead.status.replace(/_/g, " ")}
                            </span>
                          )}
                        </div>

                        {item.lead?.companyName && (
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{item.lead.companyName}</span>
                          </p>
                        )}

                        {/* TL Team assignee badge */}
                        {isTL && tlViewMode === "team" && item.assignedTo && (
                          <div className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                            <UserCheck className="w-3 h-3 text-indigo-500" />
                            <span>Assigned: {item.assignedTo.name}</span>
                          </div>
                        )}

                        {item.notes && (
                          <p className="text-[11px] text-slate-600 italic bg-amber-50/50 p-1.5 rounded-lg border border-amber-100/80 mt-2 line-clamp-2">
                            &quot;{item.notes}&quot;
                          </p>
                        )}
                      </div>

                      {/* Bottom Quick Action Buttons */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                        {/* Direct Contact Links */}
                        <div className="flex items-center gap-1">
                          {item.lead?.mobile && (
                            <>
                              <a
                                href={`tel:${item.lead.mobile}`}
                                className="p-1.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                                title={`Call ${item.lead.mobile}`}
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                              <a
                                href={`https://wa.me/${item.lead.mobile.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 transition-colors cursor-pointer"
                                title="Open WhatsApp"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </a>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              router.push(`/dashboard/leads/${item.leadId}`)
                            }
                            className="p-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
                            title="View Lead File"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Complete & Reschedule actions */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setReschedulingFollowUp(item)}
                            className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3 text-slate-500" />
                            <span>Reschedule</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setCompletingFollowUp(item)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Complete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Complete Follow-up Modal */}
      {completingFollowUp && (
        <CompleteFollowUpModal
          followUp={completingFollowUp}
          open={!!completingFollowUp}
          onClose={() => setCompletingFollowUp(null)}
        />
      )}

      {/* Reschedule Follow-up Modal */}
      {reschedulingFollowUp && (
        <RescheduleFollowUpModal
          followUp={reschedulingFollowUp}
          open={!!reschedulingFollowUp}
          onClose={() => setReschedulingFollowUp(null)}
        />
      )}
    </>
  );
}
