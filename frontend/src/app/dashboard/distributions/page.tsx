"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import {
  GitFork,
  Plus,
  Users,
  AlertTriangle,
  ArrowRight,
  Layers,
} from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { UserRole, LeadStatus, type LeadFilterParams } from "@/types/api.types";
import {
  useGetLeadsQuery,
  useLazyGetLeadsQuery,
  useGetSalesExecutivesQuery,
  useReassignLeadsMutation,
  useRecallLeadsMutation,
} from "@/store";
import { ReassignRecallConsole } from "@/components/team_leader/distribute";

export default function DistributionsOverviewPage() {
  // 1. Unassigned leads query (for stats card) - completely isolated cache key
  const { data: unassignedData } = useGetLeadsQuery({
    status: LeadStatus.NEW,
    limit: 1,
  });
  const unassignedCount = unassignedData?.pagination?.total ?? 0;

  // 2. Separate lazy query to fetch executive leads on-demand without affecting unassignedData
  const [
    triggerGetLeads,
    { data: execLeadsData, isFetching: isFetchingExecLeads },
  ] = useLazyGetLeadsQuery();

  const fetchLeadsForExecutive = useCallback(
    (query?: LeadFilterParams) => {
      triggerGetLeads(query || {});
    },
    [triggerGetLeads],
  );

  const { data: execsData } = useGetSalesExecutivesQuery();
  const executives = execsData?.data || [];
  const activeExecs = executives.filter((e) => e.isActive).length;

  const [reassignMutation, { isLoading: isReassigning }] =
    useReassignLeadsMutation();
  const [recallMutation, { isLoading: isRecalling }] = useRecallLeadsMutation();

  const handleReassignLeads = async (
    sourceExecId: string,
    targetExecId: string,
    leadIds: string[],
    reason: string,
  ) => {
    try {
      await reassignMutation({
        leadIds,
        targetExecutiveId: targetExecId,
        reason,
      }).unwrap();
    } catch (err) {
      console.error("Failed to reassign leads:", err);
    }
  };

  const handleRecallLeads = async (
    sourceExecId: string,
    leadIds: string[],
    reason: string,
  ) => {
    try {
      await recallMutation({
        leadIds,
        reason,
      }).unwrap();
    } catch (err) {
      console.error("Failed to recall leads:", err);
    }
  };

  return (
    <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER]}>
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <GitFork className="w-6 h-6 text-indigo-600" />
              <span>Lead Distribution</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Assign leads to your sales team evenly, by custom count, or
              manually.
            </p>
          </div>

          <Link
            href="/dashboard/distributions/create"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Distribute Leads</span>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Unassigned Leads
              </span>
              <span className="text-2xl font-bold text-slate-900">
                {unassignedCount}
              </span>
              <span className="text-xs text-amber-600 font-medium block mt-0.5">
                Waiting for distribution
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Active Sales Reps
              </span>
              <span className="text-2xl font-bold text-slate-900">
                {activeExecs}
              </span>
              <span className="text-xs text-slate-500 font-medium block mt-0.5">
                Out of {executives.length} total team members
              </span>
            </div>
          </div>
        </div>

        {/* Distribution Action Card */}
        <div className="bg-linear-to-br from-indigo-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <h2 className="text-lg font-bold">
              Ready to assign incoming leads?
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Choose between an equal automatic split among active reps, setting
              custom quotas, or hand-picking reps for high-value prospects.
            </p>
          </div>

          <Link
            href="/dashboard/distributions/create"
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold flex items-center gap-2 shrink-0 transition-transform active:scale-95 shadow-xs"
          >
            <span>Start Distribution</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Reassignment & Recall Console */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <div className="mb-4 pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Reassign or Recall Leads</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Transfer leads between team members or return them to the
              unassigned pool if a rep is out of office.
            </p>
          </div>

          <ReassignRecallConsole
            assignedLeads={execLeadsData?.data || []}
            executives={executives}
            onReassignLeads={handleReassignLeads}
            onRecallLeads={handleRecallLeads}
            handleSelectAllExecutives={() => {}}
            handleDeselectAllExecutives={() => {}}
            isProcessing={isReassigning || isRecalling || isFetchingExecLeads}
            fetchLeadsForExecutive={fetchLeadsForExecutive}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
