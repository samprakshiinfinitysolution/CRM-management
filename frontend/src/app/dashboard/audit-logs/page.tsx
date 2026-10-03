'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/types/api.types';
import { useGetAuditLogsQuery, type AuditLogItem } from '@/store';
import { Pagination } from '@/components/ui/Pagination';

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data: logsRes, isLoading, isFetching, refetch } = useGetAuditLogsQuery({
    page,
    limit,
  });

  const logs = logsRes?.data || [];
  const pagination = logsRes?.pagination;

  return (
    <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              Security & Audit Logs
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Immutable, server-authoritative audit trail of sensitive mutations and events.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-blue-600' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Audit Table Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`skel-${i}`} className="animate-pulse">
                      <td className="py-3.5 px-4"><div className="h-3.5 bg-slate-100 rounded w-28" /></td>
                      <td className="py-3.5 px-4"><div className="h-3.5 bg-slate-100 rounded w-24" /></td>
                      <td className="py-3.5 px-4"><div className="h-3.5 bg-slate-100 rounded w-32" /></td>
                      <td className="py-3.5 px-4"><div className="h-3.5 bg-slate-100 rounded w-20" /></td>
                      <td className="py-3.5 px-4"><div className="h-3.5 bg-slate-100 rounded w-20" /></td>
                    </tr>
                  ))
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
                  logs.map((log: AuditLogItem) => (
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
                        <span className="inline-flex items-center px-2 py-0.5 rounded font-mono text-[10px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                          <span className="text-[11px] text-slate-600">{log.entityType}</span>
                          {log.entityId && (
                            <span className="font-mono text-[10px] text-slate-400">
                              #{log.entityId.slice(0, 8)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                        {log.ipAddress || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && logs.length > 0 && (
            <div className="p-3 border-t border-slate-100">
              <Pagination
                currentPage={page}
                totalPages={Math.max(1, pagination?.totalPages || 1)}
                totalItems={pagination?.total ?? logs.length}
                pageSize={limit}
                onPageChange={setPage}
                onPageSizeChange={(newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                }}
                showPageSizeSelector
              />
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
