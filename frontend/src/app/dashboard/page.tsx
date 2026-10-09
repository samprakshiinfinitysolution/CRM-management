"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAppSelector } from "@/store";
import { UserRole } from "@/types/api.types";
import {
  useGetTLDashboardMetricsQuery,
  useGetSEDashboardMetricsQuery,
} from "@/store";
import {
  Plus,
  Download,
  MoreHorizontal,
  ArrowUpRight,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
  Layers,
} from "lucide-react";
import { getToken } from "@/lib/utils";

export default function DashboardOverviewPage() {
  const { user } = useAppSelector((state) => state.auth);
  const isTL = user?.role === UserRole.TEAM_LEADER;
  const isSE = user?.role === UserRole.SALES_EXECUTIVE;

  console.log("Token : ", getToken());

  // TL Metrics Query (GET /reports/dashboard-metrics/team-lead)
  const { data: tlResponse, isLoading: isTLLoading } =
    useGetTLDashboardMetricsQuery(undefined, {
      skip: !isTL,
      pollingInterval: 30000,
    });

  // Sales Executive Metrics Query (GET /reports/dashboard-metrics/sales-executive)
  const { data: seMetricsRes, isLoading: isSEMetricsLoading } =
    useGetSEDashboardMetricsQuery(undefined, {
      skip: !isSE,
      pollingInterval: 30000,
    });

  const isLoading = isTL ? isTLLoading : isSE ? isSEMetricsLoading : false;

  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  const tlData = tlResponse?.data;
  const seMetrics = seMetricsRes?.data;
  const recentLeads = useMemo(() => {
    return (isTL ? tlData?.recentLeads : seMetrics?.recentLeads) || [];
  }, [isTL, tlData, seMetrics]);

  // Monthly Sales Array from API
  const monthlySalesData = useMemo(() => {
    const apiMonthly = isTL ? tlData?.monthlySales : seMetrics?.monthlySales;
    if (apiMonthly && apiMonthly.length > 0) {
      return apiMonthly.map((m) => ({
        month: m.month,
        height: m.height,
        value: m.formattedValue,
        totalLeads: m.totalLeads,
        wonLeads: m.wonLeads,
        grossAmount: m.grossAmount,
        netAmount: m.netAmount,
      }));
    }
    return [];
  }, [isTL, tlData, seMetrics]);

  // Category Breakdown Array from API
  const categoryData = useMemo(() => {
    const apiCats = isTL
      ? tlData?.categoryBreakdown
      : seMetrics?.categoryBreakdown;
    if (apiCats && apiCats.length > 0) {
      return apiCats;
    }
    return [];
  }, [isTL, tlData, seMetrics]);

  // Total Leads Count for Donut Center
  const totalCategoryCount = useMemo(() => {
    const sum = categoryData.reduce((acc, c) => acc + c.count, 0);
    if (sum > 0) return sum;
    if (isTL) return tlData?.pipelineHealth.totalPool.value ?? 0;
    return seMetrics?.totalAssigned ?? 0;
  }, [categoryData, isTL, tlData, seMetrics]);

  // Top Deals List from API
  const topDeals = useMemo(() => {
    const apiDeals =
      (isTL ? tlData?.topDeals : seMetrics?.topDeals) || recentLeads;
    if (apiDeals && apiDeals.length > 0) {
      return apiDeals.slice(0, 4).map((d) => ({
        id: d.id,
        name: d.name,
        category: d.category,
        amount: d.amount,
        dotColor: d.dotColor || "bg-blue-500",
        href: `/dashboard/leads/${d.id}`,
      }));
    }
    return [];
  }, [isTL, tlData, seMetrics, recentLeads]);

  // Donut SVG circumference calculation
  const circumference = 346;
  const donutSegments = useMemo(() => {
    let offset = 0;
    const segments: {
      strokeDasharray: string;
      strokeDashoffset: number;
      color: string;
    }[] = [];
    for (const item of categoryData) {
      const strokeDash = Math.max(2, (item.percentage / 100) * circumference);
      segments.push({
        strokeDasharray: `${strokeDash} ${circumference - strokeDash}`,
        strokeDashoffset: -offset,
        color: item.color,
      });
      offset += strokeDash;
    }
    return segments;
  }, [categoryData]);

  // Curve points for Balance Analytics Spline SVG
  const first7Months = useMemo(
    () => monthlySalesData.slice(0, 7),
    [monthlySalesData],
  );
  const grossValues = first7Months.map(
    (m) => m.grossAmount || m.totalLeads || 0,
  );
  const maxVal = Math.max(...grossValues, 1);

  const splinePoints = useMemo(() => {
    if (first7Months.length === 0) {
      return { grossPoints: [], netPoints: [] };
    }
    const xCoords = [50, 120, 190, 260, 330, 400, 470];
    const grossPoints = first7Months.map((m, idx) => {
      const val = m.grossAmount || m.totalLeads || 0;
      const y = 140 - Math.min(115, Math.max(15, (val / maxVal) * 110));
      return { x: xCoords[idx] || 50 + idx * 70, y };
    });
    const netPoints = first7Months.map((m, idx) => {
      const val = m.netAmount || m.wonLeads || 0;
      const y = 140 - Math.min(115, Math.max(10, (val / maxVal) * 80));
      return { x: xCoords[idx] || 50 + idx * 70, y };
    });
    return { grossPoints, netPoints };
  }, [first7Months, maxVal]);

  const activeHoveredMonth = useMemo(() => {
    if (monthlySalesData.length === 0) return null;
    if (hoveredMonth !== null && monthlySalesData[hoveredMonth]) {
      return monthlySalesData[hoveredMonth];
    }
    return (
      monthlySalesData[Math.min(4, monthlySalesData.length - 1)] ??
      monthlySalesData[0]
    );
  }, [hoveredMonth, monthlySalesData]);

  return (
    <div className="flex flex-col gap-6 pb-10 font-sans select-none text-slate-800 dark:text-slate-200">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER BAR */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Welcome back, {user?.name || "User"} &bull; Real-time pipeline
            operations
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/reports"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 text-xs font-semibold shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Export</span>
          </Link>

          <Link
            href={isTL ? "/dashboard/leads/create" : "/dashboard/my-leads"}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isTL ? "Create leads" : "My Leads"}</span>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP ROW: 4 SUMMARY KPI CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Net Income / Total Value */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isTL ? "Total Leads " : "Total Assigned Leads"}
            </span>
            <button
              type="button"
              className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-1 cursor-pointer"
              title="More options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            {isLoading ? (
              <div className="h-8 w-24 bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse" />
            ) : (
              <>
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {isTL
                    ? (tlData?.pipelineHealth.totalPool.formattedValue ?? "0")
                    : seMetrics?.formattedPipelineValue ||
                      `${seMetrics?.totalAssigned ?? 0}`}
                </span>
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-200/50 dark:border-emerald-800/50">
                  <ArrowUpRight className="w-3 h-3" />
                  {isTL
                    ? (tlData?.pipelineHealth.totalPool.change ?? "+10%")
                    : "+12%"}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Card 2: Active Leads / In Flight */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Active In-Flight Leads
            </span>
            <button
              type="button"
              className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-1 cursor-pointer"
              title="More options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            {isLoading ? (
              <div className="h-8 w-20 bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse" />
            ) : (
              <>
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {isTL
                    ? (tlData?.pipelineHealth.activeInFlight.value ?? 0)
                    : (seMetrics?.activeCount ?? 0)}
                </span>
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-200/50 dark:border-emerald-800/50">
                  <ArrowUpRight className="w-3 h-3" />
                  {isTL
                    ? `${tlData?.pipelineHealth.activeInFlight.callsToday ?? 0} today`
                    : "Active"}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Card 3: Won Deals / Closed ARR */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Closed Won Deals
            </span>
            <button
              type="button"
              className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-1 cursor-pointer"
              title="More options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            {isLoading ? (
              <div className="h-8 w-20 bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse" />
            ) : (
              <>
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {isTL
                    ? (tlData?.pipelineHealth.wonARR.wonCount ?? 0)
                    : (seMetrics?.wonCount ?? 0)}
                </span>
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-200/50 dark:border-emerald-800/50">
                  <ArrowUpRight className="w-3 h-3" />
                  {isTL
                    ? (tlData?.pipelineHealth.wonARR.formattedValue ?? "₹0")
                    : (seMetrics?.formattedWonValue ?? "₹0")}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Card 4: Conversion Rate */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Conversion Rate
            </span>
            <button
              type="button"
              className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-1 cursor-pointer"
              title="More options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            {isLoading ? (
              <div className="h-8 w-20 bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse" />
            ) : (
              <>
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {isTL
                    ? `${tlData?.pipelineHealth.wonARR.conversionRate ?? 0}%`
                    : `${seMetrics?.conversionRate ?? 0}%`}
                </span>
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 text-[11px] font-semibold border border-indigo-200/50 dark:border-indigo-800/50">
                  {isTL
                    ? (tlData?.pipelineHealth.slaAdherence.formattedValue ??
                      "95%")
                    : "SLA 98%"}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MIDDLE ROW: BALANCE ANALYTICS (LEFT) + DONUT BREAKDOWN (RIGHT) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Balance Analytics (Line / Spline Area Chart) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs flex flex-col justify-between min-h-[300px]">
          <div className="flex items-center justify-between pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Balance analytics
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Monthly Gross vs Net Pipeline Volume
              </p>
            </div>
            {/* Legends */}
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Gross Pipeline
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                Net Closed
              </span>
            </div>
          </div>

          {/* Spline Area Chart Content */}
          {isLoading ? (
            <div className="w-full h-56 flex flex-col justify-end gap-3 pt-4 animate-pulse">
              <div className="h-3 bg-card rounded w-1/3 mb-auto" />
              <div className="h-36 bg-slate-50 rounded-xl flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-indigo-500 animate-spin opacity-40" />
              </div>
              <div className="flex justify-between px-4 pt-2">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="h-2.5 w-6 bg-card rounded" />
                ))}
              </div>
            </div>
          ) : splinePoints.grossPoints.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-slate-400 gap-2">
              <TrendingUp className="w-8 h-8 stroke-1 text-slate-300" />
              <p className="text-xs">No balance analytics data available</p>
            </div>
          ) : (
            <div className="relative w-full h-56 pt-2">
              <svg
                viewBox="0 0 500 180"
                className="w-full h-full overflow-visible"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Y-Axis Guidelines */}
                <line
                  x1="40"
                  y1="20"
                  x2="490"
                  y2="20"
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <line
                  x1="40"
                  y1="60"
                  x2="490"
                  y2="60"
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <line
                  x1="40"
                  y1="100"
                  x2="490"
                  y2="100"
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <line
                  x1="40"
                  y1="140"
                  x2="490"
                  y2="140"
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />

                {/* Y-Axis Labels */}
                <text
                  x="30"
                  y="24"
                  fontSize="10"
                  fill="#94a3b8"
                  textAnchor="end"
                  fontFamily="sans-serif"
                >
                  Max
                </text>
                <text
                  x="30"
                  y="64"
                  fontSize="10"
                  fill="#94a3b8"
                  textAnchor="end"
                  fontFamily="sans-serif"
                >
                  75%
                </text>
                <text
                  x="30"
                  y="104"
                  fontSize="10"
                  fill="#94a3b8"
                  textAnchor="end"
                  fontFamily="sans-serif"
                >
                  25%
                </text>
                <text
                  x="30"
                  y="144"
                  fontSize="10"
                  fill="#94a3b8"
                  textAnchor="end"
                  fontFamily="sans-serif"
                >
                  0
                </text>

                {/* Curve 1: Orange/Amber Smooth Gross Curve */}
                {splinePoints.grossPoints.length > 0 && (
                  <path
                    d={
                      `M${splinePoints.grossPoints[0].x} ${splinePoints.grossPoints[0].y} ` +
                      splinePoints.grossPoints
                        .slice(1)
                        .map((p, i) => {
                          const prev = splinePoints.grossPoints[i];
                          const cx = (prev.x + p.x) / 2;
                          return `C${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
                        })
                        .join(" ")
                    }
                    stroke="#f97316"
                    strokeWidth="2.5"
                    fill="none"
                  />
                )}

                {/* Curve 2: Solid Dark Navy Net Total Spline */}
                {splinePoints.netPoints.length > 0 && (
                  <path
                    d={
                      `M${splinePoints.netPoints[0].x} ${splinePoints.netPoints[0].y} ` +
                      splinePoints.netPoints
                        .slice(1)
                        .map((p, i) => {
                          const prev = splinePoints.netPoints[i];
                          const cx = (prev.x + p.x) / 2;
                          return `C${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
                        })
                        .join(" ")
                    }
                    stroke="#1e3a8a"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                    fill="none"
                  />
                )}

                {/* Interactive Tooltip Callout */}
                {activeHoveredMonth && splinePoints.grossPoints.length > 0 && (
                  <g
                    transform={`translate(${splinePoints.grossPoints[Math.min(hoveredMonth ?? 0, splinePoints.grossPoints.length - 1)].x}, ${splinePoints.grossPoints[Math.min(hoveredMonth ?? 0, splinePoints.grossPoints.length - 1)].y - 35})`}
                  >
                    <rect
                      x="-32"
                      y="-16"
                      width="64"
                      height="22"
                      rx="6"
                      fill="#1e3a8a"
                    />
                    <text
                      x="0"
                      y="-2"
                      fontSize="10"
                      fontWeight="bold"
                      fill="#ffffff"
                      textAnchor="middle"
                      fontFamily="sans-serif"
                    >
                      {activeHoveredMonth.value}
                    </text>
                    <circle
                      cx="0"
                      cy="35"
                      r="4"
                      fill="#ffffff"
                      stroke="#f97316"
                      strokeWidth="2.5"
                    />
                  </g>
                )}

                {/* X-Axis Labels */}
                <g
                  fontSize="10"
                  fill="#64748b"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  {first7Months.map((m, idx) => (
                    <text
                      key={m.month}
                      x={splinePoints.grossPoints[idx]?.x ?? 50 + idx * 70}
                      y="165"
                    >
                      {m.month}
                    </text>
                  ))}
                </g>
              </svg>
            </div>
          )}
        </div>

        {/* Right Column: Donut Chart Breakdown */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs flex flex-col justify-between min-h-[300px]">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Channel & Source Share
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Distribution by Inbound Channels
              </p>
            </div>
            <button
              type="button"
              className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-1 cursor-pointer"
              title="Options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4 py-6 animate-pulse">
              <div className="sm:col-span-6 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-8 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
              <div className="sm:col-span-6 flex flex-col gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-3 w-20 bg-slate-200 dark:bg-slate-750 rounded" />
                    <div className="h-3 w-8 bg-slate-200 dark:bg-slate-750 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ) : categoryData.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-2">
              <PieChartIcon className="w-8 h-8 stroke-1 text-slate-300 dark:text-slate-600" />
              <p className="text-xs">No channel share data recorded</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4 py-2">
              {/* Donut Chart SVG */}
              <div className="sm:col-span-6 flex items-center justify-center relative">
                <svg viewBox="0 0 160 160" className="w-36 h-36">
                  {donutSegments.map((seg, i) => (
                    <circle
                      key={i}
                      cx="80"
                      cy="80"
                      r="55"
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth="20"
                      strokeDasharray={seg.strokeDasharray}
                      strokeDashoffset={seg.strokeDashoffset}
                      className="transition-all duration-300"
                    />
                  ))}
                </svg>
                {/* Center Counter */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {totalCategoryCount}
                  </span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">
                    TOTAL
                  </span>
                </div>
              </div>

              {/* Right Legend List */}
              <div className="sm:col-span-6 flex flex-col gap-2.5 text-xs">
                {categoryData.map((cat) => (
                  <div
                    key={cat.label}
                    className="flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300 min-w-0">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${cat.dotColor} shrink-0`}
                      />
                      <span className="truncate">{cat.label}</span>
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 shrink-0 ml-2">
                      {cat.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BOTTOM ROW: TOTAL SALES BAR CHART (LEFT) + TOP PRODUCTS LIST (RIGHT) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Total Sales 12-Month Bar Chart */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs flex flex-col justify-between min-h-[280px]">
          <div className="flex items-center justify-between pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Total volume
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                12-Month Historical Pipeline Volume
              </p>
            </div>
            {activeHoveredMonth && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
                {activeHoveredMonth.month}: {activeHoveredMonth.value}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="w-full flex flex-col gap-3 pt-4 animate-pulse">
              <div className="flex items-end justify-between gap-2 h-44 px-2 border-b border-slate-100 dark:border-slate-800">
                {[45, 60, 30, 75, 90, 50, 65, 40, 35, 55, 70, 85].map(
                  (h, idx) => (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center justify-end h-full"
                    >
                      <div
                        style={{ height: `${h}%` }}
                        className="w-full max-w-[18px] bg-slate-100 dark:bg-slate-800 rounded-t-sm"
                      />
                    </div>
                  ),
                )}
              </div>
              <div className="flex justify-between px-2 pt-1">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="h-2.5 w-4 bg-slate-100 dark:bg-slate-800 rounded" />
                ))}
              </div>
            </div>
          ) : monthlySalesData.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-2">
              <BarChart3 className="w-8 h-8 stroke-1 text-slate-300 dark:text-slate-600" />
              <p className="text-xs">No historical volume data available</p>
            </div>
          ) : (
            <div className="w-full flex flex-col gap-2 pt-2">
              {/* Y-axis values & Columns Grid */}
              <div className="flex items-end justify-between gap-1 sm:gap-2 h-44 px-2 border-b border-slate-100 dark:border-slate-800">
                {monthlySalesData.map((item, idx) => {
                  const isHovered = hoveredMonth === idx;
                  return (
                    <div
                      key={item.month}
                      onMouseEnter={() => setHoveredMonth(idx)}
                      className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
                    >
                      {/* Bar */}
                      <div
                        style={{ height: `${item.height}%` }}
                        className={`w-full max-w-[18px] sm:max-w-[22px] rounded-t-sm transition-all ${
                          isHovered
                            ? "bg-indigo-600 dark:bg-indigo-500 shadow-sm"
                            : "bg-indigo-900/85 dark:bg-indigo-600/70 hover:bg-indigo-700 dark:hover:bg-indigo-500"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* X-axis Month Labels */}
              <div className="flex items-center justify-between px-2 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 pt-1">
                {monthlySalesData.map((item) => (
                  <span key={item.month} className="flex-1 text-center">
                    {item.month}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Top Products / Priority Deals List */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs flex flex-col justify-between min-h-[280px]">
          <div className="flex items-center justify-between pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Top deals & priority leads
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Highest value accounts in pipeline
              </p>
            </div>
            <Link
              href="/dashboard/leads"
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
            >
              View all &rarr;
            </Link>
          </div>

          {/* List Items */}
          {isLoading ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 flex flex-col animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="py-3 flex items-center justify-between px-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700" />
                    <div className="flex flex-col gap-1.5">
                      <div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
                      <div className="h-2 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                    </div>
                  </div>
                  <div className="h-3 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              ))}
            </div>
          ) : topDeals.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-2">
              <Layers className="w-8 h-8 stroke-1 text-slate-300 dark:text-slate-600" />
              <p className="text-xs">No priority deals or leads available</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 flex flex-col">
              {topDeals.map((prod) => (
                <Link
                  key={prod.id}
                  href={prod.href}
                  className="py-3 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/60 px-2 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-3 h-3 rounded-full ${prod.dotColor} shrink-0`}
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {prod.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                        {prod.category}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0 ml-3">
                    {prod.amount}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
