'use client';

import React from 'react';
import { ArrowRightLeft, BellRing, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface SalesRep {
  id: string;
  name: string;
  avatar: string;
  roleBadge?: string;
  statusText: string;
  isStatusPositive?: boolean;
  isOnline: boolean;
  wonAmount: string;
  wonCount?: number;
  activeCount: number;
  dueTodayCount: number;
  overdueCount: number;
  slaPercent: number;
  capacityWarning?: boolean;
  actionType: 'assign' | 'nudge' | 'reassign';
}

export default function ExecutiveWorkloadAudit() {
  const reps: SalesRep[] = [
    {
      id: 'rep-1',
      name: 'Alex Morgan',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      statusText: 'Available for allocation',
      isStatusPositive: true,
      isOnline: true,
      wonAmount: '₹680k',
      activeCount: 38,
      dueTodayCount: 4,
      overdueCount: 0,
      slaPercent: 76,
      actionType: 'assign',
    },
    {
      id: 'rep-2',
      name: 'Priya Patel',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
      roleBadge: 'TOP REP',
      statusText: 'Mid-Market Lead Specialist',
      isOnline: true,
      wonAmount: '₹820k',
      wonCount: 14,
      activeCount: 45,
      dueTodayCount: 7,
      overdueCount: 3,
      slaPercent: 94,
      actionType: 'nudge',
    },
    {
      id: 'rep-3',
      name: 'Rahul Verma',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      roleBadge: '92% LOAD',
      statusText: 'Capacity Bottleneck',
      isOnline: false,
      wonAmount: '₹520k',
      activeCount: 51,
      dueTodayCount: 9,
      overdueCount: 4,
      slaPercent: 92,
      capacityWarning: true,
      actionType: 'reassign',
    },
  ];

  const router = useRouter()

  const handleAction = (rep: SalesRep) => {
    if (rep.actionType === 'assign') {
      toast.success(`Allocated 5 new leads to ${rep.name}`);
    } else if (rep.actionType === 'nudge') {
      toast.info(`Sent urgent WhatsApp/Slack SLA nudge to ${rep.name} for ${rep.overdueCount} overdue leads`);
    } else {
      toast.warning(`Opened lead rebalance & recall modal for ${rep.name}`);
    }
  };

  return (
    <section className="py-2">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-bold text-crm-primary">
            Executive Workload & SLA
          </h2>
          <p className="text-xs text-crm-muted">
            Live quota, capacity and task bottlenecks
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/team_leader/sales_executives")}
          className="text-xs font-semibold text-crm-brand hover:underline cursor-pointer"
        >
          View 6 Reps
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {reps.map((rep) => (
          <div
            key={rep.id}
            className="bg-crm-card p-4 rounded-2xl border border-crm-subtle shadow-xs flex flex-col hover:border-slate-300 transition-colors"
          >
            {/* Header info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-crm-muted overflow-hidden flex-shrink-0 border border-crm-subtle">
                  <img
                    src={rep.avatar}
                    alt={rep.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-bold text-crm-primary truncate">
                      {rep.name}
                    </span>
                    {rep.isOnline && (
                      <span
                        className="w-2 h-2 rounded-full bg-emerald-500"
                        title="Online"
                      />
                    )}
                    {rep.roleBadge && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${
                          rep.capacityWarning
                            ? "bg-crm-danger text-crm-danger"
                            : "bg-crm-warning text-crm-warning"
                        }`}
                      >
                        {rep.roleBadge}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium block truncate ${
                      rep.capacityWarning
                        ? "text-crm-danger"
                        : rep.isStatusPositive
                          ? "text-crm-success"
                          : "text-crm-muted"
                    }`}
                  >
                    {rep.statusText}
                  </span>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="text-sm font-bold text-crm-primary">
                  {rep.wonAmount}
                </div>
                <span className="text-[10px] font-bold text-crm-muted uppercase tracking-wider">
                  WON {rep.wonCount ? `(${rep.wonCount})` : ""}
                </span>
              </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-3 gap-2 my-3 py-2 px-3 bg-crm-subtle rounded-xl text-center text-xs border border-crm-subtle">
              <div>
                <div
                  className={`font-bold ${
                    rep.capacityWarning ? "text-crm-danger" : "text-crm-primary"
                  }`}
                >
                  {rep.activeCount}
                </div>
                <div className="text-[10px] font-semibold text-crm-muted uppercase tracking-wider">
                  {rep.capacityWarning ? "LOAD MAX" : "ACTIVE"}
                </div>
              </div>
              <div>
                <div className="font-bold text-crm-primary">
                  {rep.dueTodayCount}
                </div>
                <div className="text-[10px] font-semibold text-crm-muted uppercase tracking-wider">
                  DUE TODAY
                </div>
              </div>
              <div>
                <div
                  className={`font-bold ${
                    rep.overdueCount > 0
                      ? "text-crm-danger"
                      : "text-crm-success"
                  }`}
                >
                  {rep.overdueCount > 0 ? `${rep.overdueCount} ⚠️` : "0"}
                </div>
                <div className="text-[10px] font-semibold text-crm-muted uppercase tracking-wider">
                  OVERDUE
                </div>
              </div>
            </div>

            {/* SLA Progress Bar & Action Button */}
            <div className="flex items-center justify-between text-xs text-crm-muted pt-1">
              <div className="flex items-center gap-2 flex-1 mr-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-crm-secondary">
                  SLA: {rep.slaPercent}%
                </span>
                <div className="flex-1 h-1.5 rounded-full bg-crm-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      rep.capacityWarning
                        ? "bg-rose-500"
                        : rep.slaPercent >= 90
                          ? "bg-emerald-500"
                          : "bg-indigo-600"
                    }`}
                    style={{ width: `${rep.slaPercent}%` }}
                  />
                </div>
              </div>

              {rep.actionType === "assign" && (
                <button
                  type="button"
                  onClick={() => handleAction(rep)}
                  className="px-3 py-1.5 rounded-xl bg-crm-brand-subtle text-crm-brand font-semibold text-xs hover:bg-indigo-100 active:scale-95 transition-all flex items-center gap-1 border border-crm-brand-subtle"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Assign</span>
                </button>
              )}

              {rep.actionType === "nudge" && (
                <button
                  type="button"
                  onClick={() => handleAction(rep)}
                  className="px-3 py-1.5 rounded-xl bg-crm-muted text-crm-secondary font-semibold text-xs hover:bg-slate-200 active:scale-95 transition-all flex items-center gap-1 border border-crm-subtle"
                >
                  <BellRing className="w-3.5 h-3.5 text-amber-600" />
                  <span>Nudge ({rep.overdueCount})</span>
                </button>
              )}

              {rep.actionType === "reassign" && (
                <button
                  type="button"
                  onClick={() => handleAction(rep)}
                  className="px-3 py-1.5 rounded-xl bg-crm-danger text-crm-danger font-semibold text-xs hover:bg-rose-100 active:scale-95 transition-all flex items-center gap-1 border border-crm-danger"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Reassign</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
