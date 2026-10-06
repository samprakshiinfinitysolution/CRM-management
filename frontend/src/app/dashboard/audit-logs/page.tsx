"use client";

import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  RefreshCw,
  Search,
  Filter,
  Eye,
  X,
  Copy,
  Check,
  Database,
} from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/types/api.types";
import { useGetAuditLogsQuery, type AuditLogItem } from "@/store";
import { Pagination } from "@/components/ui/Pagination";

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [entityFilter, setEntityFilter] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [copied, setCopied] = useState(false);

  // Debounced/applied query parameters
  const queryParams = useMemo(() => {
    return {
      page,
      limit,
      search: search.trim() || undefined,
      action: actionFilter !== "ALL" ? actionFilter : undefined,
      entityType: entityFilter !== "ALL" ? entityFilter : undefined,
    };
  }, [page, limit, search, actionFilter, entityFilter]);

  const {
    data: logsRes,
    isLoading,
    isFetching,
    refetch,
  } = useGetAuditLogsQuery(queryParams);

  const logs = logsRes?.data || [];
  const pagination = logsRes?.pagination;

  const handleCopyPayload = (data: unknown) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getActionBadgeClass = (action: string) => {
    switch (action) {
      case "CREATE":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "STATUS_CHANGE":
      case "STATUS_UPDATE":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "ASSIGN":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "REASSIGN":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "RECALL":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "DELETE":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "EXPORT":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";
      case "IMPORT_PREVIEW":
      case "IMPORT_COMMIT":
        return "bg-teal-50 text-teal-700 border-teal-200";
      case "LOGIN":
      case "LOGOUT":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "PASSWORD_CHANGE":
        return "bg-violet-50 text-violet-700 border-violet-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

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
              Immutable, server-authoritative audit trail of sensitive
              mutations, imports, exports, and status transitions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-blue-600" : ""}`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by actor name, email, or entity ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Action Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium cursor-pointer"
            >
              <option value="ALL">All Actions</option>
              <option value="CREATE">CREATE</option>
              <option value="STATUS_CHANGE">STATUS_CHANGE</option>
              <option value="ASSIGN">ASSIGN</option>
              <option value="REASSIGN">REASSIGN</option>
              <option value="RECALL">RECALL</option>
              <option value="IMPORT_PREVIEW">IMPORT_PREVIEW</option>
              <option value="IMPORT_COMMIT">IMPORT_COMMIT</option>
              <option value="EXPORT">EXPORT</option>
              <option value="LOGIN">LOGIN</option>
              <option value="LOGOUT">LOGOUT</option>
              <option value="PASSWORD_CHANGE">PASSWORD_CHANGE</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          {/* Entity Filter */}
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={entityFilter}
              onChange={(e) => {
                setEntityFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium cursor-pointer"
            >
              <option value="ALL">All Entities</option>
              <option value="Lead">Lead</option>
              <option value="FollowUp">FollowUp</option>
              <option value="User">User</option>
              <option value="ImportBatch">ImportBatch</option>
            </select>
          </div>

          {/* Reset button */}
          {(search || actionFilter !== "ALL" || entityFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActionFilter("ALL");
                setEntityFilter("ALL");
                setPage(1);
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2 py-1.5 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        {/* Audit Table Card */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`skel-${i}`} className="animate-pulse">
                      <td className="py-3.5 px-4">
                        <div className="h-3.5 bg-slate-100 rounded w-28" />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="h-3.5 bg-slate-100 rounded w-24" />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="h-3.5 bg-slate-100 rounded w-32" />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="h-3.5 bg-slate-100 rounded w-20" />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="h-3.5 bg-slate-100 rounded w-20" />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="h-3.5 bg-slate-100 rounded w-12 ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                        <ShieldCheck className="w-8 h-8 stroke-[1.5]" />
                        <p className="text-sm font-semibold text-slate-700">
                          No audit events match your filters
                        </p>
                        <p className="text-xs text-slate-400">
                          Try adjusting the search query, action filter, or date
                          range.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.map((log: AuditLogItem) => (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                            {log.actor?.name ? log.actor.name[0] : "S"}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900">
                              {log.actor?.name || "System / Auto"}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {log.actor?.role === "SALES_EXECUTIVE"
                                ? "SE"
                                : log.actor?.role === "TEAM_LEADER"
                                  ? "TL"
                                  : log.actor?.role || "SYSTEM"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded font-mono text-[10px] font-semibold border ${getActionBadgeClass(
                            log.action,
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                          <span className="text-[11px] text-slate-600">
                            {log.entityType}
                          </span>
                          {log.entityId && (
                            <span className="font-mono text-[10px] text-slate-400">
                              #{log.entityId.slice(0, 8)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                        {log.ipAddress || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {log.oldValue || log.newValue ? (
                          <button
                            type="button"
                            onClick={() => setSelectedLog(log)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-blue-600 bg-blue-50/80 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-300">—</span>
                        )}
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

        {/* Payload Inspector Modal */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        Audit Log Details
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold border ${getActionBadgeClass(selectedLog.action)}`}
                      >
                        {selectedLog.action}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Log #{selectedLog.id.slice(0, 8)} •{" "}
                      {new Date(selectedLog.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Metadata Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 py-3 bg-slate-50/80 border-b border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Actor
                  </span>
                  <span className="font-medium text-slate-800">
                    {selectedLog.actor?.name || "System / Auto"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Entity Type
                  </span>
                  <span className="font-medium text-slate-800">
                    {selectedLog.entityType}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Entity ID
                  </span>
                  <span className="font-mono text-slate-700 text-[11px]">
                    {selectedLog.entityId || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    IP Address
                  </span>
                  <span className="font-mono text-slate-700 text-[11px]">
                    {selectedLog.ipAddress || "—"}
                  </span>
                </div>
              </div>

              {/* Payload Comparison / Content */}
              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                {selectedLog.oldValue && selectedLog.newValue ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Old Value */}
                    <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50">
                      <div className="flex items-center justify-between px-3 py-2 bg-slate-100 border-b border-slate-200 text-xs font-semibold text-slate-700">
                        <span>Previous State (Before)</span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyPayload(selectedLog.oldValue)
                          }
                          className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                        >
                          {copied ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>Copy</span>
                        </button>
                      </div>
                      <pre className="p-3 text-[11px] font-mono text-slate-700 overflow-x-auto max-h-72">
                        {JSON.stringify(selectedLog.oldValue, null, 2)}
                      </pre>
                    </div>

                    {/* New Value */}
                    <div className="border border-blue-200 rounded-lg overflow-hidden bg-blue-50/20">
                      <div className="flex items-center justify-between px-3 py-2 bg-blue-50 border-b border-blue-200 text-xs font-semibold text-blue-900">
                        <span>New State (After)</span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyPayload(selectedLog.newValue)
                          }
                          className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                        >
                          {copied ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>Copy</span>
                        </button>
                      </div>
                      <pre className="p-3 text-[11px] font-mono text-slate-800 overflow-x-auto max-h-72">
                        {JSON.stringify(selectedLog.newValue, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50">
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-100 border-b border-slate-200 text-xs font-semibold text-slate-700">
                      <span>Event Payload</span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyPayload(
                            selectedLog.newValue || selectedLog.oldValue,
                          )
                        }
                        className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                      >
                        {copied ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>Copy</span>
                      </button>
                    </div>
                    <pre className="p-3 text-[11px] font-mono text-slate-700 overflow-x-auto max-h-80">
                      {JSON.stringify(
                        selectedLog.newValue || selectedLog.oldValue,
                        null,
                        2,
                      )}
                    </pre>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
