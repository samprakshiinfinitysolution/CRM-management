'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Mail,
  Shield,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Phone,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/types/api.types';
import {
  useGetSalesExecutiveByIdQuery,
  useToggleExecutiveStatusMutation,
} from '@/store';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: userRes, isLoading, refetch } = useGetSalesExecutiveByIdQuery(id);
  const user = userRes?.data;

  const [toggleStatus, { isLoading: isToggling }] = useToggleExecutiveStatusMutation();

  const handleToggle = async () => {
    if (!user) return;
    try {
      await toggleStatus({ id: user.id, isActive: !user.isActive }).unwrap();
      toast.success(`Executive marked as ${!user.isActive ? 'active' : 'inactive'}`);
      refetch();
    } catch {
      toast.error('Failed to change status');
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center text-xs text-slate-400">
        Loading user performance details...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-amber-600" />
          <h2 className="text-sm font-bold text-amber-900">User Record Not Found</h2>
          <Link
            href="/dashboard/users"
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
          >
            Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER]}>
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/users"
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    user.isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                >
                  {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggle}
            disabled={isToggling}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              user.isActive
                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            {user.isActive ? 'Deactivate Account' : 'Activate Account'}
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Active Leads
            </span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">
              {user.activeLeads ?? 0}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Won Deals
            </span>
            <span className="text-xl font-bold text-emerald-700 mt-1 block">
              {user.convertedLeads ?? 0}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Overdue Tasks
            </span>
            <span
              className={`text-xl font-bold mt-1 block ${
                (user.followUpsOverdue ?? 0) > 0
                  ? 'text-rose-600'
                  : 'text-slate-900'
              }`}
            >
              {user.followUpsOverdue ?? 0}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Conversion Rate
            </span>
            <span className="text-xl font-bold text-indigo-700 mt-1 block">
              {user.conversionRate ?? 0}%
            </span>
          </div>
        </div>

        {/* Assigned Leads Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Currently Assigned Leads ({user.leads?.length || 0})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase">
                <tr>
                  <th className="py-3 px-4">Lead Code</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(!user.leads || user.leads.length === 0) ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No active leads assigned to this executive.
                    </td>
                  </tr>
                ) : (
                  user.leads.map((lead: any) => (
                    <tr
                      key={lead.id}
                      onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
                      className="hover:bg-slate-50 cursor-pointer"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                        {lead.leadCode}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {lead.customerName}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {lead.mobile}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/dashboard/leads/${lead.id}`}
                          className="text-xs font-semibold text-indigo-600 hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
