'use client';

import React from 'react';
import {
  User,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useAppDispatch,
  useAppSelector,
  setSelectedExecutiveId,
  useToggleExecutiveStatusMutation,
} from '@/store';
import type { SalesExecutiveSummary } from '@/types/api.types';

interface ExecutivesTableProps {
  executives: SalesExecutiveSummary[];
  isLoading?: boolean;
  error?: unknown;
  onRefresh?: () => void;
}

export default function ExecutivesTable({
  executives,
  isLoading = false,
  error,
  onRefresh,
}: ExecutivesTableProps) {
  const dispatch = useAppDispatch();
  const { searchQuery, statusFilter } = useAppSelector((state) => state.executive);
  const [toggleStatus, { isLoading: isToggling }] = useToggleExecutiveStatusMutation();

  // Filter in memory for instantaneous search/tab responsiveness
  const filteredExecutives = executives.filter((exec) => {
    if (statusFilter === 'active' && !exec.isActive) return false;
    if (statusFilter === 'inactive' && exec.isActive) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = exec.name.toLowerCase().includes(q);
      const matchEmail = exec.email.toLowerCase().includes(q);
      if (!matchName && !matchEmail) return false;
    }
    return true;
  });

  const handleToggleStatus = async (
    e: React.MouseEvent,
    execId: string,
    currentStatus: boolean
  ) => {
    e.stopPropagation();
    try {
      const res = await toggleStatus({
        id: execId,
        isActive: !currentStatus,
      }).unwrap();
      toast.success(
        res.message ||
          `Executive status updated to ${!currentStatus ? 'Active' : 'Inactive'}`
      );
    } catch (err: unknown) {
      const errorMsg =
        typeof err === 'object' && err !== null && 'data' in err
          ? (err as { data: { message?: string } }).data?.message
          : 'Failed to update executive status';
      toast.error(errorMsg || 'Failed to update executive status');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-crm-subtle shadow-xs overflow-hidden">
        <div className="p-4 border-b border-crm-subtle flex items-center justify-between">
          <div className="h-5 w-48 bg-slate-100 rounded animate-pulse" />
          <div className="h-5 w-24 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="divide-y divide-slate-100">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100" />
                <div className="flex flex-col gap-1">
                  <div className="w-32 h-4 bg-slate-100 rounded" />
                  <div className="w-48 h-3 bg-slate-50 rounded" />
                </div>
              </div>
              <div className="hidden sm:block w-24 h-4 bg-slate-100 rounded" />
              <div className="hidden md:block w-20 h-4 bg-slate-100 rounded" />
              <div className="w-24 h-8 bg-slate-100 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center shadow-xs flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Failed to Load Sales Executives</h3>
          <p className="text-xs text-slate-500 mt-1">
            An unexpected error occurred while querying the executive directory.
          </p>
        </div>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
          >
            Retry Query
          </button>
        )}
      </div>
    );
  }

  if (filteredExecutives.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-crm-subtle p-12 text-center shadow-xs flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">No Sales Executives Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            {searchQuery || statusFilter !== 'all'
              ? 'No sales executives match the current filter or search criteria.'
              : 'There are no sales executives registered in the system yet.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-crm-subtle shadow-xs overflow-hidden">
      {/* Table Title Bar */}
      <div className="p-4 border-b border-crm-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-crm-primary tracking-tight">
            Sales Executive Directory & Workload Audit
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
            {filteredExecutives.length} Total
          </span>
        </div>
        <span className="text-[11px] text-crm-muted">
          Click any executive row to inspect individual leads & follow-up queue
        </span>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-crm-subtle text-[11px] font-bold text-crm-muted uppercase tracking-wider">
              <th className="py-3 px-4">Sales Executive</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Active Workload</th>
              <th className="py-3 px-3">Conversion (Won)</th>
              <th className="py-3 px-3">Follow-Ups</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {filteredExecutives.map((exec) => {
              const initials = exec.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();

              const workloadBadgeClass =
                exec.workloadStatus === 'OVERLOADED'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : exec.workloadStatus === 'NEAR_CAPACITY'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200';

              const workloadBarClass =
                exec.workloadStatus === 'OVERLOADED'
                  ? 'bg-rose-500'
                  : exec.workloadStatus === 'NEAR_CAPACITY'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500';

              return (
                <tr
                  key={exec.id}
                  onClick={() => dispatch(setSelectedExecutiveId(exec.id))}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                >
                  {/* Executive Name & Avatar */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          {initials}
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                            exec.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                            {exec.name}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 truncate">
                          {exec.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Status & Quick Toggle */}
                  <td className="py-3.5 px-3">
                    <button
                      type="button"
                      title={`Click to ${exec.isActive ? 'deactivate' : 'activate'}`}
                      onClick={(e) => handleToggleStatus(e, exec.id, exec.isActive)}
                      disabled={isToggling}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                        exec.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {exec.isActive ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <XCircle className="w-3 h-3 text-slate-400" />
                      )}
                      <span>{exec.isActive ? 'Active' : 'Inactive'}</span>
                    </button>
                  </td>

                  {/* Active Workload & Capacity */}
                  <td className="py-3.5 px-3">
                    <div className="flex flex-col gap-1 min-w-[120px]">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-800">
                          {exec.activeLeads} leads
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase border ${workloadBadgeClass}`}
                        >
                          {exec.workloadStatus.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${workloadBarClass}`}
                          style={{ width: `${exec.capacityPercentage}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {exec.capacityPercentage}% capacity (of 40 quota)
                      </span>
                    </div>
                  </td>

                  {/* Won & Conversion Rate */}
                  <td className="py-3.5 px-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1 font-semibold text-slate-900">
                        <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                        <span>{exec.convertedLeads} Won</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {exec.conversionRate}% win rate ({exec.totalAssignedLeads} total)
                      </span>
                    </div>
                  </td>

                  {/* Follow-up Health */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-700 font-medium">
                        {exec.followUpsPending} pending
                      </span>
                      {exec.followUpsOverdue > 0 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center gap-0.5">
                          <AlertCircle className="w-3 h-3" />
                          <span>{exec.followUpsOverdue} overdue</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => dispatch(setSelectedExecutiveId(exec.id))}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50  text-indigo-700 text-xs font-semibold inline-flex items-center gap-1 transition-all group-hover:bg-indigo-600 group-hover:text-white"
                    >
                      <span>Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
