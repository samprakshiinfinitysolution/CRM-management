'use client';

import React from 'react';
import {
  Users,
  CheckCircle2,
  TrendingUp,
  Percent,
  Plus,
  Minus,
  AlertTriangle,
  Sparkles,
  Shield,
  Briefcase,
} from 'lucide-react';
import { SalesExecutiveSummary } from '@/types/api.types';
import { DistributionTabMode } from './DistributeModeSelector';

interface ExecutiveQuotaSelectorProps {
  executives: SalesExecutiveSummary[];
  mode: DistributionTabMode;
  selectedExecutiveIds: string[];
  quotas: Record<string, number>;
  onToggleExecutive: (id: string) => void;
  onUpdateQuota: (id: string, quota: number) => void;
  onSelectAllExecutives: () => void;
  onDeselectAllExecutives: () => void;
  equalSharePerExecutive?: number;
  totalLeadsToDistribute: number;
}

export const ExecutiveQuotaSelector: React.FC<ExecutiveQuotaSelectorProps> = ({
  executives = [],
  mode,
  selectedExecutiveIds = [],
  quotas = {},
  onToggleExecutive,
  onUpdateQuota,
  onSelectAllExecutives,
  onDeselectAllExecutives,
  equalSharePerExecutive = 0,
  totalLeadsToDistribute = 0,
}) => {
  const isAllSelected =
    executives.length > 0 &&
    executives.every((e) => selectedExecutiveIds.includes(e.id));

  const totalFixedQuotaAssigned = Object.values(quotas).reduce((sum, val) => sum + (val || 0), 0);

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
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
      {/* Header bar */}
      <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Sales Executive Allocation Target
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {selectedExecutiveIds.length} / {executives.length} active
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {mode === 'EQUAL_SPLIT' && 'Select executives to participate in the equal distribution split'}
            {mode === 'FIXED_QUOTA' && 'Define exact number of leads to assign to each executive'}
            {mode === 'MANUAL_PICK' && 'Select the destination executive(s) for selected leads'}
            {mode === 'REASSIGN_RECALL' && 'Review executive capacity and current active queues'}
          </p>
        </div>

        {/* Global Select/Deselect Actions */}
        <div className="flex items-center gap-2">
          {mode !== 'FIXED_QUOTA' ? (
            <button
              type="button"
              onClick={isAllSelected ? onDeselectAllExecutives : onSelectAllExecutives}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              {isAllSelected ? 'Deselect All' : 'Select All Executives'}
            </button>
          ) : (
            <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">
              Quota Allocated: <strong>{totalFixedQuotaAssigned}</strong> / {totalLeadsToDistribute} leads
            </div>
          )}
        </div>
      </div>

      {/* Grid of Executive Cards */}
      <div className="p-4 md:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {executives.map((exec) => {
          const isSelected = selectedExecutiveIds.includes(exec.id);
          const currentQuota = quotas[exec.id] || 0;
          const statusInfo = getStatusBadge(exec.workloadStatus);
          const currentLeads = exec.activeLeads || 0;
          const maxCapacity = 30; // standard benchmark limit
          const capacityPercent = Math.min(100, Math.round((currentLeads / maxCapacity) * 100));

          return (
            <div
              key={exec.id}
              onClick={() => {
                if (mode === 'EQUAL_SPLIT' || mode === 'MANUAL_PICK') {
                  onToggleExecutive(exec.id);
                }
              }}
              className={`relative flex flex-col p-4 rounded-2xl border transition-all duration-200 ${
                mode === 'EQUAL_SPLIT' || mode === 'MANUAL_PICK'
                  ? 'cursor-pointer hover:border-slate-300 dark:hover:border-slate-700'
                  : ''
              } ${
                isSelected
                  ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-500/80 shadow-xs'
                  : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/80 dark:border-slate-800'
              }`}
            >
              {/* Top Row: Avatar + Name + Checkbox/Status */}
              <div className="flex items-start flex-wrap justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
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
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                      {exec.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
                      {exec.email}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.badge}`}
                >
                  {statusInfo.label}
                </span>
              </div>

              {/* Workload Progress & Metrics */}
              <div className="space-y-2 mb-3.5 pt-1">
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
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${statusInfo.bar}`}
                    style={{ width: `${capacityPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                    Win Rate: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{exec.conversionRate}%</strong>
                  </span>
                  <span>{capacityPercent}% Load</span>
                </div>
              </div>

              {/* Mode-Specific Interaction Footer */}
              <div className="mt-auto pt-3 border-t border-slate-200/60 dark:border-slate-800/80">
                {mode === 'EQUAL_SPLIT' && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">
                      {isSelected ? 'Included in Split' : 'Excluded'}
                    </span>
                    {isSelected ? (
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100/80 dark:bg-indigo-900/60 px-2.5 py-0.5 rounded-lg">
                        +{equalSharePerExecutive} leads
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">0 leads</span>
                    )}
                  </div>
                )}

                {mode === 'FIXED_QUOTA' && (
                  <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Assigned Quota:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onUpdateQuota(exec.id, Math.max(0, currentQuota - 5))}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={currentQuota}
                          onChange={(e) => onUpdateQuota(exec.id, parseInt(e.target.value) || 0)}
                          className="w-14 text-center py-1 text-xs font-bold rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => onUpdateQuota(exec.id, currentQuota + 5)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="flex items-center gap-1 pt-1 justify-end">
                      <button
                        type="button"
                        onClick={() => onUpdateQuota(exec.id, 5)}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                      >
                        5
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateQuota(exec.id, 10)}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                      >
                        10
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateQuota(exec.id, 20)}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                      >
                        20
                      </button>
                    </div>
                  </div>
                )}

                {mode === 'MANUAL_PICK' && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {isSelected ? 'Target Recipient' : 'Click to select'}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Unassigned'}
                    </span>
                  </div>
                )}

                {mode === 'REASSIGN_RECALL' && (
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Active Queue</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {exec.activeLeads} Leads
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
