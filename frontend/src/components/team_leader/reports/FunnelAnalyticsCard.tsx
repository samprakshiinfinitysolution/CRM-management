'use client';

import React from 'react';
import { Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';

export interface FunnelStage {
  stage: string;
  count: number;
  conversionPercentage: number;
}

interface FunnelAnalyticsCardProps {
  stages?: FunnelStage[];
  isLoading?: boolean;
}

export const FunnelAnalyticsCard: React.FC<FunnelAnalyticsCardProps> = ({
  stages = [],
  isLoading = false,
}) => {
  return (
    <Card className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Pipeline Conversion Funnel</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Progression and drop-off rate across stages</p>
        </div>
        <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400">
          <Filter className="w-4 h-4" />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4 py-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-9 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : stages.length === 0 ? (
        <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs">No funnel data available for selected filter</div>
      ) : (
        <div className="space-y-3.5">
          {stages.map((stage, idx) => (
            <div key={stage.stage} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">{stage.stage}</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {stage.count} leads <span className="text-slate-400 dark:text-slate-500">({stage.conversionPercentage}%)</span>
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700/60">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    idx === stages.length - 1
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : 'bg-gradient-to-r from-indigo-600 to-indigo-400'
                  }`}
                  style={{ width: `${Math.max(stage.conversionPercentage, 4)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
