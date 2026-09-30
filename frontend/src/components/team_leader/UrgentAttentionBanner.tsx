'use client';

import React from 'react';
import { AlertCircle, Split, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { TLDashboardUrgentAttention } from '@/types/api.types';

interface UrgentAttentionBannerProps {
  data?: TLDashboardUrgentAttention;
  unassignedCount?: number;
  batchName?: string;
  onEqualSplit?: () => void;
  onMatrixRule?: () => void;
}

export default function UrgentAttentionBanner({
  data,
  unassignedCount: propUnassignedCount,
  batchName: propBatchName,
  onEqualSplit,
  onMatrixRule,
}: UrgentAttentionBannerProps) {
  const router = useRouter();

  const count = data?.unassignedCount ?? propUnassignedCount ?? 0;
  const fileName = data?.latestBatch?.fileName || propBatchName || 'Latest Excel Intake';
  const execCount = data?.activeExecutivesCount ?? 5;
  const parsedCount = data?.latestBatch?.importedCount;

  const handleEqualSplit = () => {
    if (onEqualSplit) {
      onEqualSplit();
    } else {
      router.push('/team_leader/distribute');
    }
  };

  const handleMatrixRule = () => {
    if (onMatrixRule) {
      onMatrixRule();
    } else {
      router.push('/team_leader/distribute');
    }
  };

  if (count === 0) {
    return (
      <section className="py-2">
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-900">
                All Leads Assigned
              </h3>
              <p className="text-xs text-emerald-700">
                The unassigned intake pool is completely clear. No urgent action required.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.push('/team_leader/intake')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer transition-all"
          >
            Import More Leads
          </button>
        </div>
      </section>
    );
  }

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
                {count} Leads Need Assignment
              </h3>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-crm-card text-red-500 tracking-wide">
                URGENT
              </span>
            </div>

            <p className="text-xs text-brand-primary/80 mt-1 leading-relaxed">
              {parsedCount ? `${parsedCount} records available` : 'Leads available'} from{' '}
              <span
                onClick={() => router.push('/team_leader/intake')}
                className="font-semibold underline decoration-brand-primary/40 cursor-pointer"
              >
                {fileName}
              </span>
              .
            </p>

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <button
                type="button"
                onClick={handleEqualSplit}
                className="px-3.5 py-1 rounded-xl text-xs font-semibold shadow-xs button-effect border border-brand-primary bg-brand-hover text-card! flex items-center gap-1.5 cursor-pointer"
              >
                <Split className="w-3.5 h-3.5 text-amber-300" />
                <span>Equal Split ({execCount} Reps)</span>
              </button>

              <button
                type="button"
                onClick={handleMatrixRule}
                className="px-3 py-1.5 border border-brand-primary rounded-xl text-xs font-semibold button-effect flex items-center gap-1.5 cursor-pointer"
              >
                <span>Distribution Engine</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
