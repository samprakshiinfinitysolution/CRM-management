'use client';

import React, { useMemo, useState } from 'react';
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

export default function SalesExecutivesManagementPage() {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Full executive dataset for aggregate KPI headers and metrics
  const {
    data: allExecRes,
    isLoading: isAllLoading,
    isFetching: isAllFetching,
    error: allError,
    refetch: refetchAll,
  } = useGetSalesExecutivesQuery();

  const {
    searchQuery,
    statusFilter,
    viewMode,
  } = useAppSelector((state) => state.executive);

  const allExecutives = useMemo(() => allExecRes?.data || [], [allExecRes?.data]);
  const activeStaffCount = allExecutives.filter((e) => e.isActive).length;

  // Reset page to 1 when search or status filters change
  const [filterKey, setFilterKey] = useState(
    `${searchQuery}|${statusFilter}`
  );
  const currentFilterKey = `${searchQuery}|${statusFilter}`;
  if (filterKey !== currentFilterKey) {
    setFilterKey(currentFilterKey);
    setPage(1);
  }

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  // Server-side filtered and paginated request
  const queryParams = useMemo(
    () => ({
      search: searchQuery.trim() || undefined,
      status:
        statusFilter === 'active' || statusFilter === 'inactive'
          ? (statusFilter as 'active' | 'inactive')
          : undefined,
      page,
      limit,
    }),
    [searchQuery, statusFilter, page, limit]
  );

  const {
    data: pagedRes,
    isLoading: isPagedLoading,
    isFetching: isPagedFetching,
    error: pagedError,
    refetch: refetchPaged,
  } = useGetSalesExecutivesQuery(queryParams);

  const totalItems = pagedRes?.pagination?.total ?? 0;
  const totalPages = Math.max(1, pagedRes?.pagination?.totalPages ?? 1);
  const effectivePage = Math.min(Math.max(1, page), totalPages);

  const paginatedExecutives = useMemo(() => {
    return pagedRes?.data || [];
  }, [pagedRes?.data]);

  const isLoading = isAllLoading || isPagedLoading;
  const isFetching = isAllFetching || isPagedFetching;
  const error = pagedError || allError;

  const handleRefresh = async () => {
    try {
      await Promise.all([refetchAll().unwrap(), refetchPaged().unwrap()]);
      toast.success('Executive workload & metrics updated');
    } catch {
      toast.error('Failed to refresh executive directory');
    }
  };

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 pt-4 pb-32 flex flex-col gap-6">
      {/* Top Header matching Distribute Engine */}
      <ExecutiveHeader
        totalStaff={allExecutives.length}
        activeStaff={activeStaffCount}
        isLoading={isLoading}
        isFetching={isFetching}
        onRefresh={handleRefresh}
      />

      {/* Executive KPI Summary Cards */}
      <ExecutiveStatsCards executives={allExecutives} isLoading={isLoading} />

      {/* Real-time Filter & Criteria Matrix Bar */}
      <ExecutiveFilters
        executives={allExecutives}
        filteredCount={totalItems}
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
          executives={paginatedExecutives}
          isLoading={isLoading}
          page={effectivePage}
          setPage={setPage}
          limit={limit}
          setLimit={handleLimitChange}
          totalItems={totalItems}
          totalPages={totalPages}
        />
      ) : (
        <ExecutivesTable
          executives={paginatedExecutives}
          isLoading={isLoading}
          error={error}
          onRefresh={handleRefresh}
          page={effectivePage}
          setPage={setPage}
          limit={limit}
          setLimit={handleLimitChange}
          totalItems={totalItems}
          totalPages={totalPages}
        />
      )}

      {/* Individual Executive Detail Slide-Over Drawer */}
      <ExecutiveDetailDrawer />
    </main>
  );
}
