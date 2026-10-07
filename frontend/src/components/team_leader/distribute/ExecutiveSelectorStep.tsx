"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Users,
  TrendingUp,
  ArrowRight,
  CheckSquare,
  Square,
} from "lucide-react";
import { SalesExecutiveSummary } from "@/types/api.types";
import { Button } from "@/components/ui/button";
import { TableSkeletonRows } from "@/components/ui/TableSkeletonRows";
import { useDebounce } from "@/lib/useDebounce";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [workloadFilter, setWorkloadFilter] = useState<
    "ALL" | "OPTIMAL" | "NEAR_CAPACITY" | "OVERLOADED"
  >("ALL");

  // Debounced search query
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Workload counts
  const workloadCounts = useMemo(() => {
    const counts = {
      ALL: executives.length,
      OPTIMAL: 0,
      NEAR_CAPACITY: 0,
      OVERLOADED: 0,
    };
    executives.forEach((e) => {
      if (e.workloadStatus === "OPTIMAL") counts.OPTIMAL++;
      else if (e.workloadStatus === "NEAR_CAPACITY") counts.NEAR_CAPACITY++;
      else if (e.workloadStatus === "OVERLOADED") counts.OVERLOADED++;
    });
    return counts;
  }, [executives]);

  // Filtered list
  const filteredExecutives = useMemo(() => {
    return executives.filter((e) => {
      const matchesSearch =
        !debouncedSearch.trim() ||
        e.name.toLowerCase().includes(debouncedSearch.toLowerCase().trim()) ||
        e.email.toLowerCase().includes(debouncedSearch.toLowerCase().trim());

      const matchesWorkload =
        workloadFilter === "ALL" || e.workloadStatus === workloadFilter;

      return matchesSearch && matchesWorkload;
    });
  }, [executives, debouncedSearch, workloadFilter]);

  const isAllSelected =
    filteredExecutives.length > 0 &&
    filteredExecutives.every((e) => selectedExecutiveIds.includes(e.id));

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
      {/* 1. Header & Actions Toolbar */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">
              Select Sales Representatives
            </h2>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {selectedExecutiveIds.length} of {executives.length} Selected
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Choose representatives who will receive leads in this distribution round.
          </p>
        </div>

        {/* Quick Select & Advance Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={isAllSelected ? onDeselectAll : onSelectAll}
            className="px-3 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            {isAllSelected ? (
              <>
                <Square className="w-3.5 h-3.5" />
                <span>Deselect All</span>
              </>
            ) : (
              <>
                <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                <span>Select All ({executives.length})</span>
              </>
            )}
          </button>

          <Button
            type="button"
            disabled={selectedExecutiveIds.length === 0}
            onClick={onAdvanceToStep2}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>Continue to Step 2</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Box */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          )}
        </div>

        {/* Workload Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs">
          <button
            type="button"
            onClick={() => setWorkloadFilter("ALL")}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              workloadFilter === "ALL"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            All ({workloadCounts.ALL})
          </button>
          <button
            type="button"
            onClick={() => setWorkloadFilter("OPTIMAL")}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              workloadFilter === "OPTIMAL"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            Optimal ({workloadCounts.OPTIMAL})
          </button>
          <button
            type="button"
            onClick={() => setWorkloadFilter("NEAR_CAPACITY")}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              workloadFilter === "NEAR_CAPACITY"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-white border border-slate-200 text-amber-700 hover:bg-amber-50"
            }`}
          >
            Near Capacity ({workloadCounts.NEAR_CAPACITY})
          </button>
          <button
            type="button"
            onClick={() => setWorkloadFilter("OVERLOADED")}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              workloadFilter === "OVERLOADED"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-white border border-slate-200 text-rose-700 hover:bg-rose-50"
            }`}
          >
            Overloaded ({workloadCounts.OVERLOADED})
          </button>
        </div>
      </div>

      {/* 3. Executive Table View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 w-10 text-center">
                <button
                  type="button"
                  onClick={isAllSelected ? onDeselectAll : onSelectAll}
                  className="text-slate-400 hover:text-indigo-600 cursor-pointer"
                  title={isAllSelected ? "Deselect all" : "Select all"}
                >
                  {isAllSelected ? (
                    <CheckSquare className="w-4 h-4 text-indigo-600" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="py-3 px-4">Sales Representative</th>
              <th className="py-3 px-4">Workload Status</th>
              <th className="py-3 px-4">Active Leads / Capacity</th>
              <th className="py-3 px-4">Win Rate</th>
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <TableSkeletonRows columns={6} rows={8} />
            ) : filteredExecutives.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-1 max-w-sm mx-auto">
                    <Users className="w-6 h-6 text-slate-300" />
                    <span className="text-xs font-semibold text-slate-700">
                      No sales representatives found
                    </span>
                    <p className="text-[11px] text-slate-400">
                      {searchTerm || workloadFilter !== "ALL"
                        ? "Try adjusting your search query or workload status filter."
                        : "No active sales executives are available."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredExecutives.map((exec) => {
                const isSelected = selectedExecutiveIds.includes(exec.id);
                const statusInfo = exec.workloadStatus;
                const currentLeads = exec.activeLeads || 0;
                const maxCapacity = 30;
                const capacityPercent = Math.min(
                  100,
                  Math.round((currentLeads / maxCapacity) * 100),
                );

                return (
                  <tr
                    key={exec.id}
                    onClick={() => onToggleExecutive(exec.id)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50/50 hover:bg-indigo-50/70"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    {/* Checkbox Column */}
                    <td
                      className="py-3 px-4 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleExecutive(exec.id);
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => onToggleExecutive(exec.id)}
                        className="text-slate-400 hover:text-indigo-600 cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Representative Column */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                            isSelected
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {exec.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-900 block truncate">
                            {exec.name}
                          </span>
                          <span className="text-[11px] text-slate-400 block truncate">
                            {exec.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Workload Status Badge Column */}
                    <td className="py-3 px-4  ">
                      <span
                        className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md border`}
                      >
                        {statusInfo}
                      </span>
                    </td>

                    {/* Active Leads / Capacity Column */}
                    <td className="py-3 px-4 min-w-[160px]">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">
                            {currentLeads} of {maxCapacity} leads
                          </span>
                          <span className="font-semibold text-slate-700">
                            {capacityPercent}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300`}
                            style={{ width: `${capacityPercent}%`}}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Conversion / Win Rate Column */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-slate-700 font-semibold">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{exec.conversionRate}%</span>
                      </div>
                    </td>

                    {/* Participation Status Column */}
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          isSelected
                            ? "text-indigo-700 bg-indigo-50 border border-indigo-200"
                            : "text-slate-400 bg-slate-100"
                        }`}
                      >
                        {isSelected ? "Selected" : "Excluded"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Action Footer */}
      <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-500">
          <strong className="text-slate-900 font-semibold">{selectedExecutiveIds.length}</strong> of {executives.length} representatives selected
        </div>

        <Button
          type="button"
          disabled={selectedExecutiveIds.length === 0}
          onClick={onAdvanceToStep2}
          className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>Continue to Step 2 (Allocate Leads)</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
