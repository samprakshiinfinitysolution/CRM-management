'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserRole, type LeadItem } from '@/types/api.types';
import { Pagination } from '@/components/ui/Pagination';
import {
  useGetSalesExecutiveByIdQuery,
  useToggleExecutiveStatusMutation,
} from '@/store';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);

  const { data: userRes, isLoading, isError, refetch } = useGetSalesExecutiveByIdQuery(id);
  const [toggleStatus, { isLoading: isToggling }] = useToggleExecutiveStatusMutation();
  const user = userRes?.data;

  const handleToggleActive = async () => {
    if (!user) return;
    try {
      await toggleStatus({ id: user.id, isActive: !user.isActive }).unwrap();
      toast.success(`Executive marked as ${user.isActive ? 'Inactive' : 'Active'}`);
      refetch();
    } catch {
      toast.error('Failed to change user status');
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER]}>
        <div className="py-16 text-center text-slate-400">Loading user profile...</div>
      </ProtectedRoute>
    );
  }

  if (isError || !user) {
    return (
      <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER]}>
        <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-2xl text-rose-700">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p className="font-semibold">User Not Found or Error Loading Profile</p>
          <Link href="/dashboard/users" className="text-xs underline mt-2 inline-block">
            Back to User Directory
          </Link>
        </div>
      </ProtectedRoute>
    );
  }

  const leads = (user.leads || []) as unknown as LeadItem[];

  return (
    <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/users"
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{user.name}</h1>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    user.isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {user.email} · {user.role}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleActive}
            disabled={isToggling}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer ${
              user.isActive
                ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {isToggling ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin mx-auto" />
            ) : user.isActive ? (
              'Deactivate Account'
            ) : (
              'Activate Account'
            )}
          </button>
        </div>

        {/* Metrics Overview Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Leads</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{user.activeLeads ?? 0}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Won Deals</p>
            <p className="text-2xl font-black text-emerald-700 mt-1">{user.convertedLeads ?? 0}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Conversion Rate</p>
            <p className="text-2xl font-black text-indigo-700 mt-1">
              {((user.conversionRate ?? 0)).toFixed(1)}%
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Workload Status</p>
            <p className="text-sm font-bold text-slate-800 mt-2 capitalize">
              {user.workloadStatus || 'NORMAL'}
            </p>
          </div>
        </div>

        {/* Assigned Leads Table Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Assigned Leads ({leads.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Lead Code</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Mobile</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No active leads assigned to this executive.
                    </td>
                  </tr>
                ) : (
                  leads
                    .slice((Math.min(page, Math.max(1, Math.ceil(leads.length / limit))) - 1) * limit, Math.min(page, Math.max(1, Math.ceil(leads.length / limit))) * limit)
                    .map((lead) => (
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

          {leads.length > 0 && (
            <Pagination
              currentPage={Math.min(page, Math.max(1, Math.ceil(leads.length / limit)))}
              totalPages={Math.max(1, Math.ceil(leads.length / limit))}
              totalItems={leads.length}
              pageSize={limit}
              onPageChange={setPage}
              onPageSizeChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
