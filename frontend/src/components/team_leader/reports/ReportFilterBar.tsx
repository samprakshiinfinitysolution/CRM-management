"use client";

import React from "react";
import { Calendar, Users, Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReportFilterBarProps {
  timeRange: string;
  setTimeRange: (range: string) => void;
  selectedExecutive: string;
  setSelectedExecutive: (id: string) => void;
  selectedSource: string;
  setSelectedSource: (source: string) => void;
  executivesList: Array<{ id: string; name: string }>;
}

export const ReportFilterBar: React.FC<ReportFilterBarProps> = ({
  timeRange,
  setTimeRange,
  selectedExecutive,
  setSelectedExecutive,
  selectedSource,
  setSelectedSource,
  executivesList,
}) => {
  const timePresets = [
    { label: "Today", value: "today" },
    { label: "Last 7 Days", value: "7d" },
    { label: "Last 30 Days", value: "30d" },
    { label: "This Quarter", value: "quarter" },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.03] border border-brand-primary/30 backdrop-blur-md">
      {/* Date Presets */}
      <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-xl border border-brand-primary/20">
        <Calendar className="w-4 h-4 text-brand-primary/70 ml-2 mr-1" />
        {timePresets.map((preset) => (
          <button
            key={preset.value}
            onClick={() => setTimeRange(preset.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              timeRange === preset.value
                ? "bg-blue-600 text-white shadow-md"
                : "text-hover"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Dropdown Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Executive Filter */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5">
          {/*<Users className="w-3.5 h-3.5 text-brand-primary/70" />*/}

          <Select>
            <SelectTrigger className={"button-effect"}>
              <Users className="w-3.5 h-3.5 text-brand-primary/70" />
              <SelectValue placeholder="Select an executive" />
            </SelectTrigger>
            {/*<ChevronDown className="w-4 h-4" />*/}

            <SelectContent className={"border left-0 border-brand-primary/20"}>
              {executivesList.map((exec) => (
                <SelectItem
                  key={exec.id}
                  value={exec.name}
                  className={
                    "border-b border-brand-primary/18 px-2 py-1 hover:bg-crm-brand-subtle! cursor-pointer"
                  }
                >
                  {exec.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Source Filter */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
          <Globe className="w-3.5 h-3.5 text-hover" />
          <Select
            value={selectedSource}
            //onChange={(e) => setSelectedSource(e.target.value)}
            onValueChange={(value) => setSelectedSource(value || "ALL")}
            aria-label="Filter by lead source"
          >
            <SelectTrigger className={"button-effect"}>
              <SelectValue placeholder="Select a lead source" />
            </SelectTrigger>
            <SelectContent className={"border border-brand-primary/20"}>
              {["ALL", "WEBSITE", "CAMPAIGN", "REFERRAL", "EXCEL_IMPORT"].map(
                (source) => (
                  <SelectItem
                    key={source}
                    value={source}
                    className={
                      "border-b border-brand-primary/18 px-2 py-1 hover:bg-crm-brand-subtle! cursor-pointer"
                    }
                  >
                    {source}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
