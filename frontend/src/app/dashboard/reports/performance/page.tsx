'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, RefreshCw } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/types/api.types';
import { useGetReportsSummaryQuery } from '@/store/api/leadApi';
import { ExecutivePerformanceMatrix } from '@/components/team_leader/reports';

export default function PerformanceReportPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const { data: reportsRes, isLoading } = useGetReportsSummaryQuery({ timeRange });
  const executives = reportsRes?.data?.executives;

  return (
    <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER]}>
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/reports"
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span>Executive Performance Matrix</span>
              </h1>
              <p className="text-xs text-slate-500">
                Staff throughput, win ratios, response velocity and SLA overdue metrics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="h-9 px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last Quarter</option>
            </select>
          </div>
        </div>

        <ExecutivePerformanceMatrix executives={executives} isLoading={isLoading} />
      </div>
    </ProtectedRoute>
  );
}
