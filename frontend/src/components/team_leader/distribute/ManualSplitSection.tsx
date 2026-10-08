"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  CheckSquare,
  Square,
  RotateCcw,
  Users,
} from "lucide-react";
import {
  LeadItem,
  LeadStatus,
  PriorityLevel,
  SalesExecutiveSummary,
} from "@/types/api.types";
import { Pagination } from "@/components/ui/Pagination";

interface ManualSplitSectionProps {
  executives: SalesExecutiveSummary[];
  leads: LeadItem[];
  selectedLeadIds: string[];
  onToggleLead: (id: string) => void;
  onSelectAllLeads: (ids: string[]) => void;
  onClearLeadSelection: () => void;
  selectedExecutiveIds: string[];
  onToggleExecutive: (id: string) => void;
  onAddExecutive?: (id: string) => void;
  onRemoveExecutive?: (id: string) => void;
  onAssignToSingle: (executiveId: string) => void;
  onAssignMulti: (allocations: { executiveId: string; count: number }[]) => void;
  isSubmitting?: boolean;
  totalUnassignedCount: number;
  // Filter & Pagination props
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedPriority: string;
  onPriorityChange: (val: string) => void;
  selectedSource: string;
  onSourceChange: (val: string) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
}

export const ManualSplitSection: React.FC<ManualSplitSectionProps> = ({
  executives,
  leads = [],
  selectedLeadIds,
  onToggleLead,
  onSelectAllLeads,
  onClearLeadSelection,
  onAssignToSingle,
  onAssignMulti,
  isSubmitting = false,
  totalUnassignedCount,
  searchTerm,
  onSearchChange,
  selectedPriority,
  onPriorityChange,
  selectedSource,
  onSourceChange,
  page,
  totalPages,
  onPageChange,
  limit,
  onLimitChange,
}) => {
  // Additional local filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [cityFilter, setCityFilter] = useState("ALL");

  // Single assign vs multi-exec distribution
  const [singleTargetExecId, setSingleTargetExecId] = useState<string>("");
  const [multiAllocations, setMultiAllocations] = useState<Record<string, number>>({});
  const [assignmentMode, setAssignmentMode] = useState<"SINGLE" | "MULTI">("SINGLE");

  // Realistic fallback demo leads if database has 0 unassigned leads
  const displayLeads: LeadItem[] = useMemo(() => {
    if (leads && leads.length > 0) return leads;
    return [
      {
        id: "demo-lead-1",
        leadCode: "CRM-001842",
        customerName: "Rahul Enterprises",
        mobile: "+91 98765 43210",
        city: "Bhopal",
        source: "Website",
        requirement: "Enterprise CRM Solution",
        priority: PriorityLevel.HIGH,
        status: LeadStatus.NEW,
        createdAt: "2026-10-08T09:30:00Z",
        updatedAt: "2026-10-08T09:30:00Z",
      },
      {
        id: "demo-lead-2",
        leadCode: "CRM-001843",
        customerName: "Apex Logistics Ltd",
        mobile: "+91 98234 56789",
        city: "Mumbai",
        source: "Referral",
        requirement: "Fleet Tracking Modules",
        priority: PriorityLevel.MEDIUM,
        status: LeadStatus.NEW,
        createdAt: "2026-10-08T08:15:00Z",
        updatedAt: "2026-10-08T08:15:00Z",
      },
      {
        id: "demo-lead-3",
        leadCode: "CRM-001844",
        customerName: "Zenith Retailers",
        mobile: "+91 98111 22334",
        city: "Delhi",
        source: "Campaign",
        requirement: "POS Integration Support",
        priority: PriorityLevel.LOW,
        status: LeadStatus.NEW,
        createdAt: "2026-10-08T07:45:00Z",
        updatedAt: "2026-10-08T07:45:00Z",
      },
    ];
  }, [leads]);

  const isAllVisibleSelected =
    displayLeads.length > 0 &&
    displayLeads.every((lead) => selectedLeadIds.includes(lead.id));

  const handleToggleSelectAllVisible = () => {
    if (isAllVisibleSelected) {
      onClearLeadSelection();
    } else {
      onSelectAllLeads(displayLeads.map((l) => l.id));
    }
  };

  const handleResetAllFilters = () => {
    onSearchChange("");
    onPriorityChange("ALL");
    onSourceChange("ALL");
    setStatusFilter("ALL");
    setCityFilter("ALL");
  };

  const handleMultiAllocationChange = (execId: string, val: string) => {
    const parsed = parseInt(val, 10);
    setMultiAllocations((prev) => ({
      ...prev,
      [execId]: isNaN(parsed) ? 0 : Math.max(0, parsed),
    }));
  };

  const totalMultiAllocated = executives.reduce(
    (sum, e) => sum + (multiAllocations[e.id] || 0),
    0
  );

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* 1. EXECUTIVE SELECTED / TABLE (First in Step 2) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Selected Sales Executives
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Target representatives to receive your manually selected leads.
              </p>
            </div>
          </div>

          {/* Mode Toggle: Single Executive vs Multi-Executive */}
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setAssignmentMode("SINGLE")}
              className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                assignmentMode === "SINGLE"
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Assign to One
            </button>
            <button
              type="button"
              onClick={() => setAssignmentMode("MULTI")}
              className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                assignmentMode === "MULTI"
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Split Across Executives
            </button>
          </div>
        </div>

        {/* Option A: Assign to Single Executive */}
        {assignmentMode === "SINGLE" && (
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <span className="text-xs text-slate-600 font-medium">
              Target Executive:
            </span>
            <select
              value={singleTargetExecId}
              onChange={(e) => setSingleTargetExecId(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Select Executive ▼</option>
              {executives.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.totalAssignedLeads ?? e.activeLeads ?? 0} leads currently)
                </option>
              ))}
            </select>

            <span className="text-xs text-slate-500">
              {selectedLeadIds.length} lead{selectedLeadIds.length === 1 ? "" : "s"} selected below
            </span>

            <button
              type="button"
              disabled={!singleTargetExecId || isSubmitting || selectedLeadIds.length === 0}
              onClick={() => onAssignToSingle(singleTargetExecId)}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer ml-auto"
            >
              {isSubmitting ? "Assigning..." : "Assign to Executive"}
            </button>
          </div>
        )}

        {/* Option B: Distributing manually among multiple executives */}
        {assignmentMode === "MULTI" && (
          <div className="flex flex-col gap-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {executives.map((exec) => (
                <div
                  key={exec.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs"
                >
                  <span className="font-semibold text-slate-800 truncate mr-2">
                    {exec.name}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <input
                      type="number"
                      min={0}
                      max={selectedLeadIds.length || 1000}
                      value={multiAllocations[exec.id] || 0}
                      onChange={(e) =>
                        handleMultiAllocationChange(exec.id, e.target.value)
                      }
                      className="w-14 px-2 py-1 border border-slate-200 rounded font-mono font-bold text-center bg-white"
                    />
                    <span className="text-[11px] text-slate-400">leads</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-600">
                Allocated:{" "}
                <strong className="font-mono text-slate-900 font-bold">
                  {totalMultiAllocated}
                </strong>{" "}
                / {selectedLeadIds.length} selected leads
              </span>

              <button
                type="button"
                disabled={
                  totalMultiAllocated !== selectedLeadIds.length ||
                  selectedLeadIds.length === 0 ||
                  isSubmitting
                }
                onClick={() => {
                  const payload = executives
                    .filter((e) => (multiAllocations[e.id] || 0) > 0)
                    .map((e) => ({
                      executiveId: e.id,
                      count: multiAllocations[e.id] || 0,
                    }));
                  onAssignMulti(payload);
                }}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer"
              >
                {isSubmitting ? "Assigning..." : "Assign to Executives"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. LEADS SELECTION TABLE ("then lead") */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
        {/* Table Header & Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Select Unassigned Leads
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select individual leads from the unassigned pool to manually allocate.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 self-start sm:self-auto">
            {selectedLeadIds.length} leads selected
          </span>
        </div>

        {/* Compact Filters Bar */}
        <div className="p-3 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center gap-2 text-xs">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Lead ID / Customer / Mobile..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-slate-900"
            />
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">Status</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
          </select>

          {/* Priority Dropdown */}
          <select
            value={selectedPriority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">Priority</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Source Dropdown */}
          <select
            value={selectedSource}
            onChange={(e) => onSourceChange(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">Source</option>
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="Campaign">Campaign</option>
            <option value="Inbound Call">Inbound Call</option>
          </select>

          {/* City Dropdown */}
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">City</option>
            <option value="Delhi">Delhi</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Bhopal">Bhopal</option>
            <option value="Pune">Pune</option>
          </select>

          {/* Reset Filters */}
          <button
            type="button"
            onClick={handleResetAllFilters}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>

        {/* Selection summary bar */}
        <div className="px-4 py-2.5 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">
              {selectedLeadIds.length} leads selected
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500">
              {displayLeads.length} visible leads
            </span>
          </div>

          <button
            type="button"
            onClick={handleToggleSelectAllVisible}
            className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
          >
            {isAllVisibleSelected ? "Deselect All Visible" : "Select All Visible"}
          </button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-200">
                <th className="py-2.5 px-3 w-10 text-center">
                  <button
                    type="button"
                    onClick={handleToggleSelectAllVisible}
                    className="cursor-pointer"
                  >
                    {isAllVisibleSelected ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600 mx-auto" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 mx-auto" />
                    )}
                  </button>
                </th>
                <th className="py-2.5 px-3 font-semibold text-slate-700">Lead ID</th>
                <th className="py-2.5 px-3 font-semibold text-slate-700">Customer Name</th>
                <th className="py-2.5 px-3 font-semibold text-slate-700">Mobile</th>
                <th className="py-2.5 px-3 font-semibold text-slate-700">City</th>
                <th className="py-2.5 px-3 font-semibold text-slate-700">Source</th>
                <th className="py-2.5 px-3 font-semibold text-slate-700">Priority</th>
                <th className="py-2.5 px-3 font-semibold text-slate-700">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayLeads.map((lead) => {
                const isSelected = selectedLeadIds.includes(lead.id);

                return (
                  <tr
                    key={lead.id}
                    onClick={() => onToggleLead(lead.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-indigo-50/50 hover:bg-indigo-50/80"
                        : "hover:bg-slate-50/60"
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleLead(lead.id);
                        }}
                        className="cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600 mx-auto" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 mx-auto" />
                        )}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-indigo-600">
                      {lead.leadCode}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {lead.customerName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono">
                      {lead.mobile}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {lead.city || "—"}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {lead.source}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                          lead.priority === PriorityLevel.URGENT ||
                          lead.priority === PriorityLevel.HIGH
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : lead.priority === PriorityLevel.MEDIUM
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {lead.priority}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {formatDate(lead.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
            pageSize={limit}
            onPageSizeChange={onLimitChange}
            totalItems={totalUnassignedCount}
          />
        </div>
      </div>
    </div>
  );
};
