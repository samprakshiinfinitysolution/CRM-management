'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Shield, CheckCircle2 } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/types/api.types';
import { useAppSelector } from '@/store';
import AssignedLeadsTable from '@/components/sales_executive/AssignedLeadsTable';
import LeadFollowUpTimelineDrawer from '@/components/sales_executive/LeadFollowUpTimelineDrawer';

export default function MyLeadsPage() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  return (
    <ProtectedRoute allowedRoles={[UserRole.SALES_EXECUTIVE]}>
      <div className="flex flex-col gap-6">
        {/* Banner */}
        <section className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>EXECUTIVE WORKSPACE</span>
              </div>
              <h1 className="text-lg font-bold text-slate-900">
                My Assigned Leads
              </h1>
              <p className="text-xs text-slate-500">
                Data-isolated roster of inquiries explicitly assigned to {user?.name || 'you'}.
              </p>
            </div>
          </div>
        </section>

        {/* Assigned Leads Table */}
        <AssignedLeadsTable
          onSelectLead={(leadId) => router.push(`/dashboard/leads/${leadId}`)}
        />

        {/* Lead Follow-Up Timeline Drawer (if opened) */}
        {selectedLeadId && (
          <LeadFollowUpTimelineDrawer
            leadId={selectedLeadId}
            onClose={() => setSelectedLeadId(null)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
