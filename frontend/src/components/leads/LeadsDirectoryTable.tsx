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
  MoreVertical,
} from "lucide-react";
import type { LeadItem } from "@/types/api.types";
import { Pagination } from "@/components/ui/Pagination";
import { TableSkeletonRows } from "../ui/TableSkeletonRows";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

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
  onPageSizeChange?: (pageSize: number) => void;
  limit?: number;
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
  onPageSizeChange,
  limit,
  onToggleSelectLead,
  onToggleSelectAll,
  onTriggerSingleRecall,
  onTriggerSingleReassign,
}: LeadsDirectoryTableProps) {
  const router = useRouter();

  const isAllSelected =
    selectedLeadIds.length === leads.length && leads.length > 0;

  return (
    <div className="bg-white rounded-lg border border-slate-200/80 shadow-xs overflow-hidden">
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
              <TableSkeletonRows />
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
                  lead.assignedTo || lead.status !== "NEW",
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
                        className="truncate font-medium text-accent-foreground/80"
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
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-accent-foreground/80 text-[10px] font-semibold">
                        {lead.leadSource}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {/* <LeadPriorityBadge priority={lead.priority} /> */}
                      <span className="px-2 py-0.5 rounded-md text-accent-foreground/80 text-[10px] font-semibold">
                        {lead.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md text-accent-foreground/80 text-[10px] font-semibold">
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {lead.assignedTo ? (
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">
                            {lead.assignedTo.name}
                          </span>
                          <span className="text-[10px] text-accent-foreground/80 truncate max-w-28">
                            {lead.assignedTo.email}
                          </span>
                        </div>
                      ) : (
                        <span className="text-accent-foreground/80 italic">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td
                      className="py-3 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                            title="Lead actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="min-w-40 p-1 bg-white border border-slate-200 shadow-lg rounded-lg">
                            <DropdownMenuGroup>
                              {isTL && onTriggerSingleReassign && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onTriggerSingleReassign(lead, e);
                                  }}
                                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 rounded-md cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 focus:bg-indigo-50 focus:text-indigo-600 transition-colors"
                                >
                                  <UserCheck className="w-4 h-4 text-indigo-500" />
                                  <span>{isAssigned ? "Reassign Lead" : "Assign Lead"}</span>
                                </DropdownMenuItem>
                              )}

                              {isTL && isAssigned && onTriggerSingleRecall && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onTriggerSingleRecall(lead, e);
                                  }}
                                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 rounded-md cursor-pointer hover:bg-rose-50 hover:text-rose-700 focus:bg-rose-50 focus:text-rose-700 transition-colors"
                                >
                                  <RotateCcw className="w-4 h-4 text-rose-500" />
                                  <span>Recall to Pool</span>
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/dashboard/leads/${lead.id}`);
                                }}
                                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 rounded-md cursor-pointer hover:bg-slate-100 hover:text-slate-900 focus:bg-slate-100 focus:text-slate-900 transition-colors"
                              >
                                <Eye className="w-4 h-4 text-slate-500" />
                                <span>View Details</span>
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
            onPageSizeChange={onPageSizeChange}
            pageSize={limit}
            pageSizeOptions={[10, 20, 50, 100]}
          />
        </div>
      )}
    </div>
  );
}
