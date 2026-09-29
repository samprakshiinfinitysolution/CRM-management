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

export default function TeamLeaderOverviewPage() {
  return (
    <>
      {/* Main Dashboard Canvas */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-0 pt-4 pb-24">
        <div className="flex flex-col gap-2">
          {/* Top Supervisor Profile & Operational Action Ribbon */}
          <SupervisorBanner />

          {/* Urgent Attention Alert: Unassigned Leads */}
          <UrgentAttentionBanner />

          {/* KPI Health Matrix (2x2 Grid) */}
          <PipelineMetricsGrid />

          {/* Pipeline Funnel Breakdown & Stage Distribution */}
          <PipelineFunnelBreakdown />

          {/* Sales Executive Workload & Capacity Audit */}
          <ExecutiveWorkloadAudit />

          {/* SLA Breaches & Critical Overdue Escalations */}
          <CriticalEscalations />

          {/* Recent Staged Batch Ingestion Snapshot */}
          <RecentIntakeSnapshot />
        </div>
      </main>

      {/* Mobile/Responsive Fixed Bottom Navigation Bar (RTK state) */}
      {/*<TLBottomNav className="bottom-0" />*/}
    </>
  );
}
