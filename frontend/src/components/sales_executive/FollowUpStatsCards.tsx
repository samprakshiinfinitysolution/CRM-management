"use client";

import React from "react";
import { Clock, AlertTriangle, CalendarCheck, CheckCircle2 } from "lucide-react";
import { useGetFollowUpSummaryQuery } from "@/store/api/followUpApi";

interface FollowUpStatsCardsProps {
  onScopeSelect?: (scope: "today" | "overdue" | "upcoming" | "completed") => void;
  activeScope?: string;
}

export default function FollowUpStatsCards({
  onScopeSelect,
  activeScope = "today",
}: FollowUpStatsCardsProps) {
  const { data, isLoading } = useGetFollowUpSummaryQuery();
  const summary = data?.data;

  const cards = [
    {
      key: "today" as const,
      label: "Due Today",
      count: summary?.dueToday ?? 0,
      icon: <Clock className="w-4 h-4 text-blue-600" />,
      iconBox: "bg-blue-50 border border-blue-100",
      badge: "High Priority",
      badgeStyle: "bg-blue-50 text-blue-700 border border-blue-200",
    },
    {
      key: "overdue" as const,
      label: "Overdue",
      count: summary?.overdue ?? 0,
      icon: <AlertTriangle className="w-4 h-4 text-rose-600" />,
      iconBox: "bg-rose-50 border border-rose-100",
      badge: (summary?.overdue ?? 0) > 0 ? "Action Required" : "Clean",
      badgeStyle:
        (summary?.overdue ?? 0) > 0
          ? "bg-rose-50 text-rose-700 border border-rose-200 font-bold"
          : "bg-crm-muted text-crm-secondary border border-crm-subtle",
    },
    {
      key: "upcoming" as const,
      label: "Upcoming",
      count: summary?.upcoming ?? 0,
      icon: <CalendarCheck className="w-4 h-4 text-indigo-600" />,
      iconBox: "bg-indigo-50 border border-indigo-100",
      badge: "Scheduled",
      badgeStyle: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    },
    {
      key: "completed" as const,
      label: "Completed (Month)",
      count: summary?.completedThisMonth ?? 0,
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
      iconBox: "bg-emerald-50 border border-emerald-100",
      badge: "Delivered",
      badgeStyle: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => {
        const isActive = activeScope === card.key;
        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onScopeSelect?.(card.key)}
            className={`text-left p-4 rounded-2xl bg-crm-card border transition-all duration-150 flex flex-col justify-between shadow-xs cursor-pointer ${
              isActive
                ? "border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/20"
                : "border-crm-subtle hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl ${card.iconBox} flex items-center justify-center shadow-2xs`}>
                {card.icon}
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${card.badgeStyle}`}>
                {card.badge}
              </span>
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight text-crm-primary mb-0.5">
                {isLoading ? <div className="h-7 w-12 bg-crm-muted rounded animate-pulse" /> : card.count}
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-crm-muted">
                {card.label}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
