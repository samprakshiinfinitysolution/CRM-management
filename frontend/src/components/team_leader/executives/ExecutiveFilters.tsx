"use client";

import React, { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  LayoutGrid,
  List,
  Clock,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAppDispatch,
  useAppSelector,
  setSearchQuery,
  setStatusFilter,
  setWorkloadFilter,
  setSortBy,
  setViewMode,
  resetExecutiveFilters,
} from "@/store";
import type { SalesExecutiveSummary } from "@/types/api.types";

interface ExecutiveFiltersProps {
  executives?: SalesExecutiveSummary[];
  filteredCount?: number;
}

export default function ExecutiveFilters({
  executives = [],
  filteredCount = 0,
}: ExecutiveFiltersProps) {
  const dispatch = useAppDispatch();
  const { searchQuery, statusFilter, workloadFilter, sortBy, viewMode } =
    useAppSelector((state) => state.executive);

  const [isCriteriaOpen, setIsCriteriaOpen] = useState(true);

  const totalStaff = executives.length;
  const activeStaff = executives.filter((e) => e.isActive).length;
  const overloadedStaff = executives.filter(
    (e) => e.workloadStatus === "OVERLOADED",
  ).length;

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (workloadFilter !== "all" ? 1 : 0) +
    (sortBy !== "winRate" ? 1 : 0);

  return (
    <div className="space-y-3">
      {/* Top Meta Status Sub-bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300 uppercase tracking-wide">
            {totalStaff} Registered Reps
          </span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {activeStaff} Online in Field · {overloadedStaff} High Load
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>Real-time Sync</span>
        </div>
      </div>

      {/* Search Input Bar with Filter Action & View Mode Switcher */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            placeholder="Search representatives by name, work email..."
            className="w-full pl-10 pr-9 py-2.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => dispatch(setSearchQuery(""))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Accordion Toggle */}
        <button
          type="button"
          onClick={() => setIsCriteriaOpen(!isCriteriaOpen)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold border transition-all ${
            isCriteriaOpen
              ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300"
              : "bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300"
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Filters</span>
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* View Mode Switcher (Cards vs Table) */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200/90 dark:border-slate-700">
          <button
            type="button"
            title="Stream Cards View"
            onClick={() => dispatch(setViewMode("cards"))}
            className={`p-2 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "cards"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Audit Table View"
            onClick={() => dispatch(setViewMode("table"))}
            className={`p-2 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "table"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Filter Chips (Matching LeadCriteriaMatrix & Distribute) */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <button
          type="button"
          onClick={() => {
            dispatch(setStatusFilter("all"));
            dispatch(setWorkloadFilter("all"));
          }}
          className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all ${
            statusFilter === "all" && workloadFilter === "all"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
          }`}
        >
          All Staff ({totalStaff})
        </button>

        <button
          type="button"
          onClick={() =>
            dispatch(
              setStatusFilter(statusFilter === "active" ? "all" : "active"),
            )
          }
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all ${
            statusFilter === "active"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          Active In Field ({activeStaff})
        </button>

        <button
          type="button"
          onClick={() =>
            dispatch(
              setWorkloadFilter(
                workloadFilter === "optimal" ? "all" : "optimal",
              ),
            )
          }
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all ${
            workloadFilter === "optimal"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          Optimal Capacity
        </button>

        <button
          type="button"
          onClick={() =>
            dispatch(
              setWorkloadFilter(
                workloadFilter === "overloaded" ? "all" : "overloaded",
              ),
            )
          }
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all ${
            workloadFilter === "overloaded"
              ? "bg-rose-600 text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Overloaded Reps ({overloadedStaff})
        </button>

        <button
          type="button"
          onClick={() =>
            dispatch(
              setStatusFilter(statusFilter === "inactive" ? "all" : "inactive"),
            )
          }
          className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all ${
            statusFilter === "inactive"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
          }`}
        >
          Paused / Inactive ({totalStaff - activeStaff})
        </button>

        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={() => dispatch(resetExecutiveFilters())}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-dashed border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 font-bold text-[11px] hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      {/* Active Criteria Matrix Accordion Box */}
      {isCriteriaOpen && (
        <div className="bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/90 dark:border-slate-800 rounded-lg p-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Executive Filter & Sort Matrix
            </span>
            <button
              type="button"
              onClick={() => dispatch(resetExecutiveFilters())}
              className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-bold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset All Matrix Rules
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Status Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                Staff Status:
              </label>
              <Select
                value={statusFilter}
                onValueChange={(v: string | null) =>
                  dispatch(
                    setStatusFilter(
                      (v as "all" | "active" | "inactive") || "all",
                    ),
                  )
                }
              >
                <SelectTrigger className="w-full text-xs h-9 rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-medium">
                  <SelectValue placeholder="All Staff Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Staff (Active & Inactive)
                  </SelectItem>
                  <SelectItem value="active">
                    Active Staff in Field Only
                  </SelectItem>
                  <SelectItem value="inactive">
                    Inactive / Paused Only
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Workload Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                Workload Capacity:
              </label>
              <Select
                value={workloadFilter}
                onValueChange={(v: string | null) =>
                  dispatch(
                    setWorkloadFilter(
                      (v as "all" | "optimal" | "moderate" | "overloaded") ||
                        "all",
                    ),
                  )
                }
              >
                <SelectTrigger className="w-full text-xs h-9 rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-medium">
                  <SelectValue placeholder="All Capacities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Capacities</SelectItem>
                  <SelectItem value="optimal">
                    Optimal Load (&lt;50% capacity)
                  </SelectItem>
                  <SelectItem value="moderate">
                    Moderate Load (50-80% capacity)
                  </SelectItem>
                  <SelectItem value="overloaded">
                    Overloaded (&gt;80% capacity)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                Sort Representatives By:
              </label>
              <Select
                value={sortBy}
                onValueChange={(v: string | null) =>
                  dispatch(
                    setSortBy(
                      (v as "winRate" | "workload" | "name" | "overdue") ||
                        "winRate",
                    ),
                  )
                }
              >
                <SelectTrigger className="w-full text-xs h-9 rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-medium">
                  <SelectValue placeholder="Sort Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="winRate">
                    Conversion Rate (High to Low)
                  </SelectItem>
                  <SelectItem value="workload">
                    Active Workload (High to Low)
                  </SelectItem>
                  <SelectItem value="overdue">
                    Follow-Ups Overdue (Urgent First)
                  </SelectItem>
                  <SelectItem value="name">
                    Alphabetical by Name (A to Z)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live supervisor visibility active
            </div>
            <span className="font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-md text-[11px]">
              {filteredCount} staff matched
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
