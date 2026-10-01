'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  User,
  ShieldAlert,
} from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/types/api.types';
import { Pagination } from '@/components/ui/Pagination';
import { useGetImportBatchByIdQuery } from '@/store';

export default function ImportBatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);

  const { data: batchRes, isLoading, isError } = useGetImportBatchByIdQuery(id);
  const batch = batchRes?.data;

  if (isLoading) {
    return (
      <div className="py-16 text-center text-xs text-slate-400">
        Loading batch audit logs...
      </div>
    );
  }

  if (isError || !batch) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-amber-600" />
          <h2 className="text-sm font-bold text-amber-900">Batch Not Found</h2>
          <p className="text-xs text-amber-700">
            The requested batch log was not found or has expired.
          </p>
          <Link
            href="/dashboard/imports"
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
          >
            Back to Import History
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER]}>
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/imports"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              <span>Import Batch Inspection</span>
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              Batch #{batch.id} · {batch.fileName}
            </p>
          </div>
        </div>

        {/* Summary Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Rows
            </span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">
              {batch.totalRows}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Successfully Ingested
            </span>
            <span className="text-xl font-bold text-emerald-700 mt-1 block">
              {batch.importedCount}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Duplicates Skipped
            </span>
            <span className="text-xl font-bold text-amber-700 mt-1 block">
              {batch.duplicateCount}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Validation Failures
            </span>
            <span className="text-xl font-bold text-rose-600 mt-1 block">
              {batch.failedCount}
            </span>
          </div>
        </div>

        {/* Errors Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Row-Level Errors & Rejections ({batch.errors?.length || 0})</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase">
                <tr>
                  <th className="py-3 px-4">Row #</th>
                  <th className="py-3 px-4">Target Column</th>
                  <th className="py-3 px-4">Error Reason</th>
                  <th className="py-3 px-4">Raw Staged Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(!batch.errors || batch.errors.length === 0) ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      Zero row-level errors recorded for this batch.
                    </td>
                  </tr>
                ) : (
                  (batch.errors || [])
                    .slice((Math.min(page, Math.max(1, Math.ceil((batch.errors?.length || 0) / limit))) - 1) * limit, Math.min(page, Math.max(1, Math.ceil((batch.errors?.length || 0) / limit))) * limit)
                    .map((err: any) => (
                    <tr key={err.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        Row {err.rowNumber}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {err.columnName || 'General'}
                      </td>
                      <td className="py-3 px-4 text-rose-600 font-semibold">
                        {err.errorMessage}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 max-w-xs truncate">
                        {err.rawRowData ? JSON.stringify(err.rawRowData) : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {batch.errors && batch.errors.length > 0 && (
            <Pagination
              currentPage={Math.min(page, Math.max(1, Math.ceil(batch.errors.length / limit)))}
              totalPages={Math.max(1, Math.ceil(batch.errors.length / limit))}
              totalItems={batch.errors.length}
              pageSize={limit}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setLimit(size);
                setPage(1);
              }}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
