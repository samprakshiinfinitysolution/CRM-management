'use client';

import React from 'react';
import {
  Scale,
  Sliders,
  CheckSquare,
  ArrowLeftRight,
  Sparkles,
} from 'lucide-react';

export type DistributionTabMode = 'EQUAL_SPLIT' | 'FIXED_QUOTA' | 'MANUAL_PICK' | 'REASSIGN_RECALL';

interface DistributeModeSelectorProps {
  activeMode: DistributionTabMode;
  onSelectMode: (mode: DistributionTabMode) => void;
  unassignedCount: number;
}

interface TabOption {
  id: DistributionTabMode;
  label: string;
  description: string;
  icon: React.ElementType;
  tag?: string;
}

export const DistributeModeSelector: React.FC<DistributeModeSelectorProps> = ({
  activeMode,
  onSelectMode,
  unassignedCount,
}) => {
  const tabs: TabOption[] = [
    {
      id: 'EQUAL_SPLIT',
      label: 'Equal Split',
      description: 'Evenly balance leads across active agents',
      icon: Scale,
      tag: 'Auto Balanced',
    },
    {
      id: 'FIXED_QUOTA',
      label: 'Fixed Quota',
      description: 'Assign specific lead counts per executive',
      icon: Sliders,
      tag: 'Custom Limit',
    },
    {
      id: 'MANUAL_PICK',
      label: 'Manual Assignment',
      description: 'Select individual leads to assign',
      icon: CheckSquare,
      tag: 'Direct Pick',
    },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeMode === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectMode(tab.id)}
              className={`relative flex flex-col p-4 rounded-2xl text-left border transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-800/50'
              }`}
            >
              {/* Header Icon + Badge */}
              <div className="flex items-center justify-between w-full mb-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {tab.tag && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {tab.tag}
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <h3 className="text-sm font-bold tracking-tight mb-1">{tab.label}</h3>
              <p
                className={`text-xs line-clamp-2 leading-relaxed ${
                  isActive ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {tab.description}
              </p>

              {/* Active Indicator Bar */}
              {isActive && (
                <div className="absolute -bottom-[1px] left-6 right-6 h-1 bg-white rounded-full shadow-xs" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
