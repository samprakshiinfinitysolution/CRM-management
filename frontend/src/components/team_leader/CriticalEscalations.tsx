'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface EscalatedDeal {
  id: string;
  companyName: string;
  stageInfo: string;
  arrAmount: string;
  overdueHours: number;
  ownerName: string;
}

export default function CriticalEscalations() {
  const deals: EscalatedDeal[] = [
    {
      id: 'deal-1',
      companyName: 'TechCorp India Solutions',
      stageInfo: 'Proposal stage',
      arrAmount: '₹450,000 ARR',
      overdueHours: 52,
      ownerName: 'Rahul Verma',
    },
    {
      id: 'deal-2',
      companyName: 'Apex Logistics & Freight',
      stageInfo: 'Demo completed',
      arrAmount: '₹280,000 ARR',
      overdueHours: 49,
      ownerName: 'Priya Patel',
    },
  ];

  const handleNudge = (deal: EscalatedDeal) => {
    toast.info(`Sent escalation notice to ${deal.ownerName} regarding ${deal.companyName}`);
  };

  const handleReassign = (deal: EscalatedDeal) => {
    toast.warning(`Opened reassignment flow for deal: ${deal.companyName}`);
  };

  return (
    <section className="py-2">
      <div className="bg-crm-card rounded-2xl p-4 border border-crm-subtle shadow-xs">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-crm-danger text-crm-danger flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-crm-primary">Critical Overdue Escalations</h3>
          </div>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-crm-danger text-crm-danger tracking-wide">
            {deals.length} CRITICAL
          </span>
        </div>

        {/* Deals list */}
        <div className="flex flex-col gap-2.5">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="p-3 rounded-xl bg-crm-subtle border border-crm-subtle flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-crm-primary">{deal.companyName}</div>
                  <div className="text-[11px] text-crm-muted">
                    {deal.stageInfo} • <span className="font-semibold text-crm-secondary">{deal.arrAmount}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-crm-danger text-crm-danger text-[10px] font-bold">
                  {deal.overdueHours}H OVERDUE
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-crm-subtle">
                <span className="text-crm-muted">
                  Owner: <span className="font-semibold text-crm-primary">{deal.ownerName}</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleNudge(deal)}
                    className="px-2.5 py-1 rounded-lg bg-crm-muted hover:bg-slate-200 text-crm-secondary font-semibold text-xs active:scale-95 transition-all"
                  >
                    Nudge
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReassign(deal)}
                    className="px-2.5 py-1 rounded-lg bg-crm-dark hover:bg-crm-dark-hover text-crm-inverse font-semibold text-xs active:scale-95 transition-all"
                  >
                    Reassign
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
