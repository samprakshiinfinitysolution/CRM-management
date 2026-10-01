'use client';

import React from 'react';
import Link from 'next/link';
import {
  GitFork,
  Plus,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/types/api.types';
import {
  useGetLeadsQuery,
  useGetSalesExecutivesQuery,
  //useGetExecutiveWorkloadQuery,
} from '@/store';
import { ReassignRecallConsole } from '@/components/team_leader/distribute';

export default function DistributionsOverviewPage() {
  const { data: unassignedData } = useGetLeadsQuery({
    status: 'NEW' as any,
    limit: 1,
  });
  const unassignedCount = unassignedData?.pagination?.total ?? 0;

  const { data: execsData } = useGetSalesExecutivesQuery();
  const executives = execsData?.data || [];
  const activeExecs = executives.filter((e) => e.isActive).length;

  //const { data: workloadData } = useGetExecutiveWorkloadQuery();
  //const totalAssigned = workloadData?.data?.reduce((sum, w) => sum + w.activeLeads, 0) || 0;

  return (
    <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER]}>
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <GitFork className="w-6 h-6 text-indigo-600" />
              <span>Lead Distribution Console</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Supervise quota allocations, dispatch unassigned leads, and balance team workloads
            </p>
          </div>

          <Link
            href="/dashboard/distributions/create"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Start Lead Distribution</span>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Unassigned Pool
              </span>
              <span className="text-2xl font-black text-slate-900">
                {unassignedCount}
              </span>
              <span className="text-[11px] text-amber-600 font-semibold block mt-0.5">
                Ready for allocation
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Active Staff
              </span>
              <span className="text-2xl font-black text-slate-900">
                {activeExecs}
              </span>
              <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                Out of {executives.length} total reps
              </span>
            </div>
          </div>

          {/*<div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Assigned Deals
              </span>
              <span className="text-2xl font-black text-slate-900">
                {totalAssigned}
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">
                Active in pipeline
              </span>
            </div>
          </div>*/}
        </div>

        {/* Distribution Launchpad Card */}
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
              <Shield className="w-3 h-3" />
              <span>ACID TRANSACTION ENGINE</span>
            </div>
            <h2 className="text-lg font-bold">
              Equal, Custom Quota & Manual Allocation
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Launch the distribution wizard to divide unassigned leads among your sales executives.
              All operations are protected with atomic rollbacks and immutable historical assignment tracking.
            </p>
          </div>

          <Link
            href="/dashboard/distributions/create"
            className="px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold flex items-center gap-2 shrink-0 transition-transform active:scale-95 shadow-sm"
          >
            <span>Launch Allocation Wizard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Reassignment & Recall Console */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <div className="mb-4 pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Lead Reassignment & Pool Recall Console</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select assigned leads to transfer ownership between executives or recall back to the unassigned intake pool
            </p>
          </div>

          <ReassignRecallConsole
            assignedLeads={[]}
            executives={executives}
            onReassignLeads={() => {}}
            onRecallLeads={() => {}}
            handleSelectAllExecutives={() => {}}
            handleDeselectAllExecutives={() => {}}
            isProcessing={false}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
