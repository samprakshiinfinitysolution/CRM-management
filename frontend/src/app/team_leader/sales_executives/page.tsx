'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Send, Zap } from 'lucide-react';
import { toast } from 'sonner';
import {
  ExecutiveHeader,
  ExecutiveStatsCards,
  ExecutiveFilters,
  ExecutiveCardStreamView,
  ExecutivesTable,
  ExecutiveDetailDrawer,
} from '@/components/team_leader/executives';
import { useGetSalesExecutivesQuery, useAppSelector } from '@/store';
import { useState } from 'react';

export default function SalesExecutivesManagementPage() {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalUnassignedCount, setTotalUnassignedCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const {
    data: execRes,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetSalesExecutivesQuery({page, limit});
  

  const {
    searchQuery,
    statusFilter,
    workloadFilter,
    sortBy,
    viewMode,
  } = useAppSelector((state) => state.executive);

  const executives = execRes?.data || [];

  const handleRefresh = async () => {
    try {
      await refetch().unwrap();
      toast.success('Executive workload & metrics updated');
    } catch {
      toast.error('Failed to refresh executive directory');
    }
  };

  // Filter and sort executives in memory for instant UX responsiveness
  const filteredExecutives = useMemo(() => {
    const filtered = executives.filter((exec) => {
      // Status filter
      if (statusFilter === 'active' && !exec.isActive) return false;
      if (statusFilter === 'inactive' && exec.isActive) return false;

      // Workload capacity filter
      if (workloadFilter === 'optimal' && exec.workloadStatus !== 'OPTIMAL') return false;
      if (workloadFilter === 'moderate' && exec.workloadStatus !== 'NEAR_CAPACITY') return false;
      if (workloadFilter === 'overloaded' && exec.workloadStatus !== 'OVERLOADED') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = exec.name.toLowerCase().includes(q);
        const matchEmail = exec.email.toLowerCase().includes(q);
        if (!matchName && !matchEmail) return false;
      }

      return true;
    });

    // Sorting
    return filtered.sort((a, b) => {
      if (sortBy === 'winRate') {
        return (b.conversionRate || 0) - (a.conversionRate || 0);
      }
      if (sortBy === 'workload') {
        return (b.activeLeads || 0) - (a.activeLeads || 0);
      }
      if (sortBy === 'overdue') {
        return (b.followUpsOverdue || 0) - (a.followUpsOverdue || 0);
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [executives, searchQuery, statusFilter, workloadFilter, sortBy]);

  const activeStaffCount = executives.filter((e) => e.isActive).length;

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 pt-4 pb-32 flex flex-col gap-6">
      {/* Top Header matching Distribute Engine */}
      <ExecutiveHeader
        totalStaff={executives.length}
        activeStaff={activeStaffCount}
        isLoading={isLoading}
        isFetching={isFetching}
        onRefresh={handleRefresh}
      />

      {/* Executive KPI Summary Cards */}
      <ExecutiveStatsCards executives={executives} isLoading={isLoading} />

      {/* Real-time Filter & Criteria Matrix Bar */}
      <ExecutiveFilters
        executives={executives}
        filteredCount={filteredExecutives.length}
      />

      {/* Quick Distribute Fast-Track Prompt Card (Matching Distribute callout) */}
      <Link
        href="/team_leader/distribute"
        className="flex items-center justify-between p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/40 transition-all group shadow-xs cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Zap className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-950 dark:text-indigo-200">
                Lead Distribution Engine Fast-Track
              </span>
              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-indigo-200/80 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200">
                {activeStaffCount} Representatives Ready
              </span>
            </div>
            <p className="text-xs text-indigo-700 dark:text-indigo-300">
              Directly assign new leads, rebalance executive workload quotas, or
              execute equal batch splits ➔
            </p>
          </div>
        </div>
        <Send className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform" />
      </Link>

      {/* Main View: Stream Cards or Audit Table */}
      {viewMode === "cards" ? (
        <ExecutiveCardStreamView
          executives={filteredExecutives}
          isLoading={isLoading}
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
          totalUnassignedCount={totalUnassignedCount}
          totalPages={totalPages}
        />
      ) : (
        <ExecutivesTable
          executives={filteredExecutives}
          isLoading={isLoading}
          error={error}
          onRefresh={handleRefresh}
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
          totalUnassignedCount={totalUnassignedCount}
          totalPages={totalPages}
        />
      )}

      {/* Individual Executive Detail Slide-Over Drawer */}
      <ExecutiveDetailDrawer />
    </main>
  );
}
