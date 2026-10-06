"use client";

import React from "react";
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";

interface IntakeStatsCardsProps {
  total: number;
  valid: number;
  duplicates: number;
  invalid: number;
}

export const IntakeStatsCards: React.FC<IntakeStatsCardsProps> = ({
  total,
  valid,
  duplicates,
  invalid,
}) => {
  const cards = [
    {
      title: "Total Staged Rows",
      value: total,
      sub: "Records in active sheet",
      icon: FileSpreadsheet,
      iconColor: "text-blue-400 bg-blue-500/10",
    },
    {
      title: "Valid Ready Leads",
      value: valid,
      sub: `${total > 0 ? Math.round((valid / total) * 100) : 0}% passing checks`,
      icon: CheckCircle2,
      iconColor: "text-emerald-400 bg-emerald-500/10",
    },
    {
      title: "Potential Duplicates",
      value: duplicates,
      sub: "Matching existing mobile/email",
      icon: AlertTriangle,
      iconColor: "text-amber-400 bg-amber-500/10",
    },
    {
      title: "Incomplete / Invalid",
      value: invalid,
      sub: "Missing required attributes",
      icon: AlertCircle,
      iconColor: "text-rose-400 bg-rose-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card
            key={idx}
            className="p-5 rounded-lg bg-white/3 border border-accent/20 hover:border-accent/20 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent-foreground">
                {card.title}
              </span>
              <div className={`p-2 rounded-lg ${card.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-crm-brand tracking-tight">
                {card.value}
              </span>
            </div>
            <p className="text-xs  mt-1">{card.sub}</p>
          </Card>
        );
      })}
    </div>
  );
};
