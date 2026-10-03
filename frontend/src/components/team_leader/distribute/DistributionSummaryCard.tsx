"use client";

import React from "react";
import {
  Sparkles,
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
  return (
    <div className="bg-linear-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-5 md:p-6 shadow-xl border border-indigo-900/50 flex flex-col justify-between gap-6">
      {/* Top Title & Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-bold tracking-tight">
              Distribution Engine Summary
            </h3>
            <p className="text-xs text-slate-400">
              Live dry-run calculation before atomic database commit
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
          {mode.replace("_", " ")}
        </span>
      </div>

      {/* Numerical Metrics Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
            Available Leads
          </span>
          <div className="text-xl md:text-2xl font-black text-white">
            {totalLeadsToDistribute}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
            Active Targets
          </span>
          <div className="text-xl md:text-2xl font-black text-white">
            {selectedExecutiveCount}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
            Will Allocate
          </span>
          <div className="text-xl md:text-2xl font-black text-emerald-400">
            {allocatedCount}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
            Pool Remainder
          </span>
          <div className="text-xl md:text-2xl font-black text-amber-400">
            {remainderCount}
          </div>
        </div>
      </div>

      {/* Validation Message or Security Note */}
      <div className="space-y-2">
        {!isValid && validationMessage ? (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{validationMessage}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>ACID Guarantee:</strong> Distribution executes inside an
              isolated transaction. History ledger is automatically preserved.
            </span>
          </div>
        )}
      </div>

      {/* Bottom CTA Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Lock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Role: Authorized Team Leader</span>
        </div>

        <Button
          type="button"
          disabled={!isValid || isSubmitting || allocatedCount === 0}
          onClick={onExecuteDistribution}
          className="w-full sm:w-auto px-8 py-5 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Distributing Leads...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Confirm & Allocate {allocatedCount} Leads</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
