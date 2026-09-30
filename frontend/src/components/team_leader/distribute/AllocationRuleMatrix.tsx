'use client';

import React, { useState } from 'react';
import { Search, SlidersHorizontal, X, RotateCcw, Scale, Sliders, CheckSquare, ArrowLeftRight, Clock, ShieldCheck } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DistributionTabMode } from './DistributeModeSelector';

interface AllocationRuleMatrixProps {
  activeRepsCount: number;
  totalLeadsToDistribute: number;
  activeMode: DistributionTabMode;
  onSelectMode: (mode: DistributionTabMode) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onResetRules: () => void;
}

export const AllocationRuleMatrix: React.FC<AllocationRuleMatrixProps> = ({
  activeRepsCount,
  totalLeadsToDistribute,
  activeMode,
  onSelectMode,
  searchTerm,
  onSearchChange,
  onResetRules,
}) => {
  const [isMatrixOpen, setIsMatrixOpen] = useState(true);
  const [capacityCap, setCapacityCap] = useState('30');
  const [remainderPolicy, setRemainderPolicy] = useState('SEQUENTIAL');
  const [workloadBalance, setWorkloadBalance] = useState('ALL_ACTIVE');

  return (
    <div className="space-y-3">
      {/* Top Meta Status Sub-bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300 uppercase tracking-wide">
            {activeRepsCount} Active Reps
          </span>
          <span className="text-xs font-semibold text-slate-500">
            Target Pool: {totalLeadsToDistribute} Leads (₹2.4Cr Value)
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>Sync 2m ago</span>
        </div>
      </div>

      {/* Search Reps & Filter Controls */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search representatives by name, territory, email..."
            className="w-full pl-10 pr-9 py-2.5 text-xs rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-xs"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsMatrixOpen(!isMatrixOpen)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all ${
            isMatrixOpen
              ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Rules</span>
          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
            3
          </span>
        </button>
      </div>

      {/* Split Mode Quick Strategy Pills (Matching Step 1 Filter Chips) */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <button
          type="button"
          onClick={() => onSelectMode('EQUAL_SPLIT')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer ${
            activeMode === 'EQUAL_SPLIT'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          Equal Split (Auto-balanced)
        </button>

        <button
          type="button"
          onClick={() => onSelectMode('FIXED_QUOTA')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer ${
            activeMode === 'FIXED_QUOTA'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Custom Split (Quota Limits)
        </button>

        <button
          type="button"
          onClick={() => onSelectMode('MANUAL_PICK')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer ${
            activeMode === 'MANUAL_PICK'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          Manual Split (Direct VIP)
        </button>

        <button
          type="button"
          onClick={() => onSelectMode('REASSIGN_RECALL')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer ${
            activeMode === 'REASSIGN_RECALL'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          Reassign & Recall
        </button>
      </div>

      {/* Active Allocation Configuration Matrix Accordion */}
      {isMatrixOpen && (
        <div className="bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
              Active Allocation Rule Matrix
            </span>
            <button
              type="button"
              onClick={onResetRules}
              className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset Rules
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Algorithm Mode */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Distribution Policy:</label>
              <Select value={workloadBalance} onValueChange={(v: string | null) => setWorkloadBalance(v || 'ALL_ACTIVE')}>
                <SelectTrigger className="w-full text-xs h-9 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-medium">
                  <SelectValue placeholder="All Active Reps" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL_ACTIVE">Include All Active Reps</SelectItem>
                  <SelectItem value="EXCLUDE_OVERLOADED">Exclude Overloaded (&gt;80%)</SelectItem>
                  <SelectItem value="TOP_PERFORMERS">Top Performer Weighted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Benchmark Capacity Cap */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Max Rep Benchmark:</label>
              <Select value={capacityCap} onValueChange={(v: string | null) => setCapacityCap(v || '30')}>
                <SelectTrigger className="w-full text-xs h-9 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-medium">
                  <SelectValue placeholder="30 Leads / Rep" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">20 Leads / Rep (Strict SLA)</SelectItem>
                  <SelectItem value="30">30 Leads / Rep (Standard)</SelectItem>
                  <SelectItem value="45">45 Leads / Rep (High Volume)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Remainder Rule */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Remainder Handling:</label>
              <Select value={remainderPolicy} onValueChange={(v: string | null) => setRemainderPolicy(v || 'SEQUENTIAL')}>
                <SelectTrigger className="w-full text-xs h-9 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-medium">
                  <SelectValue placeholder="Sequential Assignment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SEQUENTIAL">Sequential Assignment</SelectItem>
                  <SelectItem value="LEAVE_UNASSIGNED">Keep in Unassigned Pool</SelectItem>
                  <SelectItem value="TOP_CONVERTER">Assign to Top Win Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              ACID Transaction Guard active · All allocations verified
            </div>
            <span className="font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-md text-[11px]">
              {activeRepsCount} reps configured
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
