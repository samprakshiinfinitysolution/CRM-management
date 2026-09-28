'use client';

import React from 'react';
import { Users, UserCheck, Briefcase, TrendingUp, AlertTriangle } from 'lucide-react';
import type { SalesExecutiveSummary } from '@/types/api.types';

interface ExecutiveStatsCardsProps {
  executives: SalesExecutiveSummary[];
  isLoading?: boolean;
}

export default function ExecutiveStatsCards({
  executives,
  isLoading = false,
}: ExecutiveStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-2xl border border-crm-subtle shadow-xs animate-pulse flex flex-col gap-2"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-100" />
            <div className="w-16 h-3 bg-slate-100 rounded" />
            <div className="w-20 h-6 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const totalExecutives = executives.length;
  const activeExecutives = executives.filter((e) => e.isActive).length;
  const totalActiveLeads = executives.reduce((sum, e) => sum + e.activeLeads, 0);
  const totalConverted = executives.reduce((sum, e) => sum + e.convertedLeads, 0);
  const totalAssigned = executives.reduce((sum, e) => sum + e.totalAssignedLeads, 0);
  const avgConversionRate =
    totalAssigned > 0
      ? Math.round((totalConverted / totalAssigned) * 1000) / 10
      : 0;
  const totalOverdue = executives.reduce((sum, e) => sum + e.followUpsOverdue, 0);

  const stats = [
    {
      label: 'Total Executives',
      value: totalExecutives,
      subtext: `${activeExecutives} Active in field`,
      icon: <Users className="w-4 h-4 text-indigo-600" />,
      iconBg: 'bg-indigo-50 border-indigo-100',
    },
    {
      label: 'Active Staff',
      value: activeExecutives,
      subtext: `${totalExecutives - activeExecutives} Inactive/Paused`,
      icon: <UserCheck className="w-4 h-4 text-emerald-600" />,
      iconBg: 'bg-emerald-50 border-emerald-100',
    },
    {
      label: 'Active Workload',
      value: totalActiveLeads,
      subtext: 'Leads currently in pipeline',
      icon: <Briefcase className="w-4 h-4 text-sky-600" />,
      iconBg: 'bg-sky-50 border-sky-100',
    },
    {
      label: 'Team Win Rate',
      value: `${avgConversionRate}%`,
      subtext: `${totalConverted} Deals Won/Sold`,
      icon: <TrendingUp className="w-4 h-4 text-purple-600" />,
      iconBg: 'bg-purple-50 border-purple-100',
    },
    {
      label: 'Overdue Follow-ups',
      value: totalOverdue,
      subtext: totalOverdue > 0 ? 'Requires supervisor nudge' : 'All SLAs compliant',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
      iconBg: totalOverdue > 0 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-white p-3.5 sm:p-4 rounded-2xl border border-crm-subtle shadow-xs flex flex-col justify-between transition-all hover:border-slate-300"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-crm-muted uppercase tracking-wider">
              {stat.label}
            </span>
            <div
              className={`w-7 h-7 rounded-lg border flex items-center justify-center ${stat.iconBg}`}
            >
              {stat.icon}
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-crm-primary tracking-tight">
              {stat.value}
            </div>
            <div className="text-[10px] sm:text-xs text-crm-muted mt-0.5 truncate">
              {stat.subtext}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
