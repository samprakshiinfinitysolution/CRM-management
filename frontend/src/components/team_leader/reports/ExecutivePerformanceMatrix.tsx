'use client';

import React from 'react';
import { Award, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

export interface ExecutiveScorecard {
  id: string;
  name: string;
  email: string;
  activeLeads: number;
  wonLeads: number;
  lostLeads: number;
  conversionRate: number;
  avgResponseHours: number;
  slaBreaches: number;
}

interface ExecutivePerformanceMatrixProps {
  executives?: ExecutiveScorecard[];
  isLoading?: boolean;
}

export const ExecutivePerformanceMatrix: React.FC<ExecutivePerformanceMatrixProps> = ({
  executives = [],
  isLoading = false,
}) => {
  return (
    <Card className="p-6 rounded-2xl bg-white/[0.03] h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-accent-foreground">
            Sales Executive Scorecard Matrix
          </h3>
          <p className="text-xs text-accent-foreground/60 ">
            Individual workload load, conversion velocity, and SLA adherence
          </p>
        </div>
        <div className="p-2 rounded-xl bg-accent-foreground/10 text-accent-foreground">
          <Award className="w-4 h-4" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="border-b border-crm-brand-subtle">
            <tr className="text-[11px] font-semibold uppercase tracking-wider text-accent-foreground/70">
              <th className="pb-3 pl-2">Executive</th>
              <th className="pb-3 text-center">Active Load</th>
              <th className="pb-3 text-center">Won Deals</th>
              <th className="pb-3 text-center">Conversion %</th>
              <th className="pb-3 text-center">Avg Response</th>
              <th className="pb-3 text-center pr-2">SLA Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={6} className="py-4">
                    <div className="h-6 bg-white/5 rounded-lg w-full" />
                  </td>
                </tr>
              ))
            ) : executives.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-8 text-center text-xs text-slate-500"
                >
                  No executive records match the filter criteria.
                </td>
              </tr>
            ) : (
              executives.map((exec) => (
                <tr
                  key={exec.id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3.5 pl-2">
                    <div className="font-medium text-slate-200">
                      {exec.name}
                    </div>
                    <div className="text-xs text-slate-500">{exec.email}</div>
                  </td>
                  <td className="py-3.5 text-center">
                    <span className="font-semibold text-white">
                      {exec.activeLeads}
                    </span>
                  </td>
                  <td className="py-3.5 text-center">
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {exec.wonLeads}
                    </span>
                  </td>
                  <td className="py-3.5 text-center">
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {exec.conversionRate}%
                    </span>
                  </td>
                  <td className="py-3.5 text-center text-xs text-slate-300">
                    {exec.avgResponseHours} hrs
                  </td>
                  <td className="py-3.5 text-center pr-2">
                    {exec.slaBreaches > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full font-medium">
                        <AlertCircle className="w-3 h-3" /> {exec.slaBreaches}{" "}
                        Breaches
                      </span>
                    ) : (
                      <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                        Compliant
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
