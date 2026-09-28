'use client';

import React, { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';

interface StageItem {
  key: string;
  label: string;
  count: number;
  pct: number;
  colorClass: string;
  dotBg: string;
}

export default function PipelineFunnelBreakdown() {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  const stages: StageItem[] = [
    { key: 'unassigned', label: 'Unassigned', count: 184, pct: 13, colorClass: 'bg-amber-500', dotBg: 'bg-amber-500' },
    { key: 'contacted', label: 'Contacted', count: 342, pct: 24, colorClass: 'bg-blue-500', dotBg: 'bg-blue-500' },
    { key: 'followup', label: 'In Follow-up', count: 418, pct: 29, colorClass: 'bg-indigo-600', dotBg: 'bg-indigo-600' },
    { key: 'proposal', label: 'Proposal', count: 282, pct: 20, colorClass: 'bg-purple-500', dotBg: 'bg-purple-500' },
    { key: 'won', label: 'Won / Sold', count: 102, pct: 7, colorClass: 'bg-emerald-500', dotBg: 'bg-emerald-500' },
    { key: 'lost', label: 'Disqualified', count: 100, pct: 7, colorClass: 'bg-rose-400', dotBg: 'bg-rose-400' },
  ];

  const handleStageClick = (stage: StageItem) => {
    setSelectedStage(stage.key === selectedStage ? null : stage.key);
    toast.info(`Filtering stage: ${stage.label} (${stage.count} leads)`);
  };

  return (
    <section className="py-2">
      <div className="bg-crm-card rounded-2xl p-4 border border-crm-subtle shadow-xs">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-crm-primary">Funnel Breakdown</h3>
            <span className="text-xs text-crm-muted">1,428 active leads mapped</span>
          </div>
          <button
            type="button"
            onClick={() => toast.info('Advanced stage filter criteria modal opened.')}
            className="text-xs font-semibold text-crm-brand hover:underline flex items-center gap-1"
          >
            <span>Filter Stage</span>
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Multi-segment pipeline status bar */}
        <div className="w-full h-3 rounded-full bg-crm-muted flex overflow-hidden my-3">
          {stages.map((stage) => (
            <div
              key={stage.key}
              className={`${stage.colorClass} h-full transition-opacity cursor-pointer ${
                selectedStage && selectedStage !== stage.key ? 'opacity-30' : 'opacity-100'
              }`}
              style={{ width: `${stage.pct}%` }}
              title={`${stage.label}: ${stage.count} (${stage.pct}%)`}
              onClick={() => handleStageClick(stage)}
            />
          ))}
        </div>

        {/* Legend Pill Grid */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-left">
          {stages.map((stage) => (
            <button
              key={stage.key}
              type="button"
              onClick={() => handleStageClick(stage)}
              className={`p-2 rounded-xl text-left transition-all border ${
                selectedStage === stage.key
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                  : 'border-crm-subtle bg-crm-subtle hover:bg-crm-muted'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-crm-secondary uppercase tracking-wider">
                <span className={`w-2 h-2 rounded-full ${stage.dotBg}`}></span>
                <span className="truncate">{stage.label}</span>
              </div>
              <div className="text-sm font-bold text-crm-primary mt-1">
                {stage.count}{' '}
                <span className="font-normal text-crm-muted text-xs">({stage.pct}%)</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
