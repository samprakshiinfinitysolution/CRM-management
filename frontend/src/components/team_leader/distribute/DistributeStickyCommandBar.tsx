"use client";

import React from "react";
import { ArrowRight, RotateCcw, Zap, Bookmark, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DistributeStickyCommandBarProps {
  currentStep: 1 | 2;
  selectedExecCount?: number;
  totalExecCount?: number;
  selectedLeadCount: number;
  totalPoolCount?: number;
  totalEstValue?: string;
  onReset: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onConfirmDistribute: () => void;
  isSubmitting?: boolean;
  isValid?: boolean;
}

export const DistributeStickyCommandBar: React.FC<
  DistributeStickyCommandBarProps
> = ({
  currentStep,
  selectedExecCount = 0,
  totalExecCount,
  selectedLeadCount,
  totalPoolCount,
  totalEstValue,
  onReset,
  onNextStep,
  onPrevStep,
  onConfirmDistribute,
  isSubmitting = false,
  isValid = true,
}) => {
  const targetLeadsCount =
    selectedLeadCount > 0 ? selectedLeadCount : (totalPoolCount ?? 0);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-4xl bg-slate-950/95 dark:bg-slate-900/95 text-white backdrop-blur-xl border border-slate-800 rounded-3xl px-5 py-3.5 shadow-2xl flex items-center justify-between gap-4">
      {/* Left Info */}
      <div className="flex items-center gap-3">
        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
        <div>
          {currentStep === 1 ? (
            <>
              <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 flex-wrap">
                <span>{selectedExecCount} Sales Executives Selected</span>
                {totalExecCount !== undefined && (
                  <span className="text-slate-400 font-normal text-xs">
                    • {totalExecCount} Active Reps
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Step 1 of 2: Choose participating sales reps
              </p>
            </>
          ) : (
            <>
              <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 flex-wrap">
                <span>{targetLeadsCount} Leads to Distribute</span>
                {totalEstValue && (
                  <span className="text-emerald-400 font-semibold">({totalEstValue})</span>
                )}
                {totalPoolCount !== undefined && selectedLeadCount > 0 && (
                  <span className="text-slate-400 font-normal text-xs">
                    • of {totalPoolCount} in Pool
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Allocating across {selectedExecCount} selected {selectedExecCount === 1 ? "executive" : "executives"}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold px-2 py-1"
          title={currentStep === 1 ? "Clear executive selection" : "Clear lead selection"}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>

        {currentStep === 1 ? (
          <Button
            type="button"
            disabled={selectedExecCount === 0}
            onClick={onNextStep}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-[0.98] disabled:opacity-40"
          >
            <span>Continue to Split & Distribution (Step 2)</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onPrevStep}
              className="px-3.5 py-2 rounded-2xl border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white text-xs font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Reps</span>
            </Button>

            <Button
              type="button"
              disabled={!isValid || isSubmitting}
              onClick={onConfirmDistribute}
              className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-40"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Committing...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Confirm & Commit ({targetLeadsCount} Leads)</span>
                </>
              )}
            </Button>
          </div>
        )}

        <button
          type="button"
          title="Save as Draft"
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300"
        >
          <Bookmark className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
