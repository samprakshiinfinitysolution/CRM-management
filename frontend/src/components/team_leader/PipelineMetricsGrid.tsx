"use client";

import React from "react";
import {
  Layers,
  Forward,
  Award,
  Flag,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import type { TLDashboardPipelineHealth } from "@/types/api.types";

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

interface PipelineMetricsGridProps {
  data?: TLDashboardPipelineHealth;
  isLoading?: boolean;
}

export default function PipelineMetricsGrid({
  data,
  isLoading,
}: PipelineMetricsGridProps) {
  if (isLoading) {
    return (
      <section className="pt-2 pb-2">
        <div className="flex items-center justify-between mb-2.5">
          <div className="h-4 w-32 bg-crm-muted animate-pulse rounded"></div>
          <div className="h-3 w-16 bg-crm-muted animate-pulse rounded"></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-crm-card p-4 rounded-2xl border border-crm-subtle h-28 animate-pulse flex flex-col justify-between"
            >
              <div className="h-3 w-20 bg-crm-muted rounded"></div>
              <div className="h-7 w-24 bg-crm-muted rounded"></div>
              <div className="h-3 w-28 bg-crm-muted rounded"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const metrics: MetricItem[] = [
    {
      label: "TOTAL POOL",
      value:
        data?.totalPool?.formattedValue || `${data?.totalPool?.value ?? 0}`,
      change: data?.totalPool?.change,
      subtext: data?.totalPool?.subtext || "all leads in system",
      isPositive: data?.totalPool?.isPositive ?? true,
      icon: <Layers className="w-4 h-4 text-crm-muted" />,
    },
    {
      label: "ACTIVE IN-FLIGHT",
      value:
        data?.activeInFlight?.formattedValue ||
        `${data?.activeInFlight?.value ?? 0}`,
      subtext:
        data?.activeInFlight?.subtext ||
        `${data?.activeInFlight?.callsToday ?? 0} calls today`,
      icon: <Forward className="w-4 h-4 text-crm-brand" />,
    },
    {
      label: "WON / ARR",
      value: data?.wonARR?.formattedValue || "₹0",
      subtext:
        data?.wonARR?.subtext ||
        `${data?.wonARR?.wonCount ?? 0} Closed • ${data?.wonARR?.conversionRate ?? 0}% rate`,
      highlightValueColor: "text-crm-success",
      icon: <Award className="w-4 h-4 text-emerald-600" />,
    },
    {
      label: "SLA ADHERENCE",
      value:
        data?.slaAdherence?.formattedValue ||
        `${data?.slaAdherence?.value ?? 100}%`,
      alertBadge: data?.slaAdherence?.alertBadge,
      subtext:
        data?.slaAdherence?.overdueCount === 0
          ? "All follow-ups on time"
          : undefined,
      icon: <Flag className="w-4 h-4 text-amber-600" />,
    },
  ];

  return (
    <section className="pt-2 pb-2">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-sm font-bold text-crm-primary">
          Pipeline Health Matrix
        </h2>
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
                  item.highlightValueColor || "text-crm-primary"
                }`}
              >
                {item.value}
              </div>

              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-crm-muted flex-wrap">
                {item.change && (
                  <span
                    className={`font-semibold flex items-center gap-0.5 ${
                      item.isPositive ? "text-crm-success" : "text-crm-danger"
                    }`}
                  >
                    {item.isPositive ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
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
