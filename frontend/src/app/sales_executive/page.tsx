"use client";

import React, { useState } from "react";
import { useAppSelector } from "@/store";
import { Shield, CheckCircle2, AlertTriangle } from "lucide-react";
import { useGetFollowUpSummaryQuery } from "@/store/api/followUpApi";
import type { FollowUpScope } from "@/types/api.types";
import FollowUpStatsCards from "@/components/sales_executive/FollowUpStatsCards";
import FollowUpWorkQueue from "@/components/sales_executive/FollowUpWorkQueue";
import AssignedLeadsTable from "@/components/sales_executive/AssignedLeadsTable";
import LeadFollowUpTimelineDrawer from "@/components/sales_executive/LeadFollowUpTimelineDrawer";
import FollowUpBanner from "@/components/dashboard/FollowUpBanner";

export default function SalesExecutivePage() {
  const { user } = useAppSelector((state) => state.auth);
  const [activeScope, setActiveScope] = useState<FollowUpScope>("today");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const { data: summaryData } = useGetFollowUpSummaryQuery();
  const summary = summaryData?.data;

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-0 pt-4 pb-24">
      <div className="flex flex-col gap-4">
        {/* Welcome & RBAC Info Banner matching TL Banner styles */}
        <section className="bg-crm-card rounded-2xl p-4 border border-crm-subtle shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-(--crm-brand-primary) flex items-center justify-center shrink-0 shadow-2xs">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-crm-success text-crm-success border border-emerald-200 mb-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>DATA ISOLATED WORKSPACE</span>
              </div>
              <h2 className="text-base font-bold text-crm-primary">
                Welcome back, {user?.name || "Executive"}
              </h2>
              <p className="text-xs text-crm-muted">
                Manage your scheduled customer follow-ups and assigned lead pipeline in real time.
              </p>
            </div>
          </div>

          {/* Quick Overdue Alert if applicable */}
          {summary && summary.overdue > 0 && (
            <button
              type="button"
              onClick={() => setActiveScope("overdue")}
              className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-semibold flex items-center gap-2 transition-all self-stretch md:self-auto justify-center cursor-pointer shadow-2xs"
            >
              <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />
              <span>
                {summary.overdue} Overdue Follow-Up{summary.overdue > 1 ? "s" : ""} Attention Needed
              </span>
            </button>
          )}
        </section>

        {/* Follow-up Command Hub Banner */}
        <FollowUpBanner defaultExpanded={false} />

        {/* Follow-up Summary Cards */}
        <FollowUpStatsCards
          activeScope={activeScope}
          onScopeSelect={(scope) => setActiveScope(scope)}
        />

        {/* Follow-Up Work Queue */}
        <FollowUpWorkQueue
          scope={activeScope}
          onScopeChange={(scope) => setActiveScope(scope)}
          onSelectLead={(leadId) => setSelectedLeadId(leadId)}
        />

        {/* Assigned Leads Table */}
        <AssignedLeadsTable
          onSelectLead={(leadId) => setSelectedLeadId(leadId)}
        />
      </div>

      {/* Lead Follow-Up Timeline Drawer */}
      {selectedLeadId && (
        <LeadFollowUpTimelineDrawer
          leadId={selectedLeadId}
          onClose={() => setSelectedLeadId(null)}
        />
      )}
    </main>
  );
}
