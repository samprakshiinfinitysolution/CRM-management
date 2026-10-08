"use client";

import React, { useState, useMemo } from "react";
import { CheckSquare, Square, Info, AlertCircle } from "lucide-react";
import { SalesExecutiveSummary } from "@/types/api.types";

interface EqualSplitSectionProps {
  executives: SalesExecutiveSummary[];
  selectedExecutiveIds: string[];
  onToggleExecutive: (id: string) => void;
  onSelectAllExecutives: () => void;
  onDeselectAllExecutives: () => void;
  totalUnassignedCount: number;
  quantity: number;
  onQuantityChange: (qty: number) => void;
}

export const EqualSplitSection: React.FC<EqualSplitSectionProps> = ({
  executives,
  selectedExecutiveIds,
  onToggleExecutive,
  onSelectAllExecutives,
  onDeselectAllExecutives,
  totalUnassignedCount,
  quantity,
  onQuantityChange,
}) => {
  const [isCustomQty, setIsCustomQty] = useState(false);
  const [customInputVal, setCustomInputVal] = useState<string>(
    quantity > 0 ? String(quantity) : "",
  );

  // Compute preset options (e.g. 10, 20, 30, 50, and All Unassigned)
  const presetOptions = useMemo(() => {
    const base = [10, 20, 30, 50].filter((n) => n <= totalUnassignedCount);
    if (
      totalUnassignedCount > 0 &&
      !base.includes(totalUnassignedCount)
    ) {
      base.push(totalUnassignedCount);
    }
    return Array.from(new Set(base)).sort((a, b) => a - b);
  }, [totalUnassignedCount]);

  // Selected executives list
  const selectedExecs = useMemo(() => {
    return executives.filter((e) => selectedExecutiveIds.includes(e.id));
  }, [executives, selectedExecutiveIds]);

  const selectedCount = selectedExecs.length;

  // Manual input parsing & validation - only evaluate when custom mode is active and user has entered a value
  const parsedCustomQty = parseInt(customInputVal, 10);
  const isInputOverTotal =
    isCustomQty &&
    customInputVal.trim() !== "" &&
    !isNaN(parsedCustomQty) &&
    parsedCustomQty > totalUnassignedCount;
  const isInputUnderExecs =
    isCustomQty &&
    customInputVal.trim() !== "" &&
    !isNaN(parsedCustomQty) &&
    selectedCount > 0 &&
    parsedCustomQty > 0 &&
    parsedCustomQty < selectedCount;

  // Mathematical Distribution Calculation (No lead records)
  const effectiveQty = isInputOverTotal ? 0 : quantity;
  const baseCount =
    selectedCount > 0 && effectiveQty > 0
      ? Math.floor(effectiveQty / selectedCount)
      : 0;
  const remainder =
    selectedCount > 0 && effectiveQty > 0
      ? effectiveQty % selectedCount
      : 0;

  const distributionPreview = useMemo(() => {
    return selectedExecs.map((exec, index) => {
      const allocated = baseCount + (index < remainder ? 1 : 0);
      return {
        id: exec.id,
        name: exec.name,
        allocated,
      };
    });
  }, [selectedExecs, baseCount, remainder]);

  const handleSelectPreset = (val: number) => {
    setIsCustomQty(false);
    onQuantityChange(val);
    setCustomInputVal(String(val));
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setCustomInputVal(raw);
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed)) {
      onQuantityChange(parsed);
    } else if (raw === "") {
      onQuantityChange(0);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "SE";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const isAllSelected =
    executives.length > 0 &&
    selectedExecutiveIds.length === executives.length;

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* 1. EXECUTIVE SELECTED / TABLE (First in Step 2) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Selected Sales Executives
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Executives who will receive an equal portion of the leads.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
              {selectedCount} executives selected
            </span>
            <button
              type="button"
              onClick={
                isAllSelected
                  ? onDeselectAllExecutives
                  : onSelectAllExecutives
              }
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded hover:bg-indigo-50 transition-colors cursor-pointer"
            >
              {isAllSelected ? "Deselect All" : "Select All"}
            </button>
          </div>
        </div>

        {/* Compact List of Selected/Available Executives */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-4">
          {executives.map((exec) => {
            const isSelected = selectedExecutiveIds.includes(exec.id);

            return (
              <div
                key={exec.id}
                onClick={() => onToggleExecutive(exec.id)}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-indigo-50/50 border-indigo-300 shadow-2xs"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                {/* Checkbox */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExecutive(exec.id);
                  }}
                  className="text-slate-400 hover:text-indigo-600 focus:outline-none shrink-0"
                >
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4 text-indigo-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-300" />
                  )}
                </button>

                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                  {getInitials(exec.name)}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {exec.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {exec.totalAssignedLeads ?? exec.activeLeads ?? 0} currently assigned
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. LEAD QUANTITY & POOL (Then Lead) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col gap-4">
        {/* Unassigned Leads Pool Summary */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Unassigned Leads Pool
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight mt-0.5">
              {totalUnassignedCount.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Available for equal split distribution
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-xs font-medium text-slate-400">
              Distribution Engine
            </span>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 mt-1">
              Equal Division Algorithm
            </span>
          </div>
        </div>

        {/* Lead Quantity Control */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                How many leads do you want to distribute?
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose a preset option or enter a custom number from available unassigned leads.
              </p>
            </div>
            <span
              className={`text-xs font-mono font-bold px-2.5 py-1 rounded border ${
                isInputOverTotal
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : isInputUnderExecs
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : quantity > 0
                      ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                      : "bg-slate-50 text-slate-500 border-slate-200"
              }`}
            >
              {quantity > 0 ? `Selected: ${quantity} leads` : "No quantity selected"}
            </span>
          </div>

          {/* Quantity Presets */}
          <div className="flex flex-wrap items-center gap-2">
            {presetOptions.map((preset) => {
              const isSelected = !isCustomQty && quantity === preset;

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
                  {preset === totalUnassignedCount ? `All (${preset})` : `${preset} Leads`}
                </button>
              );
            })}

            {/* Custom Option Toggle */}
            <button
              type="button"
              onClick={() => setIsCustomQty(true)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                isCustomQty
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              Custom Number
            </button>

            {/* Custom Numeric Input */}
            {isCustomQty && (
              <div className="flex items-center gap-2 pl-1">
                <input
                  type="number"
                  min={1}
                  value={customInputVal}
                  onChange={handleCustomInputChange}
                  placeholder="Enter quantity"
                  className={`w-32 px-3 py-1.5 text-xs font-mono font-bold rounded-lg border focus:outline-none focus:ring-2 bg-white transition-all ${
                    isInputOverTotal
                      ? "border-rose-400 text-rose-700 focus:ring-rose-500 bg-rose-50/30"
                      : isInputUnderExecs
                        ? "border-amber-400 text-amber-700 focus:ring-amber-500"
                        : "border-indigo-300 text-slate-900 focus:ring-indigo-500"
                  }`}
                />
                <span className="text-xs text-slate-500">
                  of {totalUnassignedCount.toLocaleString()} max
                </span>
              </div>
            )}
          </div>

          {/* Over-capacity and under-capacity alert banners */}
          {isInputOverTotal && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs mt-3 animate-in fade-in-50">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Quantity exceeds available leads</p>
                <p className="text-[11px] text-rose-700 mt-0.5">
                  You selected <strong>{parsedCustomQty} leads</strong>, but only{" "}
                  <strong>{totalUnassignedCount} unassigned leads</strong> exist in the pool. Please reduce your quantity to {totalUnassignedCount} or fewer.
                </p>
              </div>
            </div>
          )}

          {isInputUnderExecs && !isInputOverTotal && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs mt-3 animate-in fade-in-50">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Lead quantity is less than selected executives</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  You selected <strong>{parsedCustomQty} leads</strong> for{" "}
                  <strong>{selectedCount} executives</strong>. For equal distribution, each executive must receive at least 1 lead (minimum {selectedCount} leads required).
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. EQUAL DISTRIBUTION PREVIEW (Mathematical only) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Distribution Preview
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Mathematical allocation summary across selected executives.
            </p>
          </div>
          {selectedCount > 0 && quantity > 0 && (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-800">
                {quantity} leads
              </span>
              <span>·</span>
              <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-800">
                {selectedCount} executives
              </span>
            </div>
          )}
        </div>

        {selectedCount === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            Select sales executives above to preview equal distribution.
          </div>
        ) : quantity <= 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            Please choose a preset option (e.g. 10, 20, 30, All) or enter a custom number above to preview equal distribution.
          </div>
        ) : (
          <div className="pt-3 flex flex-col gap-3">
            {/* Clean mathematical distribution summary */}
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
              {distributionPreview.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-4 py-2.5 text-xs hover:bg-slate-50/50"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[10px] flex items-center justify-center">
                      {getInitials(item.name)}
                    </div>
                    <span className="font-semibold text-slate-800">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded">
                    {item.allocated} leads
                  </span>
                </div>
              ))}
            </div>

            {/* Remainder Explanation Note */}
            {remainder > 0 && (
              <div className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-xs text-slate-600">
                <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <p>
                  <span className="font-semibold text-slate-800">
                    {remainder} lead{remainder > 1 ? "s" : ""}
                  </span>{" "}
                  will be allocated to the first{" "}
                  {remainder === 1
                    ? "executive"
                    : `${remainder} executives`}{" "}
                  based on the selected distribution order.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
