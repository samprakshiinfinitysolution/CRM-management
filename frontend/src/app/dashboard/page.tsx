"use client";

import React, { useState } from "react";
import { useAppSelector } from "@/store";
import { UserRole, type FollowUpScope } from "@/types/api.types";
import {
  UrgentAttentionBanner,
  PipelineMetricsGrid,
  PipelineFunnelBreakdown,
  ExecutiveWorkloadAudit,
  CriticalEscalations,
  RecentIntakeSnapshot,
} from "@/components/team_leader";
import { useGetTLDashboardMetricsQuery, useGetLeadsQuery } from "@/store";
import {
  AlertCircle,
  RefreshCw,
  Briefcase,
  ArrowRight,
  Phone,
  Mail,
} from "lucide-react";
import Link from "next/link";
import FollowUpStatsCards from "@/components/sales_executive/FollowUpStatsCards";
import FollowUpWorkQueue from "@/components/sales_executive/FollowUpWorkQueue";
import FollowUpBanner from "@/components/dashboard/FollowUpBanner";

export default function DashboardOverviewPage() {
  const { user } = useAppSelector((state) => state.auth);
  const isTL = user?.role === UserRole.TEAM_LEADER;

  // TL Metrics Query
  const {
    data: tlResponse,
    isLoading: isTLLoading,
    isError: isTLError,
    refetch: refetchTL,
  } = useGetTLDashboardMetricsQuery(undefined, {
    skip: !isTL,
    pollingInterval: 30000,
  });

  // Sales Executive queries
  const { data: recentLeadsRes, isLoading: isRecentLeadsLoading } =
    useGetLeadsQuery({ page: 1, limit: 4 }, { skip: isTL });

  const [activeScope, setActiveScope] = useState<FollowUpScope>("today");

  const recentLeads = recentLeadsRes?.data || [];

  // =========================================================================
  // TEAM LEADER DASHBOARD
  // =========================================================================
  if (isTL) {
    const dashboardData = tlResponse?.data;

    if (isTLError && !dashboardData) {
      return (
        <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 p-8 rounded-3xl flex flex-col items-center text-center gap-3 shadow-xs">
          <div className="w-12 h-12 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Unable to load supervisor overview
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
              We couldn&apos;t connect to the metrics service right now. Please
              check your connection or retry.
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetchTL()}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all mt-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-6 pb-8">
        {/* Key Performance Indicators */}
        <PipelineMetricsGrid
          data={dashboardData?.pipelineHealth}
          isLoading={isTLLoading}
        />

        {/* Follow-up Command Hub Banner */}
        <FollowUpBanner />

        {/* Incoming Leads Notification */}
        <UrgentAttentionBanner
          data={dashboardData?.urgentAttention}
          isLoading={isTLLoading}
        />

        {/* Middle Section: Funnel Breakdown & Overdue Escalations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PipelineFunnelBreakdown
            data={dashboardData?.funnelBreakdown}
            isLoading={isTLLoading}
          />
          <CriticalEscalations
            deals={dashboardData?.criticalEscalations}
            isLoading={isTLLoading}
          />
        </div>

        {/* Team Workload & Active Leads Table */}
        <ExecutiveWorkloadAudit
          executives={dashboardData?.executiveWorkload}
          isLoading={isTLLoading}
        />

        {/* Recent Imports */}
        <RecentIntakeSnapshot
          intake={dashboardData?.recentIntake}
          isLoading={isTLLoading}
        />
      </div>
    );
  }

  // =========================================================================
  // SALES EXECUTIVE DASHBOARD
  // =========================================================================
  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* 3. Follow-up Velocity & Queue Stats */}
      <FollowUpStatsCards
        activeScope={activeScope}
        onScopeSelect={(scope) => setActiveScope(scope)}
      />

      {/* 2. Follow-up Command Hub Banner */}
      <FollowUpBanner defaultExpanded={false} />

      {/* 4. Priority Work Queue (Interactive Tasks) */}
      <FollowUpWorkQueue
        scope={activeScope}
        onScopeChange={(scope) => setActiveScope(scope)}
      />

      {/* 5. Recent Assigned Leads Quick Action Grid */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
              <span>Recently Assigned Leads</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              High-priority leads currently in your active conversion pipeline
            </p>
          </div>

          <Link
            href="/dashboard/my-leads"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Leads</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isRecentLeadsLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold">
              Loading active pipeline...
            </span>
          </div>
        ) : recentLeads.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-850/40">
            <Briefcase className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No active assigned leads
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              New leads assigned by your team leader will appear here
              immediately.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {recentLeads.slice(0, 4).map((lead) => {
              const formattedBudget =
                lead.budget && Number(lead.budget) > 0
                  ? `₹${Number(lead.budget).toLocaleString("en-IN")}`
                  : "Budget TBD";

              return (
                <div
                  key={lead.id}
                  className="flex flex-col justify-between p-4 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-2xs group"
                >
                  <div className="space-y-2">
                    {/* Header: Code & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200/60 dark:border-indigo-800">
                        {lead.leadCode}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {lead.status.replace("_", " ")}
                      </span>
                    </div>

                    {/* Customer Info */}
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {lead.customerName}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {lead.requirement || "General Requirement"}
                      </p>
                    </div>

                    {/* Meta: Budget & City */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {formattedBudget}
                      </span>
                      <span>{lead.city || "India"}</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      {lead.mobile && (
                        <a
                          href={`tel:${lead.mobile}`}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-xs transition-colors"
                          title={`Call ${lead.mobile}`}
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}`}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-xs transition-colors"
                          title={`Email ${lead.email}`}
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    <Link
                      href={`/dashboard/leads/${lead.id}`}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
