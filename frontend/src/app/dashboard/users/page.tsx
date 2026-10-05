"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, UserPlus, RefreshCw, Eye } from "lucide-react";
import { toast } from "sonner";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/types/api.types";
import { Pagination } from "@/components/ui/Pagination";
import {
  useGetSalesExecutivesQuery,
  useToggleExecutiveStatusMutation,
} from "@/store";
import { ExecutiveStatsCards } from "@/components/team_leader/executives";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { TableSkeletonRows } from "@/components/ui/TableSkeletonRows";

export default function UsersManagementPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const {
    data: execRes,
    isLoading,
    isFetching,
    refetch,
  } = useGetSalesExecutivesQuery();

  const [toggleStatus] = useToggleExecutiveStatusMutation();

  const executives = useMemo(() => execRes?.data || [], [execRes?.data]);

  const filteredExecutives = useMemo(() => {
    return executives.filter((exec) => {
      const matchesSearch =
        !search.trim() ||
        exec.name.toLowerCase().includes(search.toLowerCase()) ||
        exec.email.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && exec.isActive) ||
        (statusFilter === "inactive" && !exec.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [executives, search, statusFilter]);

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await toggleStatus({ id, isActive: !currentActive }).unwrap();
      toast.success(
        `Executive marked as ${!currentActive ? "active" : "inactive"}`,
      );
      refetch();
    } catch {
      toast.error("Failed to toggle status");
    }
  };

  return (
    <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER]}>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-600" />
              <span>Sales Staff & Users Directory</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage executive accounts, quota availability, and monitor
              performance
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-2xs transition-all"
              title="Refresh"
            >
              <RefreshCw
                className={`w-4 h-4 ${isFetching ? "animate-spin text-indigo-600" : ""}`}
              />
            </button>

            <Link
              href="/dashboard/users/create"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Staff Member</span>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <ExecutiveStatsCards executives={executives} />

        {/* Users Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search staff by name or email..."
              className="h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 max-w-sm w-full"
            />

            <div className="flex items-center gap-2">
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as "all" | "active" | "inactive")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Active Leads</th>
                  <th className="py-3 px-4">Won / Closed</th>
                  <th className="py-3 px-4">Overdue Rate</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <TableSkeletonRows columns={7} />
                ) : filteredExecutives.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-slate-400"
                    >
                      No staff members match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredExecutives
                    .slice(
                      (Math.min(
                        page,
                        Math.max(
                          1,
                          Math.ceil(filteredExecutives.length / limit),
                        ),
                      ) -
                        1) *
                        limit,
                      Math.min(
                        page,
                        Math.max(
                          1,
                          Math.ceil(filteredExecutives.length / limit),
                        ),
                      ) * limit,
                    )
                    .map((exec) => (
                      <tr
                        key={exec.id}
                        onClick={() =>
                          router.push(`/dashboard/users/${exec.id}`)
                        }
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                              {exec.name[0]}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-900">
                                {exec.name}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {exec.email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            {exec.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          {exec.activeLeads ?? 0}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-700">
                          {exec.convertedLeads ?? 0}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`font-semibold ${
                              (exec.followUpsOverdue ?? 0) > 0
                                ? "text-rose-600"
                                : "text-slate-500"
                            }`}
                          >
                            {exec.followUpsOverdue ?? 0} Overdue
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleActive(exec.id, exec.isActive);
                            }}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                              exec.isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                            }`}
                          >
                            {exec.isActive ? "ACTIVE" : "INACTIVE"}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/dashboard/users/${exec.id}`);
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-all"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>

          {!isLoading && filteredExecutives.length > 0 && (
            <Pagination
              currentPage={Math.min(
                page,
                Math.max(1, Math.ceil(filteredExecutives.length / limit)),
              )}
              totalPages={Math.max(
                1,
                Math.ceil(filteredExecutives.length / limit),
              )}
              totalItems={filteredExecutives.length}
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
