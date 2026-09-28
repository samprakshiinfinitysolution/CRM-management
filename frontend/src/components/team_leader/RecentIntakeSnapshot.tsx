'use client';

import React from 'react';
import { CheckCircle2, ChevronRight, ShieldCheck, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';

export default function RecentIntakeSnapshot() {
  return (
    <section className="pt-2 pb-6">
      <div className="bg-crm-card rounded-2xl p-4 border border-crm-subtle shadow-xs">
        <div className="flex items-center justify-between text-crm-muted mb-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-crm-muted">
            <FileSpreadsheet className="w-3.5 h-3.5 text-crm-brand" />
            <span>RECENT INTAKE LOG</span>
          </div>
          <span className="text-xs text-crm-success font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Processed</span>
          </span>
        </div>

        <div className="text-sm font-bold text-crm-primary">
          Batch #LFC-2026-884
        </div>

        <p className="text-xs text-crm-secondary mt-1 leading-relaxed">
          250 records committed • 14 duplicates automatically deduplicated • Initiated by Sarah J. 2h ago.
        </p>

        <div className="mt-3 pt-3 border-t border-crm-subtle flex items-center justify-between">
          <button
            type="button"
            onClick={() => toast.info('Navigating to full Excel staged intake audit report...')}
            className="text-xs font-semibold text-crm-brand hover:underline flex items-center gap-0.5"
          >
            <span>View full intake audit</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1 text-[10px] font-bold text-crm-muted uppercase tracking-wider">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>SHA-256 VERIFIED</span>
          </div>
        </div>
      </div>
    </section>
  );
}
