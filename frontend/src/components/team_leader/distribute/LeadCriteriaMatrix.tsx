'use client';

import React, { useState } from 'react';
import { Search, SlidersHorizontal, X, RotateCcw, Plus, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LeadCriteriaMatrixProps {
  totalUnallocated: number;
  batchNumber?: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  activeFilterCount: number;
  selectedSource: string;
  onSourceChange: (val: string) => void;
  selectedMinBudget: string;
  onMinBudgetChange: (val: string) => void;
  selectedUrgency: string;
  onUrgencyChange: (val: string) => void;
  onResetFilters: () => void;
  filteredCount: number;
}

export const LeadCriteriaMatrix: React.FC<LeadCriteriaMatrixProps> = ({
  totalUnallocated = 184,
  batchNumber = 'Batch #LFC-2026-884',
  searchTerm,
  onSearchChange,
  activeFilterCount = 3,
  selectedSource,
  onSourceChange,
  selectedMinBudget,
  onMinBudgetChange,
  selectedUrgency,
  onUrgencyChange,
  onResetFilters,
  filteredCount,
}) => {
  const [isCriteriaOpen, setIsCriteriaOpen] = useState(true);

  return (
    <div className="space-y-3">
      {/* Top Unallocated Batch Meta Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 uppercase tracking-wide">
            {totalUnallocated} Unallocated
          </span>
          <span className="text-xs font-semibold text-slate-500">{batchNumber}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>Sync 2m ago</span>
        </div>
      </div>

      {/* Search Input Bar with Filter Action */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="FinTech, Enterprise, city, customer name..."
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
          onClick={() => setIsCriteriaOpen(!isCriteriaOpen)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all ${
            isCriteriaOpen
              ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
            {activeFilterCount}
          </span>
        </button>
      </div>

      {/* Quick Filter Chips */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <button
          type="button"
          className="px-3 py-1 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-[11px]"
        >
          All ({totalUnallocated})
        </button>
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 text-white dark:bg-slate-800 font-medium text-[11px]">
          Enterprise (28) <X className="w-3 h-3 cursor-pointer opacity-70 hover:opacity-100" />
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 text-white dark:bg-slate-800 font-medium text-[11px]">
          Budget &gt; ₹3L (56) <X className="w-3 h-3 cursor-pointer opacity-70 hover:opacity-100" />
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 text-white dark:bg-slate-800 font-medium text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-0.5" />
          High Priority (42) <X className="w-3 h-3 cursor-pointer opacity-70 hover:opacity-100" />
        </span>
        <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-[11px] cursor-pointer hover:bg-slate-200">
          Overdue SLA (14)
        </span>
        <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-[11px] cursor-pointer hover:bg-slate-200">
          Webinar Source (38)
        </span>
        <button
          type="button"
          className="flex items-center gap-1 px-3 py-1 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 font-semibold text-[11px] hover:border-slate-400"
        >
          <Plus className="w-3 h-3" /> Add Filter
        </button>
      </div>

      {/* Active Criteria Matrix Accordion Box */}
      {isCriteriaOpen && (
        <div className="bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
              Active Criteria Matrix
            </span>
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Source */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Source:</label>
              <Select value={selectedSource} onValueChange={(v: string | null) => onSourceChange(v || 'ALL')}>
                <SelectTrigger className="w-full text-xs h-9 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-medium">
                  <SelectValue placeholder="Webinar / Inbound" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Inbound / Direct</SelectItem>
                  <SelectItem value="WEBINAR">Webinar Source</SelectItem>
                  <SelectItem value="CAMPAIGN">Paid Campaign</SelectItem>
                  <SelectItem value="WEBSITE">Website Organic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Min Budget */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Min Budget:</label>
              <Select value={selectedMinBudget} onValueChange={(v: string | null) => onMinBudgetChange(v || 'ALL')}>
                <SelectTrigger className="w-full text-xs h-9 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-medium">
                  <SelectValue placeholder="₹2.5L+" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Any Deal Size</SelectItem>
                  <SelectItem value="1L">₹1.0L+</SelectItem>
                  <SelectItem value="2.5L">₹2.5L+</SelectItem>
                  <SelectItem value="5L">₹5.0L+ (Enterprise)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Urgency */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Urgency:</label>
              <Select value={selectedUrgency} onValueChange={(v: string | null) => onUrgencyChange(v || 'ALL')}>
                <SelectTrigger className="w-full text-xs h-9 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-medium">
                  <SelectValue placeholder="Urgent & High Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Urgencies</SelectItem>
                  <SelectItem value="URGENT_HIGH">Urgent & High Priority</SelectItem>
                  <SelectItem value="MEDIUM">Medium Priority</SelectItem>
                  <SelectItem value="LOW">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Narrowed to verified high-conversion leads
            </div>
            <span className="font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-md text-[11px]">
              {filteredCount} results found
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
