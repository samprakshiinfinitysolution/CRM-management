'use client';

import React from 'react';
import { AlertCircle, Split, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface UrgentAttentionBannerProps {
  unassignedCount?: number;
  batchName?: string;
  onEqualSplit?: () => void;
  onMatrixRule?: () => void;
}

export default function UrgentAttentionBanner({
  unassignedCount = 184,
  batchName = 'Q3_Enterprise_Webinar_Leads.xlsx',
  onEqualSplit,
  onMatrixRule,
}: UrgentAttentionBannerProps) {
  const handleEqualSplit = () => {
    if (onEqualSplit) {
      onEqualSplit();
    } else {
      toast.success(`Distributing ${unassignedCount} leads equally across 6 active sales representatives.`);
    }
  };

  const handleMatrixRule = () => {
    if (onMatrixRule) {
      onMatrixRule();
    } else {
      toast.info('Applying weighted tier & territory matrix distribution rules...');
    }
  };

  return (
    <section className="py-2">
      <div className="banner-effect">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-canvas text-crm-warning flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5 text-crm-danger" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-brand-primary">
                {unassignedCount} Leads Need Assignment
              </h3>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-crm-card text-red-500 tracking-wide">
                URGENT
              </span>
            </div>

            <p className="text-xs text-brand-primary/80 mt-1 leading-relaxed">
              42 warm enterprise leads parsed 25m ago from{" "}
              <span className="font-semibold underline decoration-brand-primary/40 cursor-pointer">
                {batchName}
              </span>
              .
            </p>
    
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <button
                type="button"
                onClick={handleEqualSplit}
                className="px-3.5 py-1 rounded-xl text-xs font-semibold shadow-xs button-effect border border-brand-primary bg-brand-hover text-card! flex items-center gap-1.5"
              >
                <Split className="w-3.5 h-3.5 text-amber-300" />
                <span>Equal Split (6 Reps)</span>
              </button>

              <button
                type="button"
                onClick={handleMatrixRule}
                className="px-3 py-1.5 border border-brand-primary rounded-xl text-xs font-semibold button-effect flex items-center gap-1.5"
              >
                <span>Matrix Rule</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
