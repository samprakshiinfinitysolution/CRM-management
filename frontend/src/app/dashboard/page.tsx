'use client';

import React, { useState } from 'react';
import { useAppSelector } from '@/store';
import { UserRole } from '@/types/api.types';
import {
  SupervisorBanner,
  UrgentAttentionBanner,
  PipelineMetricsGrid,
  PipelineFunnelBreakdown,
  ExecutiveWorkloadAudit,
  CriticalEscalations,
  RecentIntakeSnapshot,
} from '@/components/team_leader';
import { useGetTLDashboardMetricsQuery } from '@/store';
import { AlertCircle, RefreshCw, Shield, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useGetFollowUpSummaryQuery } from '@/store/api/followUpApi';
import FollowUpStatsCards from '@/components/sales_executive/FollowUpStatsCards';
import FollowUpWorkQueue from '@/components/sales_executive/FollowUpWorkQueue';
import type { FollowUpScope } from '@/types/api.types';

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

  // SE Follow-up summary
  const { data: summaryData } = useGetFollowUpSummaryQuery(undefined, {
    skip: isTL,
  });
  const [activeScope, setActiveScope] = useState<FollowUpScope>('today');

  if (isTL) {
    const dashboardData = tlResponse?.data;

    if (isTLError && !dashboardData) {
      return (
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl flex flex-col items-center text-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-rose-900">
              Failed to load Supervisor Dashboard Metrics
            </h2>
            <p className="text-xs text-rose-700 mt-1 max-w-md">
              There was an error connecting to the CRM metrics service. Please check your network or try again.
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetchTL()}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-6">
        {/* Top Supervisor Profile & Operational Action Ribbon */}
        <SupervisorBanner supervisor={dashboardData?.supervisor} />

        {/* Urgent Attention Alert: Unassigned Leads */}
        <UrgentAttentionBanner
          data={dashboardData?.urgentAttention}
          isLoading={isTLLoading}
        />

        {/* KPI Health Matrix (2x2 Grid) */}
        <PipelineMetricsGrid
          data={dashboardData?.pipelineHealth}
          isLoading={isTLLoading}
        />

        {/* Pipeline Funnel Breakdown & Stage Distribution */}
        <PipelineFunnelBreakdown
          data={dashboardData?.funnelBreakdown}
          isLoading={isTLLoading}
        />

        {/* Sales Executive Workload & Capacity Audit */}
        <ExecutiveWorkloadAudit
          executives={dashboardData?.executiveWorkload}
          isLoading={isTLLoading}
        />

        {/* SLA Breaches & Critical Overdue Escalations */}
        <CriticalEscalations
          deals={dashboardData?.criticalEscalations}
          isLoading={isTLLoading}
        />

        {/* Recent Staged Batch Ingestion Snapshot */}
        <RecentIntakeSnapshot
          intake={dashboardData?.recentIntake}
          isLoading={isTLLoading}
        />
      </div>
    );
  }

  // Sales Executive Workspace
  const summary = summaryData?.data;

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome & RBAC Data Isolation Banner */}
      <section className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>DATA ISOLATED WORKBENCH</span>
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Welcome back, {user?.name || 'Executive'}
            </h2>
            <p className="text-xs text-slate-500">
              Manage your customer follow-ups and assigned lead pipeline in real time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <Link
            href="/dashboard/my-leads"
            className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
          >
            <span>My Assigned Leads</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Follow-up Summary Cards */}
      <FollowUpStatsCards
        activeScope={activeScope}
        onScopeSelect={(scope) => setActiveScope(scope)}
      />

      {/* Follow-Up Work Queue */}
      <FollowUpWorkQueue
        scope={activeScope}
        onScopeChange={(scope) => setActiveScope(scope)}
      />
    </div>
  );
}
