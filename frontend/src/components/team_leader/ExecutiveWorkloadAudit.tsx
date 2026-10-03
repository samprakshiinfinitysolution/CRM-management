"use client";

import React from "react";
import { ArrowRightLeft, BellRing, PlusCircle, Users } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { TLDashboardExecutiveWorkload } from "@/types/api.types";

interface ExecutiveWorkloadAuditProps {
  executives?: TLDashboardExecutiveWorkload[];
  isLoading?: boolean;
}

export default function ExecutiveWorkloadAudit({
  executives,
  isLoading,
}: ExecutiveWorkloadAuditProps) {
  const router = useRouter();

  const handleAction = (rep: TLDashboardExecutiveWorkload) => {
    if (rep.actionType === "assign") {
      router.push("/team_leader/distribute");
    } else if (rep.actionType === "nudge") {
      toast.info(
        `Sent SLA follow-up reminder to ${rep.name} for ${rep.overdueCount} overdue leads`,
      );
    } else {
      router.push("/team_leader/sales_executives");
    }
  };

  if (isLoading) {
    return (
      <section className="py-2">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 w-44 bg-crm-muted animate-pulse rounded"></div>
          <div className="h-3 w-20 bg-crm-muted animate-pulse rounded"></div>
        </div>
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-crm-card p-4 rounded-2xl border border-crm-subtle h-36 animate-pulse"
            ></div>
          ))}
        </div>
      </section>
    );
  }

  const reps = executives || [];

  return (
    <section className="py-2">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-bold text-crm-primary">
            Executive Workload & SLA
          </h2>
          <p className="text-xs text-crm-muted">
            Live quota, capacity and task bottlenecks
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/team_leader/sales_executives")}
          className="text-xs font-semibold text-crm-brand hover:underline cursor-pointer"
        >
          View {reps.length} Reps
        </button>
      </div>

      {reps.length === 0 ? (
        <div className="bg-crm-card p-6 rounded-2xl border border-crm-subtle text-center text-xs text-crm-muted">
          <Users className="w-8 h-8 text-crm-muted mx-auto mb-2 opacity-50" />
          <p className="font-semibold">No sales executives found</p>
          <p className="mt-1">
            Add sales executives to start assigning and managing leads.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reps.map((rep) => {
            const initials = rep.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <div
                key={rep.id}
                className="bg-crm-card p-4 rounded-2xl border border-crm-subtle shadow-xs flex flex-col hover:border-slate-300 transition-colors"
              >
                {/* Header info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 border border-indigo-200 shadow-2xs">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-bold text-crm-primary truncate">
                          {rep.name}
                        </span>
                        {rep.isOnline && (
                          <span
                            className="w-2 h-2 rounded-full bg-emerald-500"
                            title="Online"
                          />
                        )}
                        {rep.roleBadge && (
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${
                              rep.capacityWarning
                                ? "bg-crm-danger text-crm-danger"
                                : "bg-crm-warning text-crm-warning"
                            }`}
                          >
                            {rep.roleBadge}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-xs font-medium block truncate ${
                          rep.capacityWarning
                            ? "text-crm-danger"
                            : rep.isStatusPositive
                              ? "text-crm-success"
                              : "text-crm-muted"
                        }`}
                      >
                        {rep.statusText}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-crm-primary">
                      {rep.formattedWonAmount || `₹${rep.wonAmount}`}
                    </div>
                    <span className="text-[10px] font-bold text-crm-muted uppercase tracking-wider">
                      WON {rep.wonCount ? `(${rep.wonCount})` : ""}
                    </span>
                  </div>
                </div>

                {/* Metrics Ribbon */}
                <div className="grid grid-cols-3 gap-2 my-3 py-2 px-3 bg-crm-subtle rounded-xl text-center text-xs border border-crm-subtle">
                  <div>
                    <div
                      className={`font-bold ${
                        rep.capacityWarning
                          ? "text-crm-danger"
                          : "text-crm-primary"
                      }`}
                    >
                      {rep.activeCount}
                    </div>
                    <div className="text-[10px] font-semibold text-crm-muted uppercase tracking-wider">
                      {rep.capacityWarning ? "LOAD MAX" : "ACTIVE"}
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-crm-primary">
                      {rep.dueTodayCount}
                    </div>
                    <div className="text-[10px] font-semibold text-crm-muted uppercase tracking-wider">
                      DUE TODAY
                    </div>
                  </div>
                  <div>
                    <div
                      className={`font-bold ${
                        rep.overdueCount > 0
                          ? "text-crm-danger"
                          : "text-crm-success"
                      }`}
                    >
                      {rep.overdueCount > 0 ? `${rep.overdueCount} ⚠️` : "0"}
                    </div>
                    <div className="text-[10px] font-semibold text-crm-muted uppercase tracking-wider">
                      OVERDUE
                    </div>
                  </div>
                </div>

                {/* SLA Progress Bar & Action Button */}
                <div className="flex items-center justify-between text-xs text-crm-muted pt-1">
                  <div className="flex items-center gap-2 flex-1 mr-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-crm-secondary">
                      SLA: {rep.slaPercent}%
                    </span>
                    <div className="flex-1 h-1.5 rounded-full bg-crm-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          rep.capacityWarning
                            ? "bg-rose-500"
                            : rep.slaPercent >= 90
                              ? "bg-emerald-500"
                              : "bg-indigo-600"
                        }`}
                        style={{
                          width: `${Math.min(100, Math.max(5, rep.slaPercent))}%`,
                        }}
                      />
                    </div>
                  </div>

                  {rep.actionType === "assign" && (
                    <button
                      type="button"
                      onClick={() => handleAction(rep)}
                      className="px-3 py-1.5 rounded-xl bg-crm-brand-subtle text-crm-brand font-semibold text-xs hover:bg-indigo-100 active:scale-95 transition-all flex items-center gap-1 border border-crm-brand-subtle cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Assign</span>
                    </button>
                  )}

                  {rep.actionType === "nudge" && (
                    <button
                      type="button"
                      onClick={() => handleAction(rep)}
                      className="px-3 py-1.5 rounded-xl bg-crm-muted text-crm-secondary font-semibold text-xs hover:bg-slate-200 active:scale-95 transition-all flex items-center gap-1 border border-crm-subtle cursor-pointer"
                    >
                      <BellRing className="w-3.5 h-3.5 text-amber-600" />
                      <span>Nudge ({rep.overdueCount})</span>
                    </button>
                  )}

                  {rep.actionType === "reassign" && (
                    <button
                      type="button"
                      onClick={() => handleAction(rep)}
                      className="px-3 py-1.5 rounded-xl bg-crm-danger text-crm-danger font-semibold text-xs hover:bg-rose-100 active:scale-95 transition-all flex items-center gap-1 border border-crm-danger cursor-pointer"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>Reassign</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
