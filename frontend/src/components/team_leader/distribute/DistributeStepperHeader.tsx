"use client";

import React from "react";
import { Check } from "lucide-react";

interface DistributeStepperHeaderProps {
  currentStep?: 1 | 2 | 3;
  onSelectStep?: (step: 1 | 2 | 3) => void;
  selectedExecCount?: number;
  totalExecCount?: number;
  selectedLeadCount?: number;
  activeMode?: string;
}

export const DistributeStepperHeader: React.FC<
  DistributeStepperHeaderProps
> = ({
  currentStep = 1,
  onSelectStep,
}) => {
  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 1. Horizontal Stepper Card */}

      {/* 2. Page Structure Header */}
      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-bold tracking-wider text-indigo-600 uppercase">
          STEP {currentStep} OF 3
        </span>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {currentStep === 1 && "Select Sales Executives"}
          {currentStep === 2 && "Distribute Leads"}
          {currentStep === 3 && "Review & Confirm Distribution"}
        </h1>
        <p className="text-sm text-slate-600">
          {currentStep === 1 &&
            "Choose which sales executives will participate in this lead distribution."}
          {currentStep === 2 &&
            "Choose how you want to distribute the selected leads across your sales executives."}
          {currentStep === 3 &&
            "Review the selected executives and lead allocations before executing."}
        </p>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-xs">
        <div className="flex items-center justify-between max-w-xl mx-auto relative">
          {/* Step 1: Select Executives */}
          <button
            type="button"
            onClick={() => onSelectStep?.(1)}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-xs shrink-0 transition-all ${
                currentStep > 1
                  ? "bg-emerald-600 text-white"
                  : currentStep === 1
                    ? "bg-indigo-600 text-white ring-4 ring-indigo-50"
                    : "bg-slate-100 text-slate-400 border border-slate-200"
              }`}
            >
              {currentStep > 1 ? (
                <Check className="w-4 h-4 stroke-[2.5]" />
              ) : (
                "1"
              )}
            </div>
            <div>
              <span
                className={`text-xs font-semibold ${
                  currentStep === 1
                    ? "text-indigo-600 font-bold"
                    : "text-slate-800"
                }`}
              >
                1. Select Reps
              </span>
              <p
                className={`text-[11px] font-medium ${
                  currentStep > 1
                    ? "text-emerald-600"
                    : currentStep === 1
                      ? "text-indigo-600"
                      : "text-slate-400"
                }`}
              >
                {currentStep > 1
                  ? "Completed"
                  : currentStep === 1
                    ? "In Progress"
                    : "Pending"}
              </p>
            </div>
          </button>

          {/* Stepper Connector 1 -> 2 */}
          <div
            className={`flex-1 mx-3 sm:mx-5 h-[2px] rounded-full transition-all ${
              currentStep >= 2 ? "bg-indigo-600" : "bg-slate-200"
            }`}
          />

          {/* Step 2: Distribute Strategy */}
          <button
            type="button"
            onClick={() => onSelectStep?.(2)}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-xs shrink-0 transition-all ${
                currentStep > 2
                  ? "bg-emerald-600 text-white"
                  : currentStep === 2
                    ? "bg-indigo-600 text-white ring-4 ring-indigo-50"
                    : "bg-slate-100 text-slate-400 border border-slate-200"
              }`}
            >
              {currentStep > 2 ? (
                <Check className="w-4 h-4 stroke-[2.5]" />
              ) : (
                "2"
              )}
            </div>
            <div>
              <span
                className={`text-xs font-semibold ${
                  currentStep === 2
                    ? "text-indigo-600 font-bold"
                    : "text-slate-800"
                }`}
              >
                2. Set Allocations
              </span>
              <p
                className={`text-[11px] font-medium ${
                  currentStep > 2
                    ? "text-emerald-600"
                    : currentStep === 2
                      ? "text-indigo-600"
                      : "text-slate-400"
                }`}
              >
                {currentStep > 2
                  ? "Completed"
                  : currentStep === 2
                    ? "In Progress"
                    : "Next"}
              </p>
            </div>
          </button>

          {/* Stepper Connector 2 -> 3 */}
          <div
            className={`flex-1 mx-3 sm:mx-5 h-[2px] rounded-full transition-all ${
              currentStep >= 3 ? "bg-indigo-600" : "bg-slate-200"
            }`}
          />

          {/* Step 3: Review & Confirm */}
          <button
            type="button"
            onClick={() => onSelectStep?.(3)}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-medium text-xs shrink-0 transition-all ${
                currentStep === 3
                  ? "bg-indigo-600 text-white font-bold ring-4 ring-indigo-50 shadow-xs"
                  : "bg-slate-100 text-slate-400 border border-slate-200"
              }`}
            >
              3
            </div>
            <div>
              <span
                className={`text-xs font-semibold ${
                  currentStep === 3
                    ? "text-indigo-600 font-bold"
                    : "text-slate-600"
                }`}
              >
                3. Review & Confirm
              </span>
              <p
                className={`text-[11px] font-medium ${
                  currentStep === 3 ? "text-indigo-600" : "text-slate-400"
                }`}
              >
                {currentStep === 3 ? "Ready" : "Final Step"}
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
