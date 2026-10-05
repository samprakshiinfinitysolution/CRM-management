"use client";

import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LeadFiltersToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  sourceFilter: string;
  onSourceFilterChange: (val: string) => void;
}

export function LeadFiltersToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sourceFilter,
  onSourceFilterChange,
}: LeadFiltersToolbarProps) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
      {/* Search Input */}
      <div className="relative flex-1 w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by customer name, mobile, email, lead code or company..."
          className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
        />
      </div>

      {/* Filter Selects */}
      <div className="flex items-center gap-2 w-full md:w-auto">
        {/* Status Filter */}
        <Select
          value={statusFilter}
          onValueChange={(val) => onStatusFilterChange(val || "ALL")}
        >
          <SelectTrigger className="h-10 px-3 min-w-38.75 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent className="border border-slate-200 bg-white shadow-md">
            <SelectItem value="ALL" className="text-xs cursor-pointer">
              All Statuses
            </SelectItem>
            <SelectItem value="NEW" className="text-xs cursor-pointer">
              New
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
              Follow Up
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
          onValueChange={(val) => onSourceFilterChange(val || "ALL")}
        >
          <SelectTrigger className="h-10 px-3 min-w-36 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all">
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent className="border border-slate-200 bg-white shadow-md">
            <SelectItem value="ALL" className="text-xs cursor-pointer">
              All Sources
            </SelectItem>
            <SelectItem value="Website" className="text-xs cursor-pointer">
              Website
            </SelectItem>
            <SelectItem value="Facebook" className="text-xs cursor-pointer">
              Facebook
            </SelectItem>
            <SelectItem value="Google Ads" className="text-xs cursor-pointer">
              Google Ads
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
  );
}
