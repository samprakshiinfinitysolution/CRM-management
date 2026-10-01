'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  Activity,
  Layers,
} from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/types/api.types';
import { useGetAuditLogsQuery } from '@/store';
import { Pagination } from '@/components/ui/Pagination';

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: logsRes, isLoading, isFetching, refetch } = useGetAuditLogsQuery({
    page,
    limit,
  });

  const logs = logsRes?.data || [];
  const pagination = logsRes?.pagination;

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'ASSIGN':
      case 'LEAD_ASSIGNED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'REASSIGN':
      case 'LEAD_REASSIGNED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'RECALL':
      case 'LEAD_RECALLED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'STATUS_CHANGE':
      case 'STATUS_UPDATE':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'DELETE':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER]}>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
              <span>Security & Audit Trails</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Immutable chronological record of administrative actions, quota splits, status transitions, and data integrity events
            </p>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-2xs transition-all self-start sm:self-auto"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>

        {/* Audit Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Details / Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      Querying audit logs ledger...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                        <ShieldCheck className="w-8 h-8 stroke-[1.5]" />
                        <p className="text-sm font-semibold text-slate-700">No audit events logged yet</p>
                        <p className="text-xs text-slate-400">
                          System actions such as status updates, lead assignments, and imports will appear here.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                            {log.actor?.name ? log.actor.name[0] : 'S'}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900">
                              {log.actor?.name || 'System / Auto'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {log.actor?.role || 'SYSTEM'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getActionBadgeColor(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                          <span className="text-slate-500">{log.entityType}:</span>
                          <span className="font-mono text-indigo-700">
                            {log.entityId ? log.entityId.slice(0, 12) : '-'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="font-mono text-[10px] text-slate-500 truncate" title={JSON.stringify(log.newValue || log.oldValue || {})}>
                          {log.newValue
                            ? JSON.stringify(log.newValue)
                            : log.oldValue
                            ? JSON.stringify(log.oldValue)
                            : 'Executed successfully'}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} audit events)
              </span>
              <Pagination
                currentPage={page}
                totalPages={pagination.totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
