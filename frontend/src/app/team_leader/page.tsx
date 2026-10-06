"use client";

import React from "react";
import {
  SupervisorBanner,
  UrgentAttentionBanner,
  PipelineMetricsGrid,
  PipelineFunnelBreakdown,
  ExecutiveWorkloadAudit,
  CriticalEscalations,
  RecentIntakeSnapshot,
} from "@/components/team_leader";
import FollowUpBanner from "@/components/dashboard/FollowUpBanner";
import { useGetTLDashboardMetricsQuery } from "@/store";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function TeamLeaderOverviewPage() {
  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useGetTLDashboardMetricsQuery(undefined, {
    pollingInterval: 30000, // Live poll every 30s for real-time supervisory sync
  });

  const dashboardData = response?.data;

  if (isError && !dashboardData) {
    return (
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-0 pt-6 pb-24">
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-lg flex flex-col items-center text-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-rose-900">
              Failed to load Team Leader Dashboard
            </h2>
            <p className="text-xs text-rose-700 mt-1 max-w-md">
              There was an error connecting to the CRM metrics service. Please
              check your network or try again.
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-0 pt-4 pb-24">
      <div className="flex flex-col gap-4">
        {/* Top Supervisor Profile & Operational Action Ribbon */}
        <SupervisorBanner supervisor={dashboardData?.supervisor} />

        {/* Follow-up Command Hub Banner */}
        <FollowUpBanner />

        {/* Urgent Attention Alert: Unassigned Leads */}
        <UrgentAttentionBanner
          data={dashboardData?.urgentAttention}
          isLoading={isLoading}
        />

        {/* KPI Health Matrix (2x2 Grid) */}
        <PipelineMetricsGrid
          data={dashboardData?.pipelineHealth}
          isLoading={isLoading}
        />

        {/* Pipeline Funnel Breakdown & Stage Distribution */}
        <PipelineFunnelBreakdown
          data={dashboardData?.funnelBreakdown}
          isLoading={isLoading}
        />

        {/* Sales Executive Workload & Capacity Audit */}
        <ExecutiveWorkloadAudit
          executives={dashboardData?.executiveWorkload}
          isLoading={isLoading}
        />

        {/* SLA Breaches & Critical Overdue Escalations */}
        <CriticalEscalations
          deals={dashboardData?.criticalEscalations}
          isLoading={isLoading}
        />

        {/* Recent Staged Batch Ingestion Snapshot */}
        <RecentIntakeSnapshot
          intake={dashboardData?.recentIntake}
          isLoading={isLoading}
        />
      </div>
    </main>
  );
}
