'use client';

import React from 'react';
import {
  TLHeader,
  SupervisorBanner,
  UrgentAttentionBanner,
  PipelineMetricsGrid,
  PipelineFunnelBreakdown,
  ExecutiveWorkloadAudit,
  CriticalEscalations,
  RecentIntakeSnapshot,
  TLBottomNav,
} from '@/components/team_leader';

export default function TeamLeaderOverviewPage() {
  return (
    <div className="min-h-screen bg-crm-canvas text-crm-primary flex flex-col font-sans">
      {/* Fixed Supervisor Header */}
      <TLHeader />

      {/* Main Dashboard Canvas */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 pt-16 pb-24">
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
      <TLBottomNav />
    </div>
  );
}