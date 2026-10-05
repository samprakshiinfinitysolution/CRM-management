"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Check,
  Users,
  TrendingUp,
  ArrowRight,
  CheckSquare,
  Square,
} from "lucide-react";
import { SalesExecutiveSummary } from "@/types/api.types";
import { Button } from "@/components/ui/button";

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
        !searchTerm.trim() ||
        e.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        e.email.toLowerCase().includes(searchTerm.toLowerCase().trim());

      const matchesWorkload =
        workloadFilter === "ALL" || e.workloadStatus === workloadFilter;

      return matchesSearch && matchesWorkload;
    });
  }, [executives, searchTerm, workloadFilter]);

  const isAllSelected =
    filteredExecutives.length > 0 &&
    filteredExecutives.every((e) => selectedExecutiveIds.includes(e.id));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPTIMAL":
        return {
          label: "Optimal",
          badge:
            "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
          bar: "bg-emerald-500",
        };
      case "NEAR_CAPACITY":
        return {
          label: "Near Capacity",
          badge:
            "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
          bar: "bg-amber-500",
        };
      case "OVERLOADED":
        return {
          label: "Overloaded",
          badge:
            "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
          bar: "bg-rose-500",
        };
      default:
        return {
          label: "Active",
          badge:
            "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
          bar: "bg-indigo-500",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Filter Controls Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-xs flex flex-col gap-5">
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
              Choose the sales representatives who will participate in this lead
              distribution round. Use the table below to review workload
              capacity and conversion rates before advancing.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-crm-brand-hover opacity-90">
              {selectedExecutiveIds.length} of {executives.length}{" "}
              Representatives Selected
            </span>

            {/* Quick Select Actions */}
            <div className="flex items-center gap-2 self-start md:self-center">
              <button
                type="button"
                onClick={isAllSelected ? onDeselectAll : onSelectAll}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800 transition-colors cursor-pointer"
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

              <Button
                type="button"
                disabled={selectedExecutiveIds.length === 0}
                onClick={onAdvanceToStep2}
                className="flex-1 sm:flex-initial px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Continue to (Step 2)</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {selectedExecutiveIds.length > 0 && (
              <Button
                variant="outline"
                onClick={onDeselectAll}
                className="px-3 py-2 w-fit rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-500 transition-colors cursor-pointer"
              >
                Clear Selection
              </Button>
            )}
          </div>
        </div>

        {/* Search & Workload Filter Controls */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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
                onClick={() => setSearchTerm("")}
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
              onClick={() => setWorkloadFilter("ALL")}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
                workloadFilter === "ALL"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              All ({workloadCounts.ALL})
            </button>
            <button
              type="button"
              onClick={() => setWorkloadFilter("OPTIMAL")}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
                workloadFilter === "OPTIMAL"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
              }`}
            >
              Optimal ({workloadCounts.OPTIMAL})
            </button>
            <button
              type="button"
              onClick={() => setWorkloadFilter("NEAR_CAPACITY")}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
                workloadFilter === "NEAR_CAPACITY"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300"
              }`}
            >
              Near Capacity ({workloadCounts.NEAR_CAPACITY})
            </button>
            <button
              type="button"
              onClick={() => setWorkloadFilter("OVERLOADED")}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
                workloadFilter === "OVERLOADED"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300"
              }`}
            >
              Overloaded ({workloadCounts.OVERLOADED})
            </button>
          </div>
        </div>
      </div>

      {/* 2. Executive Table View */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">
                  <button
                    type="button"
                    onClick={isAllSelected ? onDeselectAll : onSelectAll}
                    className="p-1 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                    title={
                      isAllSelected ? "Deselect all" : "Select all on page"
                    }
                  >
                    {isAllSelected ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-4">Sales Representative</th>
                <th className="py-3.5 px-4">Workload Status</th>
                <th className="py-3.5 px-4">Active Leads / Capacity</th>
                <th className="py-3.5 px-4">Win Rate</th>
                <th className="py-3.5 px-4">Participation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-semibold">
                        Loading sales representatives...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredExecutives.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <Users className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        No sales executives found
                      </span>
                      <p className="text-xs text-slate-400">
                        {searchTerm || workloadFilter !== "ALL"
                          ? "Try adjusting your search query or workload status filter."
                          : "No active sales executives are available in the organization."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExecutives.map((exec) => {
                  const isSelected = selectedExecutiveIds.includes(exec.id);
                  const statusInfo = getStatusBadge(exec.workloadStatus);
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
                      className={`group transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40"
                          : "hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      {/* Checkbox Column */}
                      <td
                        className="py-3.5 px-4 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleExecutive(exec.id);
                        }}
                      >
                        <div
                          className={`w-5 h-5 mx-auto rounded-md flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "border border-slate-300 dark:border-slate-600 text-transparent group-hover:border-slate-400"
                          }`}
                        >
                          <Check
                            className={`w-3.5 h-3.5 ${isSelected ? "opacity-100" : "opacity-0"}`}
                          />
                        </div>
                      </td>

                      {/* Representative Column */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                              isSelected
                                ? "bg-indigo-600 text-white shadow-xs"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
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
                            <span className="font-bold text-slate-900 dark:text-white block truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {exec.name}
                            </span>
                            <span className="text-[11px] text-slate-400 block truncate">
                              {exec.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Workload Status Badge Column */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.badge}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Active Leads / Capacity Column */}
                      <td className="py-3.5 px-4 min-w-[180px]">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500 font-medium">
                              {currentLeads} of {maxCapacity} leads
                            </span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                              {capacityPercent}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${statusInfo.bar}`}
                              style={{ width: `${capacityPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Conversion / Win Rate Column */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {exec.conversionRate}%
                          </span>
                        </div>
                      </td>

                      {/* Participation Status Column */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                            isSelected
                              ? "text-indigo-700 dark:text-indigo-300 bg-indigo-100/70 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800"
                              : "text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60"
                          }`}
                        >
                          {isSelected ? "✓ Included" : "Excluded"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      
    </div>
  );
};
