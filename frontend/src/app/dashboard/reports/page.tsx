"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TrendingUp, ArrowRight, PieChart } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/types/api.types";
import {
  ReportFilterBar,
  ReportKPIs,
  FunnelAnalyticsCard,
  ExecutivePerformanceMatrix,
} from "@/components/team_leader/reports";
import { ExportLeadsModal } from "@/components/leads";
import { downloadReportsExport } from "@/lib/exportUtils";
import { useGetSalesExecutivesQuery } from "@/store/api/userApi";
import { useGetReportsSummaryQuery } from "@/store/api/leadApi";

export default function ReportsHubPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedExecutive, setSelectedExecutive] = useState("ALL");
  const [selectedSource, setSelectedSource] = useState("ALL");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadReportsExport({
        timeRange,
        source: selectedSource !== "ALL" ? selectedSource : undefined,
        executiveId:
          selectedExecutive !== "ALL" ? selectedExecutive : undefined,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const { data: executivesRes } = useGetSalesExecutivesQuery();
  const executivesList = (executivesRes?.data || []).map((e) => ({
    id: e.id,
    name: e.name,
  }));

  const { data: reportsRes, isLoading } = useGetReportsSummaryQuery({
    timeRange,
    executiveId: selectedExecutive === "ALL" ? undefined : selectedExecutive,
    source: selectedSource === "ALL" ? undefined : selectedSource,
  });

  const reportData = reportsRes?.data;

  return (
    <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER]}>
      <div className="flex flex-col gap-6">
        {/* Navigation Cards to Specialized Reports */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/dashboard/reports/leads"
            className="p-5 rounded-lg bg-white border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <PieChart className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Pipeline & Funnel Analytics
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Detailed stage breakdown, drop-off rates, and lead source
                  conversion
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            href="/dashboard/reports/performance"
            className="p-5 rounded-lg bg-white border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Sales Executive Performance
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Employee throughput, win ratios, response velocity &
                  compliance
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>

        {/* Global Filter Bar */}
        <ReportFilterBar
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          selectedExecutive={selectedExecutive}
          setSelectedExecutive={setSelectedExecutive}
          selectedSource={selectedSource}
          setSelectedSource={setSelectedSource}
          executivesList={executivesList}
          onExport={handleExport}
          isExporting={isExporting}
        />

        {/* KPI Cards */}
        <ReportKPIs kpis={reportData?.kpis} isLoading={isLoading} />

        {/* Combined Intelligence Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <FunnelAnalyticsCard
              stages={reportData?.funnel}
              isLoading={isLoading}
            />
          </div>
          <div className="lg:col-span-2">
            <ExecutivePerformanceMatrix
              executives={reportData?.executives}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Export Leads Modal */}
        {isExportModalOpen && (
          <ExportLeadsModal
            open={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            currentFilters={{
              source: selectedSource !== "ALL" ? selectedSource : undefined,
              assignedToUserId:
                selectedExecutive !== "ALL" ? selectedExecutive : undefined,
            }}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
