'use client';

import React from 'react';
import { Calendar, GitFork, Upload, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { TLDashboardSupervisor } from '@/types/api.types';

interface SupervisorBannerProps {
  supervisor?: TLDashboardSupervisor;
  onDistributeClick?: () => void;
  onImportClick?: () => void;
  onReportClick?: () => void;
}

export default function SupervisorBanner({
  supervisor,
  onDistributeClick,
  onImportClick,
  onReportClick,
}: SupervisorBannerProps) {
  const router = useRouter();

  const name = supervisor?.name || 'Team Supervisor';
  const roleLabel = supervisor?.role === 'TEAM_LEADER' ? 'TL/OPS' : (supervisor?.role || 'TL/OPS');
  const shiftStatus = supervisor?.shiftStatus || 'Shift Active • Alpha Squad';
  const currentDate = supervisor?.currentDate || new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const unassignedCount = supervisor?.quickCounts?.unassignedCount ?? 0;

  return (
    <section className="pt-4 pb-2">
      <div className="bg-crm-card rounded-2xl p-4 border border-crm-subtle shadow-xs flex flex-col gap-3">
        {/* Supervisor Profile Summary */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-12 h-12 rounded-full bg-crm-muted shrink-0 flex items-center justify-center overflow-hidden border border-crm-subtle">
              <img
                src={supervisor?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'}
                alt={name}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-base font-bold text-crm-primary truncate">{name}</span>
                <span className="px-2 py-0.5 rounded-full bg-crm-warning text-crm-warning text-[10px] font-bold tracking-wide">
                  {roleLabel}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-crm-muted">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                <span className="font-medium text-crm-secondary">{shiftStatus}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-crm-subtle border border-crm-subtle px-3 py-1 rounded-full text-crm-muted text-[11px] font-semibold shrink-0">
            <Calendar className="w-3.5 h-3.5 text-crm-secondary" />
            <span>{currentDate}</span>
          </div>
        </div>

        {/* Quick Operational Action Ribbon */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-crm-subtle">
          <button
            type="button"
            onClick={
              onDistributeClick ||
              (() => router.push('/team_leader/distribute'))
            }
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-crm-dark hover:bg-crm-dark-hover text-crm-inverse active:scale-95 transition-all text-center shadow-xs cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <GitFork className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold">Distribute</span>
            </div>
            <span className="text-[10px] text-amber-300 font-bold mt-0.5">
              {unassignedCount} Unallocated
            </span>
          </button>

          <button
            type="button"
            onClick={
              onImportClick ||
              (() => router.push('/team_leader/intake'))
            }
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-crm-brand-subtle hover:bg-indigo-100 text-crm-brand active:scale-95 transition-all text-center border border-crm-brand-subtle cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-crm-brand" />
              <span className="text-xs font-semibold">Import</span>
            </div>
            <span className="text-[10px] text-crm-muted mt-0.5">Excel / CSV</span>
          </button>

          <button
            type="button"
            onClick={
              onReportClick ||
              (() => router.push('/team_leader/reports'))
            }
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-crm-subtle hover:bg-crm-muted text-crm-secondary active:scale-95 transition-all text-center border border-crm-subtle cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-crm-muted" />
              <span className="text-xs font-semibold">Report</span>
            </div>
            <span className="text-[10px] text-crm-muted mt-0.5">Export Ops</span>
          </button>
        </div>
      </div>
    </section>
  );
}
