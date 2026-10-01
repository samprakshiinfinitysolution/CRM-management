"use client";

import React from "react";
import { ArrowRight, RotateCcw, Zap, Bookmark, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DistributeStickyCommandBarProps {
  currentStep: 1 | 2;
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
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-4xl bg-slate-950/95 dark:bg-slate-900/95 text-white backdrop-blur-xl border border-slate-800 rounded-3xl px-5 py-3.5 shadow-2xl flex items-center justify-between gap-4">
      {/* Left Info */}
      <div className="flex items-center gap-3">
        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
        <div>
          <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 flex-wrap">
            <span>{selectedLeadCount} Leads Selected</span>
            {totalEstValue && (
              <span className="text-emerald-400 font-semibold">({totalEstValue})</span>
            )}
            {totalPoolCount !== undefined && (
              <span className="text-slate-400 font-normal text-xs">
                • {totalPoolCount} Available in Pool
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            {currentStep === 1
              ? "Ready for Rep Assignment"
              : "ACID Atomic Transaction Guard Active"}
          </p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold px-2 py-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>

        {currentStep === 1 ? (
          <Button
            type="button"
            disabled={selectedLeadCount === 0}
            onClick={onNextStep}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-[0.98]"
          >
            <span>Continue to Rep Assignment (Step 2)</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onPrevStep}
              className="px-3.5 py-2 rounded-2xl border-slate-700 text-hover hover:bg-slate-500 text-xs font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back</span>
            </Button>

            <Button
              type="button"
              disabled={!isValid || isSubmitting}
              onClick={onConfirmDistribute}
              className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Committing...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Confirm & Commit ({selectedLeadCount} Leads)</span>
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
