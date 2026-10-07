import React from "react";

interface LeadStatusBadgeProps {
  status: string;
}

export function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  const getStatusClass = (val: string) => {
    switch (val) {
      case "NEW":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "ASSIGNED":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "CONTACTED":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "INTERESTED":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "FOLLOW_UP":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "QUALIFIED":
        return "bg-teal-50 text-teal-700 border-teal-200";
      case "WON_SOLD":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold";
      case "LOST":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${getStatusClass(
        status
      )}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

interface LeadPriorityBadgeProps {
  priority: string;
}

export function LeadPriorityBadge({ priority }: LeadPriorityBadgeProps) {
  const getPriorityClass = (val: string) => {
    switch (val) {
      case "URGENT":
        return "text-rose-700 bg-rose-50 border-rose-200 font-bold";
      case "HIGH":
        return "text-amber-700 bg-amber-50 border-amber-200";
      case "MEDIUM":
        return "text-blue-700 bg-blue-50 border-blue-200";
      default:
        return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getPriorityClass(
        priority
      )}`}
    >
      {priority}
    </span>
  );
}


