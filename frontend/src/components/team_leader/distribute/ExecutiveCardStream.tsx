'use client';

import React from 'react';
import {
  CheckSquare,
  Square,
  Users,
  TrendingUp,
  Plus,
  Minus,
  Sparkles,
  Zap,
  Briefcase,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';
import { SalesExecutiveSummary } from '@/types/api.types';
import { DistributionTabMode } from './DistributeModeSelector';

interface ExecutiveCardStreamProps {
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
  allocatedCount: number;
  remainderCount: number;
  onConfirmDistribute: () => void;
}

export const ExecutiveCardStream: React.FC<ExecutiveCardStreamProps> = ({
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
  allocatedCount,
  remainderCount,
  onConfirmDistribute,
}) => {
  const selectedExecCount = selectedExecutiveIds.length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPTIMAL':
        return {
          label: 'OPTIMAL',
          badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
          bar: 'bg-emerald-500',
        };
      case 'NEAR_CAPACITY':
        return {
          label: 'NEAR CAPACITY',
          badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
          bar: 'bg-amber-500',
        };
      case 'OVERLOADED':
        return {
          label: 'OVERLOADED',
          badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300',
          bar: 'bg-rose-500',
        };
      default:
        return {
          label: 'ACTIVE',
          badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
          bar: 'bg-indigo-500',
        };
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Allocation Summary & Action Control Bar (matching Step 1 format) */}
      <div className="flex items-center justify-between px-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Allocated: {allocatedCount} of {totalLeadsToDistribute} Leads
          </span>
          <span className="text-slate-400 font-medium">· Remainder: {remainderCount}</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-bold text-indigo-600 dark:text-indigo-400">
          <button
            type="button"
            onClick={onSelectAllExecutives}
            className="hover:underline"
          >
            Select All Active ({executives.length})
          </button>
          <button
            type="button"
            onClick={onDeselectAllExecutives}
            className="text-slate-400 hover:text-slate-600"
          >
            Clear Selection
          </button>
        </div>
      </div>

      {/* Ready for Atomic Commit Callout Prompt Card */}
      <div
        onClick={onConfirmDistribute}
        className="flex items-center justify-between p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 cursor-pointer hover:bg-indigo-100/60 transition-all group shadow-xs"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Zap className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-950 dark:text-indigo-200">
                Ready for Atomic Transaction Commit
              </span>
              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-indigo-200/80 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200">
                {selectedExecCount} Active Reps Configured
              </span>
            </div>
            <p className="text-xs text-indigo-700 dark:text-indigo-300">
              {mode === 'EQUAL_SPLIT' &&
                `Auto-split: ${equalSharePerExecutive} leads/rep · Remainder: ${remainderCount} leads in pool ➔`}
              {mode === 'FIXED_QUOTA' &&
                `Custom quota total: ${allocatedCount} of ${totalLeadsToDistribute} allocated ➔`}
              {mode === 'MANUAL_PICK' &&
                `Directly assigning ${totalLeadsToDistribute} leads to selected executive ➔`}
            </p>
          </div>
        </div>
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
      </div>

      {/* Stream Header */}
      <div className="flex items-center justify-between pt-1 pb-1">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Representative Roster Queue ({selectedExecCount} of {executives.length} Selected)
        </h3>
        <span className="text-[11px] font-black uppercase text-indigo-600 tracking-wider cursor-pointer hover:underline">
          Sort: Conversion Rate High-Low ▾
        </span>
      </div>

      {/* High-Fidelity Executive Card Stream */}
      <div className="space-y-2.5">
        {executives.map((exec) => {
          const isSelected = selectedExecutiveIds.includes(exec.id);
          const currentQuota = quotas[exec.id] || 0;
          const statusInfo = getStatusBadge(exec.workloadStatus);
          const currentLeads = exec.activeLeads || 0;
          const maxCapacity = 30;
          const capacityPercent = Math.min(100, Math.round((currentLeads / maxCapacity) * 100));

          // Post-load projection calculation
          const addedLeads =
            mode === 'EQUAL_SPLIT' && isSelected
              ? equalSharePerExecutive
              : mode === 'FIXED_QUOTA'
              ? currentQuota
              : mode === 'MANUAL_PICK' && isSelected
              ? totalLeadsToDistribute
              : 0;

          const projectedLeads = currentLeads + addedLeads;
          const projectedPercent = Math.min(100, Math.round((projectedLeads / maxCapacity) * 100));

          return (
            <div
              key={exec.id}
              onClick={() => {
                if (mode === 'EQUAL_SPLIT' || mode === 'MANUAL_PICK') {
                  onToggleExecutive(exec.id);
                }
              }}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all ${
                mode === 'EQUAL_SPLIT' || mode === 'MANUAL_PICK'
                  ? 'cursor-pointer hover:border-slate-300 dark:hover:border-slate-700'
                  : ''
              } ${
                isSelected
                  ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-400 dark:border-indigo-800 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800'
              }`}
            >
              {/* Checkbox + Info */}
              <div className="flex items-start sm:items-center gap-3.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExecutive(exec.id);
                  }}
                  className="mt-0.5 sm:mt-0 text-slate-400 hover:text-indigo-600 focus:outline-none"
                >
                  {isSelected ? (
                    <CheckSquare className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>

                {/* Avatar Initials */}
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-xs shrink-0 border border-slate-200/60 dark:border-slate-700">
                  {exec.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>

                {/* Executive Details & Capacity Progress */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {exec.name}
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.2 rounded-full ${statusInfo.badge}`}
                    >
                      {statusInfo.label}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 uppercase">
                      SALES EXECUTIVE
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {exec.email} · Bengaluru, KA
                  </p>

                  {/* Workload Progress Bar & Performance */}
                  <div className="flex items-center gap-3 pt-0.5 text-[11px] text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                      <Briefcase className="w-3 h-3 text-slate-400" />
                      Load: {currentLeads}/{maxCapacity} ({capacityPercent}%)
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="w-3 h-3" />
                      Win Rate: {exec.conversionRate}%
                    </span>

                    {/* Mode Specific Allocation Badges */}
                    {mode === 'EQUAL_SPLIT' && isSelected && (
                      <span className="font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100/80 dark:bg-indigo-900/60 px-2 py-0.2 rounded-md">
                        +{equalSharePerExecutive} leads ➔ Post-Load: {projectedLeads}/{maxCapacity} ({projectedPercent}%)
                      </span>
                    )}

                    {mode === 'MANUAL_PICK' && isSelected && (
                      <span className="font-bold text-white bg-indigo-600 px-2.5 py-0.2 rounded-md">
                        Selected Target Recipient
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Mode Specific Stepper (Fixed Quota) or Financial Value (Right) */}
              <div
                className="text-right pt-2 sm:pt-0 pl-11 sm:pl-0 flex flex-col sm:items-end justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                {mode === 'FIXED_QUOTA' ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onUpdateQuota(exec.id, Math.max(0, currentQuota - 5))}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-bold"
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
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-bold"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1 justify-end">
                      <button
                        type="button"
                        onClick={() => onUpdateQuota(exec.id, currentQuota + 5)}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      >
                        +5
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateQuota(exec.id, currentQuota + 10)}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      >
                        +10
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      ₹{(((exec.totalPipelineValue ?? 0)) / 100000).toFixed(1)}L
                    </div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                      Pipeline Val
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
