"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileSpreadsheet,
  AlertTriangle,
  ShieldAlert,
  Download,
} from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/types/api.types";
import { Pagination } from "@/components/ui/Pagination";
import { useGetImportBatchByIdQuery } from "@/store";
import { downloadImportErrors } from "@/lib/exportUtils";

import { TableSkeletonRows } from "@/components/ui/TableSkeletonRows";

interface ImportErrorRow {
  id?: string;
  rowNumber?: number;
  row?: number;
  columnName?: string;
  field?: string;
  errorMessage?: string;
  message?: string;
  rawRowData?: Record<string, unknown>;
}

export default function ImportBatchDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [isExporting, setIsExporting] = useState(false);

  const { data: batchRes, isLoading, isError } = useGetImportBatchByIdQuery(id);
  const batch = batchRes?.data;

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER]}>
        <div className="space-y-6 animate-pulse">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-slate-200 border border-slate-200" />
              <div className="space-y-2">
                <div className="h-6 w-48 bg-slate-200 rounded-md" />
                <div className="h-3 w-64 bg-slate-200 rounded-sm" />
              </div>
            </div>
            <div className="h-9 w-48 bg-slate-200 rounded-lg self-start sm:self-auto" />
          </div>

          {/* Overview Stats Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-2"
              >
                <div className="h-3 w-20 bg-slate-200 rounded" />
                <div className="h-8 w-16 bg-slate-200 rounded-md" />
              </div>
            ))}
          </div>

          {/* Failed Row Breakdown Table Skeleton */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="h-4 w-52 bg-slate-200 rounded" />
              <div className="h-7 w-28 bg-slate-200 rounded-lg" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Row #</th>
                    <th className="py-3 px-4">Column / Field</th>
                    <th className="py-3 px-4">Error Reason</th>
                    <th className="py-3 px-4">Raw Staged Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <TableSkeletonRows rows={6} columns={4} />
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (isError || !batch) {
    return (
      <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER]}>
        <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-lg text-rose-700">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p className="font-semibold">
            Batch Not Found or Error Loading Details
          </p>
          <Link
            href="/dashboard/imports"
            className="text-xs underline mt-2 inline-block"
          >
            Back to Imports
          </Link>
        </div>
      </ProtectedRoute>
    );
  }

  const rawErrors = (batch.errors || []) as unknown as ImportErrorRow[];

  const handleDownloadErrors = async () => {
    setIsExporting(true);
    try {
      await downloadImportErrors(batch.id, batch.fileName);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/imports"
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                {batch.fileName}
              </h1>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Batch Code: {batch.batchCode || batch.id} · Uploaded{" "}
                {new Date(batch.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {rawErrors.length > 0 && (
            <button
              type="button"
              onClick={handleDownloadErrors}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>
                {isExporting ? "Generating..." : "Download Error Logs (.xlsx)"}
              </span>
            </button>
          )}
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Rows
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {batch.totalRows}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              Imported
            </p>
            <p className="text-2xl font-black text-emerald-700 mt-1">
              {batch.importedCount}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
              Duplicates
            </p>
            <p className="text-2xl font-black text-amber-700 mt-1">
              {batch.duplicateCount}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
            <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
              Failed Rows
            </p>
            <p className="text-2xl font-black text-rose-700 mt-1">
              {batch.failedCount}
            </p>
          </div>
        </div>

        {/* Failed Row Breakdown Table */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Validation & Ingestion Errors ({rawErrors.length})
            </h2>

            {rawErrors.length > 0 && (
              <button
                type="button"
                onClick={handleDownloadErrors}
                disabled={isExporting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export (.xlsx)</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Row #</th>
                  <th className="py-3 px-4">Column / Field</th>
                  <th className="py-3 px-4">Error Reason</th>
                  <th className="py-3 px-4">Raw Staged Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rawErrors.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      Zero row-level errors recorded for this batch.
                    </td>
                  </tr>
                ) : (
                  rawErrors
                    .slice(
                      (Math.min(
                        page,
                        Math.max(1, Math.ceil(rawErrors.length / limit)),
                      ) -
                        1) *
                        limit,
                      Math.min(
                        page,
                        Math.max(1, Math.ceil(rawErrors.length / limit)),
                      ) * limit,
                    )
                    .map((err, idx) => (
                      <tr
                        key={err.id || `err-${idx}`}
                        className="hover:bg-slate-50"
                      >
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                          Row {err.rowNumber || err.row || idx + 1}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">
                          {err.columnName || err.field || "General"}
                        </td>
                        <td className="py-3 px-4 text-rose-600 font-semibold">
                          {err.errorMessage ||
                            err.message ||
                            "Validation error"}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500 max-w-xs truncate">
                          {err.rawRowData
                            ? JSON.stringify(err.rawRowData)
                            : "-"}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>

          {rawErrors.length > 0 && (
            <Pagination
              currentPage={Math.min(
                page,
                Math.max(1, Math.ceil(rawErrors.length / limit)),
              )}
              totalPages={Math.max(1, Math.ceil(rawErrors.length / limit))}
              totalItems={rawErrors.length}
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
