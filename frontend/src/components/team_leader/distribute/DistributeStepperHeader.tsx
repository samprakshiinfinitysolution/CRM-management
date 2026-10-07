"use client";

import React from "react";
import { Check } from "lucide-react";

interface DistributeStepperHeaderProps {
  currentStep: 1 | 2;
  onSelectStep: (step: 1 | 2) => void;
  selectedExecCount?: number;
  totalExecCount?: number;
  selectedLeadCount?: number;
  activeMode?: string;
  selectedCount?: number; // legacy fallback
}

export const DistributeStepperHeader: React.FC<
  DistributeStepperHeaderProps
> = ({
  currentStep,
  onSelectStep,
  selectedExecCount,
  selectedLeadCount,
  selectedCount,
}) => {
  // Use selectedExecCount if provided, else fallback
  const execCount =
    selectedExecCount !== undefined ? selectedExecCount : (selectedCount ?? 0);
  const leadCount = selectedLeadCount ?? 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Top Title Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Distribute Leads
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Select team members and allocate unassigned leads to your sales pipeline.
          </p>
        </div>
      </div>

      {/* Stepper Card */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between max-w-xl mx-auto relative">
          {/* Step 1: Select Executives */}
          <button
            type="button"
            onClick={() => onSelectStep(1)}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                currentStep === 1
                  ? "bg-indigo-600 text-white shadow-xs ring-4 ring-indigo-50"
                  : execCount > 0
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-500"
              }`}
            >
              {currentStep === 2 && execCount > 0 ? (
                <Check className="w-4 h-4" />
              ) : (
                "1"
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold transition-colors ${
                    currentStep === 1 ? "text-indigo-600" : "text-slate-800"
                  }`}
                >
                  1. Select Team
                </span>
                {execCount > 0 && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {execCount} Selected
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {currentStep === 1 ? "Choose representatives" : "Completed"}
              </p>
            </div>
          </button>

          {/* Stepper Divider */}
          <div className="flex-1 mx-4 h-[2px] bg-slate-200 relative">
            <div
              className={`h-full bg-indigo-600 transition-all duration-300 ${
                currentStep === 2 ? "w-full" : "w-0"
              }`}
            />
          </div>

          {/* Step 2: Distribution Settings */}
          <button
            type="button"
            onClick={() => execCount > 0 && onSelectStep(2)}
            disabled={execCount === 0}
            className={`flex items-center gap-3 text-left group focus:outline-none ${
              execCount > 0 ? "cursor-pointer" : "cursor-not-allowed opacity-60"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                currentStep === 2
                  ? "bg-indigo-600 text-white shadow-xs ring-4 ring-indigo-50"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              2
            </div>
            <div>
              <span
                className={`text-xs font-bold transition-colors ${
                  currentStep === 2 ? "text-indigo-600" : "text-slate-800"
                }`}
              >
                2. Allocate Leads
              </span>
              <p className="text-[11px] text-slate-400">
                {currentStep === 2
                  ? leadCount > 0
                    ? `${leadCount} leads targeted`
                    : "Configure allocation rule"
                  : "Configure allocation rules"}
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
