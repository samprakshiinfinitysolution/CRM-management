"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, PieChart } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/types/api.types";
import { useGetReportsSummaryQuery } from "@/store/api/leadApi";
import { FunnelAnalyticsCard } from "@/components/team_leader/reports";

export default function LeadsReportPage() {
  const [timeRange, setTimeRange] = useState("30d");
  const { data: reportsRes, isLoading } = useGetReportsSummaryQuery({
    timeRange,
  });
  const stages = reportsRes?.data?.funnel;

  return (
    <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER]}>
      <div className="mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/reports"
              className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Lead Pipeline & Funnel Breakdown</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                End-to-end sales lifecycle stage throughput and conversion
                drop-offs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="h-9 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last Quarter</option>
            </select>
          </div>
        </div>

        <FunnelAnalyticsCard stages={stages} isLoading={isLoading} />
      </div>
    </ProtectedRoute>
  );
}
