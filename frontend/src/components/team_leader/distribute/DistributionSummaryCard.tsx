"use client";

import React from "react";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  AlertCircle,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DistributionTabMode } from "./DistributeModeSelector";

interface DistributionSummaryCardProps {
  mode: DistributionTabMode;
  totalLeadsToDistribute: number;
  selectedExecutiveCount: number;
  allocatedCount: number;
  remainderCount: number;
  isSubmitting?: boolean;
  onExecuteDistribution: () => void;
  isValid: boolean;
  validationMessage?: string;
}

export const DistributionSummaryCard: React.FC<
  DistributionSummaryCardProps
> = ({
  mode,
  totalLeadsToDistribute,
  selectedExecutiveCount,
  allocatedCount,
  remainderCount,
  isSubmitting = false,
  onExecuteDistribution,
  isValid = true,
  validationMessage,
}) => {
  const formatModeBadge = (m: string) => {
    switch (m) {
      case "EQUAL_SPLIT":
        return "EQUAL SPLIT";
      case "FIXED_QUOTA":
        return "FIXED QUOTA";
      case "MANUAL_PICK":
        return "MANUAL PICK";
      case "REASSIGN_RECALL":
        return "REASSIGN / RECALL";
      default:
        return m.replace("_", " ");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl p-6 md:p-7 shadow-xs border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between gap-6 transition-all">
      {/* Top Title & Badge */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base md:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Distribution Engine Summary
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Deterministic allocation calculation before atomic database commit
          </p>
        </div>

        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 tracking-wider uppercase shrink-0">
          {formatModeBadge(mode)}
        </span>
      </div>

      {/* Numerical Metrics Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 space-y-1 shadow-2xs">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
            Total Leads
          </span>
          <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
            {totalLeadsToDistribute}
          </div>
        </div>

        <div className="bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 space-y-1 shadow-2xs">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
            Active Targets
          </span>
          <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
            {selectedExecutiveCount}
          </div>
        </div>

        <div className="bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 space-y-1 shadow-2xs">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
            Will Allocate
          </span>
          <div className="text-2xl md:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {allocatedCount}
          </div>
        </div>

        <div className="bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 space-y-1 shadow-2xs">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
            Pool Remainder
          </span>
          <div className="text-2xl md:text-3xl font-black text-amber-600 dark:text-amber-400">
            {remainderCount}
          </div>
        </div>
      </div>

      {/* Validation Message or ACID Guarantee */}
      <div className="space-y-2">
        {!isValid && validationMessage ? (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-200 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{validationMessage}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              <strong className="text-slate-900 dark:text-white font-semibold">ACID Guarantee:</strong> Distribution executes inside an
              isolated transaction. History ledger is automatically preserved.
            </span>
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Lock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Authorized Team Leader</span>
        </div>

        <Button
          type="button"
          disabled={!isValid || isSubmitting || allocatedCount === 0}
          onClick={onExecuteDistribution}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Distributing Leads...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Confirm & Allocate {allocatedCount} Leads</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
