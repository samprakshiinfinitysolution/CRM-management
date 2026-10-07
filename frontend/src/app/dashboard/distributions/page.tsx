"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import { GitFork, Plus } from "lucide-react";
import { toast } from "sonner";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { UserRole, LeadStatus, type LeadFilterParams } from "@/types/api.types";
import {
  useGetLeadsQuery,
  useLazyGetLeadsQuery,
  useGetSalesExecutivesQuery,
  useReassignLeadsMutation,
  useRecallLeadsMutation,
} from "@/store";
import { handleApiError } from "@/lib/errorHandler";
import { ReassignRecallConsole } from "@/components/team_leader/distribute";

export default function DistributionsOverviewPage() {
  // 1. Unassigned leads query (for refetch sync)
  const { refetch: refetchUnassigned } = useGetLeadsQuery({
    status: LeadStatus.NEW,
    limit: 1,
  });

  // 2. Query to fetch executive leads on-demand
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

  const { data: execsData, refetch: refetchExecs } = useGetSalesExecutivesQuery();
  const executives = execsData?.data || [];

  const [reassignMutation, { isLoading: isReassigning }] = useReassignLeadsMutation();
  const [recallMutation, { isLoading: isRecalling }] = useRecallLeadsMutation();

  const handleReassignLeads = async (
    sourceExecId: string,
    targetExecId: string,
    leadIds: string[],
    reason: string,
  ) => {
    try {
      const res = await reassignMutation({
        leadIds,
        targetExecutiveId: targetExecId,
        reason: reason || "Workload rebalancing",
      }).unwrap();

      toast.success(
        res.message ||
          `Successfully reassigned ${leadIds.length} lead${leadIds.length > 1 ? "s" : ""}`,
      );

      if (sourceExecId) {
        fetchLeadsForExecutive({ assignedToUserId: sourceExecId, limit: 100 });
      }
      refetchUnassigned();
      refetchExecs();
    } catch (err) {
      handleApiError(err, "Failed to reassign leads");
    }
  };

  const handleRecallLeads = async (
    sourceExecId: string,
    leadIds: string[],
    reason: string,
  ) => {
    try {
      const res = await recallMutation({
        leadIds,
        reason: reason || "Recalled to unassigned pool",
      }).unwrap();

      toast.success(
        res.message ||
          `Successfully recalled ${leadIds.length} lead${leadIds.length > 1 ? "s" : ""}`,
      );

      if (sourceExecId) {
        fetchLeadsForExecutive({ assignedToUserId: sourceExecId, limit: 100 });
      }
      refetchUnassigned();
      refetchExecs();
    } catch (err) {
      handleApiError(err, "Failed to recall leads to pool");
    }
  };

  return (
    <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER]}>
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <GitFork className="w-5 h-5 text-indigo-600" />
              <span>Lead Distribution</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Assign leads evenly, by custom quota, or manually manage team assignments.
            </p>
          </div>

          <Link
            href="/dashboard/distributions/create"
            className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Distribute Leads</span>
          </Link>
        </div>

     

        {/* Reassignment & Recall Console */}
        <ReassignRecallConsole
          assignedLeads={execLeadsData?.data || []}
          executives={executives}
          onReassignLeads={handleReassignLeads}
          onRecallLeads={handleRecallLeads}
          isProcessing={isReassigning || isRecalling || isFetchingExecLeads}
          fetchLeadsForExecutive={fetchLeadsForExecutive}
        />
      </div>
    </ProtectedRoute>
  );
}
