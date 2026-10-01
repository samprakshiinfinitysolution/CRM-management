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
import { AlertCircle, RefreshCw, Briefcase, CalendarCheck2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
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

  const [activeScope, setActiveScope] = useState<FollowUpScope>('today');

  if (isTL) {
    const dashboardData = tlResponse?.data;

    if (isTLError && !dashboardData) {
      return (
        <div className="bg-white border border-rose-200 p-8 rounded-2xl flex flex-col items-center text-center gap-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Unable to load supervisor overview
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md">
              We couldn&apos;t connect to the metrics service right now. Please check your connection or retry.
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetchTL()}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all mt-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-6">
        {/* Top Supervisor Overview Ribbon */}
        <SupervisorBanner supervisor={dashboardData?.supervisor} />

        {/* Incoming Leads Notification */}
        <UrgentAttentionBanner
          data={dashboardData?.urgentAttention}
          isLoading={isTLLoading}
        />

        {/* Key Performance Indicators */}
        <PipelineMetricsGrid
          data={dashboardData?.pipelineHealth}
          isLoading={isTLLoading}
        />

        {/* Pipeline Stage Distribution */}
        <PipelineFunnelBreakdown
          data={dashboardData?.funnelBreakdown}
          isLoading={isTLLoading}
        />

        {/* Team Workload & Active Leads */}
        <ExecutiveWorkloadAudit
          executives={dashboardData?.executiveWorkload}
          isLoading={isTLLoading}
        />

        {/* Overdue Follow-ups */}
        <CriticalEscalations
          deals={dashboardData?.criticalEscalations}
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

  // Sales Executive Workspace
  return (
    <div className="flex flex-col gap-6">
      {/* Friendly Welcome Card */}
      <section className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <CalendarCheck2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Welcome back, {user?.name || 'Sales Rep'}!
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Here is your daily follow-up queue and assigned leads summary.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <Link
            href="/dashboard/my-leads"
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <Briefcase className="w-4 h-4" />
            <span>View My Assigned Leads</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
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
