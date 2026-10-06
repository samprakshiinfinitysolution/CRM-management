"use client";

import React from "react";
import { TrendingUp, Target, Clock, AlertTriangle } from "lucide-react";

interface ReportKPIsProps {
  kpis?: {
    totalIntake: number;
    intakeChangePercent: number;
    conversionRate: number;
    avgCycleTimeHours: number;
    slaComplianceRate: number;
    wonDealsCount: number;
  };
  isLoading?: boolean;
}

export const ReportKPIs: React.FC<ReportKPIsProps> = ({
  kpis,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const items = [
    {
      title: "Lead Intake Velocity",
      value: kpis?.totalIntake || 0,
      badge: `+${kpis?.intakeChangePercent || 0}% vs prev`,
      badgeColor:
        "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/60",
      icon: TrendingUp,
      iconColor:
        "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-100 dark:border-indigo-800/60",
    },
    {
      title: "Funnel Conversion Rate",
      value: `${kpis?.conversionRate || 0}%`,
      sub: `${kpis?.wonDealsCount || 0} Deals Closed Won`,
      icon: Target,
      iconColor:
        "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-100 dark:border-emerald-800/60",
    },
    {
      title: "Avg. First Response Time",
      value: `${kpis?.avgCycleTimeHours || 0} hrs`,
      sub: "Lead assignment to outreach",
      icon: Clock,
      iconColor:
        "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 border-purple-100 dark:border-purple-800/60",
    },
    {
      title: "SLA Adherence Rate",
      value: `${kpis?.slaComplianceRate || 0}%`,
      sub: "Contacted within 4-hour SLA",
      icon: AlertTriangle,
      iconColor:
        "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-100 dark:border-amber-800/60",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {card.title}
              </span>
              <div className={`p-2 rounded-lg border ${card.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {card.value}
              </span>
              {card.badge && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${card.badgeColor}`}
                >
                  {card.badge}
                </span>
              )}
            </div>
            {card.sub && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {card.sub}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};
