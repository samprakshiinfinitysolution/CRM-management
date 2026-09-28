'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import {
  TLHeader,
  TLBottomNav,
} from '@/components/team_leader';
import {
  ExecutiveStatsCards,
  ExecutiveFilters,
  ExecutivesTable,
  ExecutiveDetailDrawer,
} from '@/components/team_leader/executives';
import { useGetSalesExecutivesQuery } from '@/store';

export default function SalesExecutivesManagementPage() {
  const {
    data: execRes,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetSalesExecutivesQuery();

  const executives = execRes?.data || [];

  const handleRefresh = async () => {
    try {
      await refetch().unwrap();
      toast.success('Executive workload & metrics updated');
    } catch {
      toast.error('Failed to refresh executive directory');
    }
  };

  return (
    <div className="min-h-screen bg-crm-canvas text-crm-primary flex flex-col font-sans">
      {/* Fixed Supervisor Header */}
      <TLHeader />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 pt-20 pb-24 flex flex-col gap-4">
        {/* Navigation Breadcrumb Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-crm-subtle shadow-xs">
          <div className="flex items-center gap-3">
            <Link
              href="/team_leader"
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
              title="Return to Overview Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <span>Sales Executives Directory</span>
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">
                  {executives.length} Staff
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitor individual workload quotas, conversion funnels, and assigned leads.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading || isFetching}
              title="Refresh Data"
              className="h-9 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-indigo-600' : ''}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Executive KPI Summary Cards */}
        <ExecutiveStatsCards executives={executives} isLoading={isLoading} />

        {/* Real-time Filter & Search Bar */}
        <ExecutiveFilters />

        {/* Comprehensive Executives Table */}
        <ExecutivesTable
          executives={executives}
          isLoading={isLoading}
          error={error}
          onRefresh={handleRefresh}
        />

        {/* Individual Executive Detail Slide-Over Drawer */}
        <ExecutiveDetailDrawer />
      </main>

      {/* Mobile / Responsive Bottom Navigation */}
      <TLBottomNav />
    </div>
  );
}