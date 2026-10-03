'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Check,
  Users,
  Briefcase,
  TrendingUp,
  ArrowRight,
  CheckSquare,
  Square,
  AlertCircle,
} from 'lucide-react';
import { SalesExecutiveSummary } from '@/types/api.types';
import { Button } from '@/components/ui/button';

interface ExecutiveSelectorStepProps {
  executives: SalesExecutiveSummary[];
  selectedExecutiveIds: string[];
  onToggleExecutive: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onAdvanceToStep2: () => void;
  isLoading?: boolean;
}

export const ExecutiveSelectorStep: React.FC<ExecutiveSelectorStepProps> = ({
  executives = [],
  selectedExecutiveIds = [],
  onToggleExecutive,
  onSelectAll,
  onDeselectAll,
  onAdvanceToStep2,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [workloadFilter, setWorkloadFilter] = useState<'ALL' | 'OPTIMAL' | 'NEAR_CAPACITY' | 'OVERLOADED'>('ALL');

  // Workload counts
  const workloadCounts = useMemo(() => {
    const counts = { ALL: executives.length, OPTIMAL: 0, NEAR_CAPACITY: 0, OVERLOADED: 0 };
    executives.forEach((e) => {
      if (e.workloadStatus === 'OPTIMAL') counts.OPTIMAL++;
      else if (e.workloadStatus === 'NEAR_CAPACITY') counts.NEAR_CAPACITY++;
      else if (e.workloadStatus === 'OVERLOADED') counts.OVERLOADED++;
    });
    return counts;
  }, [executives]);

  // Filtered list
  const filteredExecutives = useMemo(() => {
    return executives.filter((e) => {
      const matchesSearch =
        !searchTerm.trim() ||
        e.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        e.email.toLowerCase().includes(searchTerm.toLowerCase().trim());

      const matchesWorkload =
        workloadFilter === 'ALL' || e.workloadStatus === workloadFilter;

      return matchesSearch && matchesWorkload;
    });
  }, [executives, searchTerm, workloadFilter]);

  const isAllSelected =
    filteredExecutives.length > 0 &&
    filteredExecutives.every((e) => selectedExecutiveIds.includes(e.id));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPTIMAL':
        return {
          label: 'Optimal Workload',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
          bar: 'bg-emerald-500',
        };
      case 'NEAR_CAPACITY':
        return {
          label: 'Near Capacity',
          badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
          bar: 'bg-amber-500',
        };
      case 'OVERLOADED':
        return {
          label: 'Overloaded',
          badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
          bar: 'bg-rose-500',
        };
      default:
        return {
          label: 'Active',
          badge: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
          bar: 'bg-indigo-500',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Instructions Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Step 1: Select Sales Executives
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60">
                {selectedExecutiveIds.length} of {executives.length} Selected
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Choose the sales representatives who will participate in this lead distribution round. You can filter by current capacity and performance before configuring the allocation strategy in Step 2.
            </p>
          </div>

          {/* Quick Select Actions */}
          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              type="button"
              onClick={isAllSelected ? onDeselectAll : onSelectAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800 transition-colors"
            >
              {isAllSelected ? (
                <>
                  <Square className="w-3.5 h-3.5" />
                  <span>Deselect All</span>
                </>
              ) : (
                <>
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Select All ({executives.length})</span>
                </>
              )}
            </button>
            {selectedExecutiveIds.length > 0 && !isAllSelected && (
              <button
                type="button"
                onClick={onDeselectAll}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Search & Workload Filter Controls */}
        <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search representative by name or email..."
              className="w-full pl-9 pr-4 py-2 text-xs md:text-sm rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ×
              </button>
            )}
          </div>

          {/* Workload Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
            <button
              type="button"
              onClick={() => setWorkloadFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                workloadFilter === 'ALL'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              All ({workloadCounts.ALL})
            </button>
            <button
              type="button"
              onClick={() => setWorkloadFilter('OPTIMAL')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                workloadFilter === 'OPTIMAL'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300'
              }`}
            >
              Optimal ({workloadCounts.OPTIMAL})
            </button>
            <button
              type="button"
              onClick={() => setWorkloadFilter('NEAR_CAPACITY')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                workloadFilter === 'NEAR_CAPACITY'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300'
              }`}
            >
              Near Capacity ({workloadCounts.NEAR_CAPACITY})
            </button>
            <button
              type="button"
              onClick={() => setWorkloadFilter('OVERLOADED')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                workloadFilter === 'OVERLOADED'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300'
              }`}
            >
              Overloaded ({workloadCounts.OVERLOADED})
            </button>
          </div>
        </div>
      </div>

      {/* 2. Executive Cards Stream */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-44 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-700"
            />
          ))}
        </div>
      ) : filteredExecutives.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-8 text-center space-y-3">
          <Users className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
            No sales executives found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm || workloadFilter !== 'ALL'
              ? 'Try adjusting your search query or workload status filter.'
              : 'No active sales executives are available in the organization.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExecutives.map((exec) => {
            const isSelected = selectedExecutiveIds.includes(exec.id);
            const statusInfo = getStatusBadge(exec.workloadStatus);
            const currentLeads = exec.activeLeads || 0;
            const maxCapacity = 30;
            const capacityPercent = Math.min(
              100,
              Math.round((currentLeads / maxCapacity) * 100)
            );

            return (
              <div
                key={exec.id}
                onClick={() => onToggleExecutive(exec.id)}
                className={`group relative flex flex-col p-4 md:p-5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'bg-indigo-50/50 dark:bg-indigo-950/25 border-indigo-500 dark:border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
                }`}
              >
                {/* Top Row: Avatar + Name + Checkbox Indicator */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                      }`}
                    >
                      {exec.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {exec.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 truncate max-w-44">
                        {exec.email}
                      </p>
                    </div>
                  </div>

                  {/* Selection Checkbox */}
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'border border-slate-300 dark:border-slate-700 text-transparent hover:border-slate-400'
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mb-3">
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.badge}`}
                  >
                    {statusInfo.label}
                  </span>
                </div>

                {/* Workload Progress & Metrics */}
                <div className="space-y-2 mb-3 pt-1">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      Active Pipeline
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {currentLeads} / {maxCapacity} leads
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${statusInfo.bar}`}
                      style={{ width: `${capacityPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                      Win Rate:{' '}
                      <strong className="text-slate-700 dark:text-slate-300 font-semibold">
                        {exec.conversionRate}%
                      </strong>
                    </span>
                    <span>{capacityPercent}% Capacity</span>
                  </div>
                </div>

                {/* Bottom Selection Status Pill */}
                <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Participation:
                  </span>
                  <span
                    className={`font-bold text-[11px] px-2 py-0.5 rounded-md ${
                      isSelected
                        ? 'text-indigo-600 dark:text-indigo-300 bg-indigo-100/60 dark:bg-indigo-950/60'
                        : 'text-slate-400 bg-slate-100 dark:bg-slate-800'
                    }`}
                  >
                    {isSelected ? '✓ Participating' : 'Excluded'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Bottom Advance Callout Card */}
      <div className="bg-linear-to-r from-indigo-900 to-slate-900 text-white rounded-3xl p-5 md:p-6 shadow-xl border border-indigo-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              {selectedExecutiveIds.length} Representatives Ready
            </span>
          </div>
          <h3 className="text-base font-bold text-white">
            {selectedExecutiveIds.length === 0
              ? 'Please select at least 1 sales executive to proceed'
              : 'Proceed to Step 2: Split & Lead Distribution'}
          </h3>
          <p className="text-xs text-slate-300 max-w-xl">
            In Step 2, you will choose your distribution strategy (Equal Split, Fixed Quota, or Manual Pick), configure allocations, and review lead inventory.
          </p>
        </div>

        <Button
          type="button"
          disabled={selectedExecutiveIds.length === 0}
          onClick={onAdvanceToStep2}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Continue to Split & Distribution (Step 2)</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
