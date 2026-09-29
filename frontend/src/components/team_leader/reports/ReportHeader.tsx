'use client';

import React from 'react';
import { BarChart3, Download, RefreshCw } from 'lucide-react';

interface ReportHeaderProps {
  onRefresh: () => void;
  onOpenExport: () => void;
  isFetching?: boolean;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({
  onRefresh,
  onOpenExport,
  isFetching = false,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 banner-effect">
      <div>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-accent-foreground tracking-tight">
              Reports & Performance Intelligence
            </h1>
            <p className="text-sm text-accent-foreground/70">
              Pipeline conversion funnel, lead acquisition velocity, and
              executive workload scorecards.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onRefresh}
          disabled={isFetching}
          className="inline-flex items-center gap-2 px-3.5 py-2 button-effect rounded-full! disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
          />
          <span>Refresh</span>
        </button>

        <button
          onClick={onOpenExport}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Export Excel Report</span>
        </button>
      </div>
    </div>
  );
};
