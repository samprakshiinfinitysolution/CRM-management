"use client";

import React, { useState, useMemo } from "react";
import {
  CheckSquare,
  Square,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { SalesExecutiveSummary } from "@/types/api.types";

interface CustomSplitSectionProps {
  executives: SalesExecutiveSummary[];
  selectedExecutiveIds: string[];
  onToggleExecutive: (id: string) => void;
  onSelectAllExecutives: () => void;
  onDeselectAllExecutives: () => void;
  quotas: Record<string, number>;
  onUpdateQuota: (id: string, quota: number) => void;
  totalUnassignedCount: number;
  targetLeadsCount: number;
  onTargetLeadsCountChange: (count: number) => void;
}

export const CustomSplitSection: React.FC<CustomSplitSectionProps> = ({
  executives,
  selectedExecutiveIds,
  onToggleExecutive,
  onSelectAllExecutives,
  onDeselectAllExecutives,
  quotas,
  onUpdateQuota,
  totalUnassignedCount,
  targetLeadsCount,
  onTargetLeadsCountChange,
}) => {
  const [isCustomTarget, setIsCustomTarget] = useState(false);
  const [customTargetVal, setCustomTargetVal] = useState<string>(
    String(targetLeadsCount || 30),
  );

  // Selected executives
  const selectedExecs = useMemo(() => {
    return executives.filter((e) => selectedExecutiveIds.includes(e.id));
  }, [executives, selectedExecutiveIds]);

  // Total allocated across selected executives
  const totalAllocated = useMemo(() => {
    return selectedExecs.reduce((sum, e) => sum + (quotas[e.id] || 0), 0);
  }, [selectedExecs, quotas]);

  const effectiveTarget = targetLeadsCount > 0 ? targetLeadsCount : 30;
  const remaining = effectiveTarget - totalAllocated;

  const isAllocationComplete =
    effectiveTarget > 0 && totalAllocated === effectiveTarget && selectedExecs.length > 0;

  // Preset options for target leads
  const presetOptions = useMemo(() => {
    const base = [10, 20, 30, 40].filter((n) => n <= totalUnassignedCount);
    if (
      totalUnassignedCount > 0 &&
      totalUnassignedCount <= 40 &&
      !base.includes(totalUnassignedCount)
    ) {
      base.push(totalUnassignedCount);
    }
    return base.sort((a, b) => a - b);
  }, [totalUnassignedCount]);

  const handleSelectPreset = (val: number) => {
    setIsCustomTarget(false);
    onTargetLeadsCountChange(val);
    setCustomTargetVal(String(val));
  };

  const handleCustomTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setCustomTargetVal(raw);
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed) && parsed > 0) {
      const clamped = Math.min(parsed, totalUnassignedCount || 1000);
      onTargetLeadsCountChange(clamped);
    }
  };

  const handleStepQuota = (id: string, delta: number) => {
    const current = quotas[id] || 0;
    const nextVal = Math.max(0, current + delta);
    onUpdateQuota(id, nextVal);
  };

  const handleInputChange = (id: string, valStr: string) => {
    const parsed = parseInt(valStr, 10);
    onUpdateQuota(id, isNaN(parsed) ? 0 : Math.max(0, parsed));
  };

  const getInitials = (name: string) => {
    if (!name) return "SE";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const isAllSelected =
    executives.length > 0 && selectedExecutiveIds.length === executives.length;

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* 1. EXECUTIVE SELECTED / TABLE (First in Step 2) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Selected Sales Executives & Lead Quotas
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Specify exact lead quantities for each participating sales executive.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
              {selectedExecs.length} executives selected
            </span>
            <button
              type="button"
              onClick={isAllSelected ? onDeselectAllExecutives : onSelectAllExecutives}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded hover:bg-indigo-50 transition-colors cursor-pointer"
            >
              {isAllSelected ? "Deselect All" : "Select All"}
            </button>
          </div>
        </div>

        {/* Selected Executives Allocation Table */}
        <div className="divide-y divide-slate-100 pt-2">
          {executives.map((exec) => {
            const isSelected = selectedExecutiveIds.includes(exec.id);
            const currentVal = quotas[exec.id] || 0;

            return (
              <div
                key={exec.id}
                className={`py-3 px-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  isSelected ? "bg-slate-50/60" : "opacity-60"
                }`}
              >
                {/* Left: Rep Details & Toggle */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onToggleExecutive(exec.id)}
                    className="text-slate-400 hover:text-indigo-600 focus:outline-none shrink-0 cursor-pointer"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300" />
                    )}
                  </button>

                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {getInitials(exec.name)}
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-900">
                      {exec.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {exec.totalAssignedLeads ?? exec.activeLeads ?? 0} currently assigned
                    </p>
                  </div>
                </div>

                {/* Right: Custom Quota Stepper & Numeric Input */}
                {isSelected ? (
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleStepQuota(exec.id, -1)}
                      disabled={currentVal <= 0}
                      className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center disabled:opacity-40 cursor-pointer transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <input
                      type="number"
                      min={0}
                      max={totalUnassignedCount || 1000}
                      value={currentVal}
                      onChange={(e) => handleInputChange(exec.id, e.target.value)}
                      className="w-16 h-8 text-center text-xs font-mono font-bold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />

                    <button
                      type="button"
                      onClick={() => handleStepQuota(exec.id, 1)}
                      disabled={remaining <= 0}
                      className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center disabled:opacity-40 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>

                    <span className="text-xs text-slate-500 font-medium pl-1">
                      leads
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">
                    Not included in distribution
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. LEAD QUANTITY & POOL (Then Lead) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col gap-4">
        {/* Unassigned Pool Banner */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Unassigned Leads Pool
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight mt-0.5">
              {totalUnassignedCount.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Available for custom distribution
            </p>
          </div>

          {/* Allocation status meter */}
          <div className="flex flex-col items-end">
            <span className="text-xs font-medium text-slate-500">
              Allocation Balance
            </span>
            <div
              className={`text-sm font-mono font-bold px-3 py-1 rounded-md border mt-1 flex items-center gap-1.5 ${
                isAllocationComplete
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : remaining > 0
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              {isAllocationComplete ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    {totalAllocated} / {effectiveTarget} Balanced
                  </span>
                </>
              ) : remaining > 0 ? (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>
                    {totalAllocated} / {effectiveTarget} ({remaining} remaining)
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span>
                    {totalAllocated} / {effectiveTarget} ({Math.abs(remaining)} overallocated)
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Target Lead Quantity Presets */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Target Lead Quantity
            </h3>
            <span className="text-xs font-mono font-semibold text-slate-600">
              Target: {effectiveTarget} leads
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {presetOptions.map((preset) => {
              const isSelected = !isCustomTarget && targetLeadsCount === preset;

              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {preset}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setIsCustomTarget(true)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                isCustomTarget
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              Custom
            </button>

            {isCustomTarget && (
              <div className="flex items-center gap-2 pl-2">
                <input
                  type="number"
                  min={1}
                  max={totalUnassignedCount || 1000}
                  value={customTargetVal}
                  onChange={handleCustomTargetChange}
                  placeholder="Target quantity"
                  className="w-28 px-3 py-1.5 text-xs font-mono font-medium rounded-lg border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
                <span className="text-xs text-slate-500">
                  max {totalUnassignedCount.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
