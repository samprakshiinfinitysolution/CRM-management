"use client";

import React from "react";
import { Download, UserCheck, RotateCcw, X } from "lucide-react";

interface LeadsBulkActionBarProps {
  selectedCount: number;
  isTL: boolean;
  onExport: () => void;
  onReassign?: () => void;
  onRecall?: () => void;
  onClear: () => void;
}

export function LeadsBulkActionBar({
  selectedCount,
  isTL,
  onExport,
  onReassign,
  onRecall,
  onClear,
}: LeadsBulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 border border-slate-800 animate-in slide-in-from-bottom-5 duration-200">
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">
          {selectedCount}
        </span>
        <span className="text-xs font-semibold text-slate-200">
          Leads Selected
        </span>
      </div>

      <div className="h-4 w-px bg-slate-700" />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onExport}
          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Selected ({selectedCount})</span>
        </button>

        {isTL && (
          <>
            {onReassign && (
              <button
                type="button"
                onClick={onReassign}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Reassign</span>
              </button>
            )}

            {onRecall && (
              <button
                type="button"
                onClick={onRecall}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Recall to Pool</span>
              </button>
            )}
          </>
        )}

        <button
          type="button"
          onClick={onClear}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Clear Selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
