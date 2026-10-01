'use client';

import React, { useState } from 'react';
import { Award, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Pagination } from '@/components/ui/Pagination';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalItems = executives.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedExecutives = executives.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  return (
    <Card className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Sales Executive Scorecard Matrix
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Individual workload load, conversion velocity, and SLA adherence
            </p>
          </div>
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400">
            <Award className="w-4 h-4" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="border-b border-slate-200/80 dark:border-slate-800">
              <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="pb-3 pl-2">Executive</th>
                <th className="pb-3 text-center">Active Load</th>
                <th className="pb-3 text-center">Won Deals</th>
                <th className="pb-3 text-center">Conversion %</th>
                <th className="pb-3 text-center">Avg Response</th>
                <th className="pb-3 text-center pr-2">SLA Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="py-4">
                      <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-lg w-full" />
                    </td>
                  </tr>
                ))
              ) : executives.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-xs text-slate-500 dark:text-slate-400"
                  >
                    No executive records match the filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedExecutives.map((exec) => (
                  <tr
                    key={exec.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 pl-2">
                      <div className="font-semibold text-slate-900 dark:text-white text-xs">
                        {exec.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{exec.email}</div>
                    </td>
                    <td className="py-3.5 text-center">
                      <span className="font-semibold text-slate-900 dark:text-white text-xs">
                        {exec.activeLeads}
                      </span>
                    </td>
                    <td className="py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {exec.wonLeads}
                      </span>
                    </td>
                    <td className="py-3.5 text-center">
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/60">
                        {exec.conversionRate}%
                      </span>
                    </td>
                    <td className="py-3.5 text-center text-xs text-slate-600 dark:text-slate-300">
                      {exec.avgResponseHours} hrs
                    </td>
                    <td className="py-3.5 text-center pr-2">
                      {exec.slaBreaches > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 px-2 py-0.5 rounded-full font-medium">
                          <AlertCircle className="w-3 h-3" /> {exec.slaBreaches}{" "}
                          Breaches
                        </span>
                      ) : (
                        <span className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full font-medium">
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
      </div>

      {!isLoading && totalItems > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Pagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            className="bg-transparent dark:bg-transparent border-0 px-0 py-0 text-slate-600 dark:text-slate-300"
          />
        </div>
      )}
    </Card>
  );
};
