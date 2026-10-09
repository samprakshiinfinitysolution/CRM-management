"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileSpreadsheet,
  Plus,
  Eye,
  Download,
} from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { UserRole, type ImportBatchSummary } from "@/types/api.types";
import { Pagination } from "@/components/ui/Pagination";
import { useGetImportBatchesQuery } from "@/store";
import { TableSkeletonRows } from "@/components/ui/TableSkeletonRows";
import { downloadImportErrors } from "@/lib/exportUtils";

export default function ImportsHistoryPage() {
  const router = useRouter();
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const { data: batchesRes, isLoading } = useGetImportBatchesQuery();
  const batches = batchesRes?.data || [];

  return (
    <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER]}>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <UploadCloud className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <span>Excel Import History & Staged Batches</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Audit past spreadsheet uploads, inspect row-level validations, and
              monitor pool injections
            </p>
          </div>

          <Link
            href="/dashboard/imports/upload"
            className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Spreadsheet</span>
          </Link>
        </div>

        {/* Batches Table Card */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Batch ID & File</th>
                  <th className="py-3 px-4">Uploaded By</th>
                  <th className="py-3 px-4">Total Rows</th>
                  <th className="py-3 px-4">Imported</th>
                  <th className="py-3 px-4">Duplicates</th>
                  <th className="py-3 px-4">Failed Rows</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {isLoading ? (
                  <TableSkeletonRows columns={8} />
                ) : batches.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500">
                        <FileSpreadsheet className="w-8 h-8 stroke-[1.5]" />
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          No import batches found
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          Upload your first Excel or CSV lead list to populate
                          the unassigned pool.
                        </p>
                        <Link
                          href="/dashboard/imports/upload"
                          className="mt-2 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/60"
                        >
                          Upload Spreadsheet
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  batches
                    .slice(
                      (Math.min(
                        page,
                        Math.max(1, Math.ceil(batches.length / limit)),
                      ) -
                        1) *
                        limit,
                      Math.min(
                        page,
                        Math.max(1, Math.ceil(batches.length / limit)),
                      ) * limit,
                    )
                    .map((batch: ImportBatchSummary) => (
                      <tr
                        key={batch.id}
                        onClick={() =>
                          router.push(`/dashboard/imports/${batch.id}`)
                        }
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <FileSpreadsheet className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-xs">
                                {batch.fileName}
                              </span>
                              <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                                #{batch.id.slice(0, 8)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                          {batch.uploadedBy?.name || "System / Auto"}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                          {batch.totalRows}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {batch.importedCount}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                          {batch.duplicateCount}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-rose-600 dark:text-rose-400">
                          {batch.failedCount}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {new Date(batch.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {batch.failedCount > 0 && (
                              <button
                                type="button"
                                title="Download error logs (.xlsx)"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadImportErrors(
                                    batch.id,
                                    batch.fileName,
                                  );
                                }}
                                className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50/70 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-400 transition-colors inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span className="text-[11px] font-semibold">
                                  Errors
                                </span>
                              </button>
                            )}
                            <Link
                              href={`/dashboard/imports/${batch.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span className="text-[11px] font-semibold">
                                Inspect
                              </span>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>

          {batches.length > 0 && (
            <Pagination
              currentPage={Math.min(
                page,
                Math.max(1, Math.ceil(batches.length / limit)),
              )}
              totalPages={Math.max(1, Math.ceil(batches.length / limit))}
              totalItems={batches.length}
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
