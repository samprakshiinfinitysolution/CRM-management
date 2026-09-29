'use client';

import React from 'react';
import {
  GitFork,
  Layers,
  Users,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DistributeHeaderProps {
  unassignedCount: number;
  activeExecutivesCount: number;
  totalSelectedLeads: number;
  onRefresh?: () => void;
  onResetSelection?: () => void;
  isSimulating?: boolean;
}

export const DistributeHeader: React.FC<DistributeHeaderProps> = ({
  unassignedCount = 0,
  activeExecutivesCount = 0,
  totalSelectedLeads = 0,
  onRefresh,
  onResetSelection,
}) => {
  return (
    <header className="flex flex-col gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
      {/* Top Banner with Title & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <GitFork className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Lead Distribution Engine
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
                  <ShieldCheck className="w-3 h-3" />
                  ACID Safe
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                Automated multi-mode lead distribution, quota balancing, and reassignment workflow
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {totalSelectedLeads > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetSelection}
              className="text-xs font-semibold rounded-xl border-slate-300 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Clear Selection ({totalSelectedLeads})
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="flex items-center gap-1.5 text-xs font-semibold rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Pool</span>
          </Button>
        </div>
      </div>

      {/* Real-time Inventory & Distribution KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Card 1: Available Unassigned Pool */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Unassigned Pool
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {unassignedCount}
              </span>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                leads
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Selected for Distribution */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Selected Target
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {totalSelectedLeads > 0 ? totalSelectedLeads : unassignedCount}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {totalSelectedLeads > 0 ? 'custom selected' : 'all pool'}
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Active Sales Executives */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Active Agents
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {activeExecutivesCount}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                ready
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Algorithm Status */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Pipeline Status
            </p>
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Ready to Allocate
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
};
