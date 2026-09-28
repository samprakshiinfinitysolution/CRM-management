'use client';

import React from 'react';
import { Search, X, RotateCcw } from 'lucide-react';
import {
  useAppDispatch,
  useAppSelector,
  setSearchQuery,
  setStatusFilter,
  resetExecutiveFilters,
} from '@/store';

export default function ExecutiveFilters() {
  const dispatch = useAppDispatch();
  const { searchQuery, statusFilter } = useAppSelector((state) => state.executive);

  const statusOptions: { label: string; value: 'all' | 'active' | 'inactive' }[] = [
    { label: 'All Staff', value: 'all' },
    { label: 'Active Only', value: 'active' },
    { label: 'Inactive / Paused', value: 'inactive' },
  ];

  return (
    <div className="bg-white p-3 sm:p-4 rounded-2xl border border-crm-subtle shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          placeholder="Search executive by name or work email..."
          className="w-full h-10 pl-9 pr-8 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => dispatch(setSearchQuery(''))}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Tabs & Reset */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium">
          {statusOptions.map((opt) => {
            const isSelected = statusFilter === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => dispatch(setStatusFilter(opt.value))}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {(searchQuery || statusFilter !== 'all') && (
          <button
            type="button"
            onClick={() => dispatch(resetExecutiveFilters())}
            title="Reset Filters"
            className="h-9 px-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
