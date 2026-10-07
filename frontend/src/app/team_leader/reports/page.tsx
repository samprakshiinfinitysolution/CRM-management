"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  ReportHeader,
  ReportFilterBar,
  ReportKPIs,
  FunnelAnalyticsCard,
  ExecutivePerformanceMatrix,
} from "@/components/team_leader/reports";
import { ExportLeadsModal } from "@/components/leads";
import { downloadReportsExport } from "@/lib/exportUtils";
import { useGetSalesExecutivesQuery } from "@/store/api/userApi";
import { useGetReportsSummaryQuery } from "@/store/api/leadApi";

export default function TeamLeaderReportsPage() {
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

  // RTK Query hooks
  const { data: executivesRes } = useGetSalesExecutivesQuery();
  const executivesList = (executivesRes?.data || []).map((e) => ({
    id: e.id,
    name: e.name,
  }));

  const {
    data: reportsRes,
    isLoading,
    isFetching,
    refetch,
  } = useGetReportsSummaryQuery({
    timeRange,
    executiveId: selectedExecutive === "ALL" ? undefined : selectedExecutive,
    source: selectedSource === "ALL" ? undefined : selectedSource,
  });

  const reportData = reportsRes?.data;

  const handleRefresh = async () => {
    try {
      await refetch().unwrap();
      toast.success("Reports and intelligence data refreshed");
    } catch {
      toast.error("Failed to refresh reports data");
    }
  };

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 pt-4 pb-24 flex flex-col gap-6">
      <ReportHeader
        onRefresh={handleRefresh}
        onOpenExport={() => setIsExportModalOpen(true)}
        isFetching={isFetching}
      />

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

      <ReportKPIs kpis={reportData?.kpis} isLoading={isLoading} />

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

      <ExportLeadsModal
        open={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        currentFilters={{
          source: selectedSource === "ALL" ? undefined : selectedSource,
          assignedToUserId:
            selectedExecutive === "ALL" ? undefined : selectedExecutive,
        }}
      />
    </main>
  );
}
