"use client";

import React from "react";
import { Shield, UserCheck } from "lucide-react";
import { useAppDispatch, useAppSelector, setSelectedRole } from "@/store";

export default function RoleSelector() {
  const dispatch = useAppDispatch();
  const selectedRole = useAppSelector((state) => state.auth.selectedRole);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label className="text-[11px] font-bold text-crm-muted uppercase tracking-wider">
          Access Scope & Privilege
        </label>
        <span className="text-[11px] text-(--crm-brand-primary) font-semibold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-(--crm-brand-primary) animate-pulse"></span>
          Live Routing
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {/* Team Leader Option */}
        <button
          type="button"
          onClick={() => dispatch(setSelectedRole("tl"))}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            selectedRole === "tl"
              ? "border-(--crm-brand-primary) ring-2 ring-indigo-500/20 bg-crm-brand-subtle/50 shadow-xs"
              : "border-crm-subtle bg-crm-card hover:bg-crm-subtle/50 hover:border-slate-300 text-crm-secondary"
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <span className="text-xs sm:text-sm font-bold text-crm-primary">Team Leader</span>
            <span className="bg-amber-50 text-amber-800 border border-amber-200/80 text-[9px] font-extrabold px-1.5 py-0.5 rounded">
              OPS / LEAD
            </span>
          </div>
          <p className="text-[11px] text-crm-muted line-clamp-2 leading-relaxed">
            Pipeline intake, lead allocation & SLA overview
          </p>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-(--crm-brand-primary)">
            <Shield className="w-3.5 h-3.5" /> Full Supervisor Scope
          </div>
        </button>

        {/* Sales Exec Option */}
        <button
          type="button"
          onClick={() => dispatch(setSelectedRole("exec"))}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            selectedRole === "exec"
              ? "border-(--crm-brand-primary) ring-2 ring-indigo-500/20 bg-crm-brand-subtle/50 shadow-xs"
              : "border-crm-subtle bg-crm-card hover:bg-crm-subtle/50 hover:border-slate-300 text-crm-secondary"
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <span className="text-xs sm:text-sm font-bold text-crm-primary">Sales Exec</span>
            <span className="bg-blue-50 text-blue-800 border border-blue-200/80 text-[9px] font-extrabold px-1.5 py-0.5 rounded">
              DIRECT SALES
            </span>
          </div>
          <p className="text-[11px] text-crm-muted line-clamp-2 leading-relaxed">
            Assigned lead pool, follow-up queue & activity logging
          </p>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-crm-muted">
            <UserCheck className="w-3.5 h-3.5" /> Field & Desk Queue
          </div>
        </button>
      </div>
    </div>
  );
}
