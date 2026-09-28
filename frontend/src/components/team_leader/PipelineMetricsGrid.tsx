'use client';

import React from 'react';
import { Layers, Forward, Award, Flag, TrendingUp } from 'lucide-react';

interface MetricItem {
  label: string;
  value: string;
  change?: string;
  subtext?: string;
  icon: React.ReactNode;
  isPositive?: boolean;
  highlightValueColor?: string;
  alertBadge?: string;
}

export default function PipelineMetricsGrid() {
  const metrics: MetricItem[] = [
    {
      label: 'TOTAL POOL',
      value: '1,428',
      change: '+14%',
      subtext: 'vs last wk',
      isPositive: true,
      icon: <Layers className="w-4 h-4 text-crm-muted" />,
    },
    {
      label: 'ACTIVE IN-FLIGHT',
      value: '1,142',
      subtext: '94 calls today',
      icon: <Forward className="w-4 h-4 text-crm-brand" />,
    },
    {
      label: 'WON / ARR',
      value: '₹2.4M',
      subtext: '102 Closed • 18.4% rate',
      highlightValueColor: 'text-crm-success',
      icon: <Award className="w-4 h-4 text-emerald-600" />,
    },
    {
      label: 'SLA ADHERENCE',
      value: '91.2%',
      alertBadge: '18 OVERDUE',
      icon: <Flag className="w-4 h-4 text-amber-600" />,
    },
  ];

  return (
    <section className="pt-2 pb-2">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-sm font-bold text-crm-primary">Pipeline Health Matrix</h2>
        <span className="text-xs text-crm-muted flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live sync
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metrics.map((item, idx) => (
          <div
            key={idx}
            className="bg-crm-card p-4 rounded-2xl border border-crm-subtle shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center justify-between text-crm-muted mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-crm-muted">
                {item.label}
              </span>
              {item.icon}
            </div>

            <div>
              <div
                className={`text-2xl font-bold tracking-tight ${
                  item.highlightValueColor || 'text-crm-primary'
                }`}
              >
                {item.value}
              </div>

              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-crm-muted">
                {item.change && (
                  <span className="text-crm-success font-semibold flex items-center gap-0.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {item.change}
                  </span>
                )}
                {item.subtext && <span>{item.subtext}</span>}
                {item.alertBadge && (
                  <span className="px-2 py-0.5 rounded-full bg-crm-danger text-crm-danger font-bold text-[10px]">
                    {item.alertBadge}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
