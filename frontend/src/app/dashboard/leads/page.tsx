'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Plus,
  GitFork,
  UploadCloud,
  Search,
  Eye,
  Building,
  Phone,
} from 'lucide-react';
import { useGetLeadsQuery, useAppSelector } from '@/store';
import { UserRole, LeadStatus } from '@/types/api.types';
import { Pagination } from '@/components/ui/Pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function LeadsListPage() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const isTL = user?.role === UserRole.TEAM_LEADER;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: leadsResponse, isLoading } = useGetLeadsQuery({
    search: search.trim() || undefined,
    status: statusFilter !== 'ALL' ? (statusFilter as LeadStatus) : undefined,
    source: sourceFilter !== 'ALL' ? sourceFilter : undefined,
    page,
    limit,
  });

  const leads = leadsResponse?.data || [];
  const pagination = leadsResponse?.pagination;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ASSIGNED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'CONTACTED':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'INTERESTED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'FOLLOW_UP':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'QUALIFIED':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'WON_SOLD':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
      case 'LOST':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'text-rose-700 bg-rose-50 border-rose-200 font-bold';
      case 'HIGH':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'MEDIUM':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>Lead Directory</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isTL
              ? 'Complete overview of unassigned pool, active pipelines, and converted leads'
              : 'Review your assigned customer inquiries and track deal progress'}
          </p>
        </div>

        {isTL && (
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard/leads/create"
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Lead</span>
            </Link>

            <Link
              href="/dashboard/distributions/create"
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <GitFork className="w-4 h-4" />
              <span>Distribute</span>
            </Link>

            <Link
              href="/dashboard/imports/upload"
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-slate-500" />
              <span>Import Sheet</span>
            </Link>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by customer name, mobile, email, lead code or company..."
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val || 'ALL');
              setPage(1);
            }}
          >
            <SelectTrigger className="h-10 px-3 min-w-[155px] rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="border border-slate-200 bg-white shadow-md">
              <SelectItem value="ALL" className="text-xs cursor-pointer">
                All Statuses
              </SelectItem>
              <SelectItem value="NEW" className="text-xs cursor-pointer">
                New (Unassigned)
              </SelectItem>
              <SelectItem value="ASSIGNED" className="text-xs cursor-pointer">
                Assigned
              </SelectItem>
              <SelectItem value="CONTACTED" className="text-xs cursor-pointer">
                Contacted
              </SelectItem>
              <SelectItem value="INTERESTED" className="text-xs cursor-pointer">
                Interested
              </SelectItem>
              <SelectItem value="FOLLOW_UP" className="text-xs cursor-pointer">
                In Follow-Up
              </SelectItem>
              <SelectItem value="QUALIFIED" className="text-xs cursor-pointer">
                Qualified
              </SelectItem>
              <SelectItem value="WON_SOLD" className="text-xs cursor-pointer">
                Won / Sold
              </SelectItem>
              <SelectItem value="LOST" className="text-xs cursor-pointer">
                Lost
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Source Filter */}
          <Select
            value={sourceFilter}
            onValueChange={(val) => {
              setSourceFilter(val || 'ALL');
              setPage(1);
            }}
          >
            <SelectTrigger className="h-10 px-3 min-w-[140px] rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all">
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent className="border border-slate-200 bg-white shadow-md">
              <SelectItem value="ALL" className="text-xs cursor-pointer">
                All Sources
              </SelectItem>
              <SelectItem value="Website" className="text-xs cursor-pointer">
                Website
              </SelectItem>
              <SelectItem value="Campaign" className="text-xs cursor-pointer">
                Campaign
              </SelectItem>
              <SelectItem value="Referral" className="text-xs cursor-pointer">
                Referral
              </SelectItem>
              <SelectItem value="Cold Call" className="text-xs cursor-pointer">
                Cold Call
              </SelectItem>
              <SelectItem value="Direct" className="text-xs cursor-pointer">
                Direct
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
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
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading leads records...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                      <Users className="w-8 h-8 stroke-[1.5]" />
                      <p className="text-sm font-semibold text-slate-600">No leads found</p>
                      <p className="text-xs text-slate-400">
                        {search || statusFilter !== 'ALL' || sourceFilter !== 'ALL'
                          ? 'Try adjusting your search criteria or filter tags'
                          : 'No leads currently registered in the database'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
                    className="hover:bg-indigo-50/40 cursor-pointer transition-colors"
                  >
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
                      <p className="truncate font-medium text-slate-700" title={lead.requirement}>
                        {lead.requirement}
                      </p>
                      {lead.budget && (
                        <span className="text-[10px] text-slate-500 font-semibold">
                          ₹{Number(lead.budget).toLocaleString('en-IN')}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                        {lead.leadSource || 'Direct'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] border ${getPriorityColor(
                          lead.priority
                        )}`}
                      >
                        {lead.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusColor(
                          lead.status
                        )}`}
                      >
                        {lead.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {lead.assignedTo ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                            {lead.assignedTo.name[0]}
                          </div>
                          <span className="font-medium text-slate-800 truncate max-w-28">
                            {lead.assignedTo.name}
                          </span>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          UNASSIGNED
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/leads/${lead.id}`);
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-all"
                        title="View Details"
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

        {/* Pagination Bar */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total leads)
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
  );
}
