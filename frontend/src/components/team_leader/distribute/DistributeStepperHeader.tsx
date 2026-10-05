'use client';

import React from 'react';
import { ShieldCheck, Check } from 'lucide-react';

interface DistributeStepperHeaderProps {
  currentStep: 1 | 2;
  onSelectStep: (step: 1 | 2) => void;
  selectedExecCount?: number;
  totalExecCount?: number;
  selectedLeadCount?: number;
  activeMode?: string;
  selectedCount?: number; // legacy fallback
}

export const DistributeStepperHeader: React.FC<DistributeStepperHeaderProps> = ({
  currentStep,
  onSelectStep,
  selectedExecCount,
  totalExecCount,
  selectedLeadCount,
  activeMode,
  selectedCount,
}) => {
  // Use selectedExecCount if provided, else fallback
  const execCount = selectedExecCount !== undefined ? selectedExecCount : (selectedCount ?? 0);
  const leadCount = selectedLeadCount ?? 0;

  return (
    <div className="flex flex-col gap-4 pb-2">
      {/* Top Title Bar */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <span className="w-2 h-2 rounded-full bg-indigo-600 dark:text-indigo-400 animate-pulse" />
            Live Pipeline Orchestrator
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Lead Distribution Engine
          </h1>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>TL SECURE</span>
        </div>
      </div>

      {/* Stepper Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between max-w-2xl mx-auto relative">
          {/* Step 1: Select Executives */}
          <button
            type="button"
            onClick={() => onSelectStep(1)}
            className="flex items-center gap-3.5 text-left group cursor-pointer focus:outline-none"
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                currentStep === 1
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-4 ring-indigo-100 dark:ring-indigo-950/60'
                  : execCount > 0
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}
            >
              {currentStep === 2 && execCount > 0 ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                  1. Select Executives
                </span>
                {execCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60">
                    {execCount} {totalExecCount ? `/ ${totalExecCount}` : ''} Selected
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {currentStep === 1 ? 'Step 1 of 2 · In Progress' : 'Step 1 of 2 · Completed'}
              </p>
            </div>
          </button>

          {/* Stepper Divider */}
          <div className="flex-1 mx-6 h-[2px] bg-slate-200 dark:bg-slate-800 relative">
            <div
              className={`h-full bg-indigo-600 transition-all duration-300 ${
                currentStep === 2 ? 'w-full' : 'w-1/2'
              }`}
            />
          </div>

          {/* Step 2: Split & Lead Distribution */}
          <button
            type="button"
            onClick={() => onSelectStep(2)}
            className="flex items-center gap-3.5 text-left group cursor-pointer focus:outline-none"
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                currentStep === 2
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-4 ring-indigo-100 dark:ring-indigo-950/60'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
            >
              2
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                  2. Split & Distribution
                </span>
                {currentStep === 2 && activeMode && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60">
                    {activeMode.replace('_', ' ')}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {currentStep === 2
                  ? leadCount > 0
                    ? `${leadCount} Leads Targeted`
                    : 'Equal / Fixed / Manual Split'
                  : 'Configure rules & allocate'}
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
