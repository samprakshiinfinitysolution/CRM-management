"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Eye,
  Building,
  Phone,
  RotateCcw,
  UserCheck,
  CheckSquare,
  Square,
} from "lucide-react";
import type { LeadItem } from "@/types/api.types";
import { Pagination } from "@/components/ui/Pagination";
import { LeadStatusBadge, LeadPriorityBadge } from "./LeadBadges";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface LeadsDirectoryTableProps {
  leads: LeadItem[];
  isLoading: boolean;
  selectedLeadIds: string[];
  isTL: boolean;
  search: string;
  statusFilter: string;
  sourceFilter: string;
  pagination?: PaginationInfo;
  page: number;
  onPageChange: (page: number) => void;
  onToggleSelectLead: (id: string) => void;
  onToggleSelectAll: () => void;
  onTriggerSingleRecall?: (lead: LeadItem, e: React.MouseEvent) => void;
  onTriggerSingleReassign?: (lead: LeadItem, e: React.MouseEvent) => void;
}

export function LeadsDirectoryTable({
  leads,
  isLoading,
  selectedLeadIds,
  isTL,
  search,
  statusFilter,
  sourceFilter,
  pagination,
  page,
  onPageChange,
  onToggleSelectLead,
  onToggleSelectAll,
  onTriggerSingleRecall,
  onTriggerSingleReassign,
}: LeadsDirectoryTableProps) {
  const router = useRouter();

  const isAllSelected = selectedLeadIds.length === leads.length && leads.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 w-10 text-center">
                <button
                  type="button"
                  onClick={onToggleSelectAll}
                  className="p-1 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                  title={isAllSelected ? "Deselect all" : "Select all on page"}
                >
                  {isAllSelected ? (
                    <CheckSquare className="w-4 h-4 text-indigo-600" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="py-3 px-4">Lead Code</th>
              <th className="py-3 px-4">Customer Details</th>
              <th className="py-3 px-4">Requirement</th>
              <th className="py-3 px-4">Source</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Assigned To</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  Loading leads records...
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                    <Users className="w-8 h-8 stroke-[1.5]" />
                    <p className="text-sm font-semibold text-slate-600">
                      No leads found
                    </p>
                    <p className="text-xs text-slate-400">
                      {search ||
                      statusFilter !== "ALL" ||
                      sourceFilter !== "ALL"
                        ? "Try adjusting your search criteria or filter tags"
                        : "No leads currently registered in the database"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              leads.map((lead) => {
                const isSelected = selectedLeadIds.includes(lead.id);
                const isAssigned = Boolean(
                  lead.assignedTo || lead.status !== "NEW"
                );

                return (
                  <tr
                    key={lead.id}
                    onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
                    className={`hover:bg-indigo-50/40 cursor-pointer transition-colors ${
                      isSelected ? "bg-indigo-50/60" : ""
                    }`}
                  >
                    <td
                      className="py-3 px-4 w-10 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => onToggleSelectLead(lead.id)}
                        className="p-1 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                      {lead.leadCode}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">
                          {lead.customerName}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {lead.mobile}
                          </span>
                          {lead.companyName && (
                            <span className="flex items-center gap-1 truncate max-w-32">
                              <Building className="w-3 h-3 text-slate-400" />
                              {lead.companyName}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p
                        className="truncate font-medium text-slate-700"
                        title={lead.requirement}
                      >
                        {lead.requirement}
                      </p>
                      {lead.budget && (
                        <span className="text-[10px] text-slate-500 font-semibold">
                          ₹{Number(lead.budget).toLocaleString("en-IN")}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                        {lead.leadSource}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <LeadPriorityBadge priority={lead.priority} />
                    </td>
                    <td className="py-3 px-4">
                      <LeadStatusBadge status={lead.status} />
                    </td>
                    <td className="py-3 px-4">
                      {lead.assignedTo ? (
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">
                            {lead.assignedTo.name}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate max-w-28">
                            {lead.assignedTo.email}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td
                      className="py-3 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {isTL && onTriggerSingleReassign && (
                          <button
                            type="button"
                            onClick={(e) => onTriggerSingleReassign(lead, e)}
                            className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-all cursor-pointer"
                            title={
                              isAssigned ? "Reassign to another Executive" : "Assign Lead"
                            }
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        {isTL && isAssigned && onTriggerSingleRecall && (
                          <button
                            type="button"
                            onClick={(e) => onTriggerSingleRecall(lead, e)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                            title="Recall to unassigned pool"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/leads/${lead.id}`);
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-all cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {pagination && pagination.totalPages > 1 && (
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Showing page {pagination.page} of {pagination.totalPages} (
            {pagination.total} total leads)
          </span>
          <Pagination
            currentPage={page}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
