"use client";

import React from "react";
import { Shield, UserCheck } from "lucide-react";
import { useAppDispatch, useAppSelector, setSelectedRole } from "@/store";

export default function RoleSelector() {
  const dispatch = useAppDispatch();
  const selectedRole = useAppSelector((state) => state.auth.selectedRole);

  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-slate-700 mb-2">
        Select your role in the team:
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => dispatch(setSelectedRole("tl"))}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            selectedRole === "tl"
              ? "border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40 shadow-xs"
              : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-600" />
              Team Leader
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Distribute leads, oversee pipeline & monitor sales activity.
          </p>
        </button>

        <button
          type="button"
          onClick={() => dispatch(setSelectedRole("exec"))}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            selectedRole === "exec"
              ? "border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40 shadow-xs"
              : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              Sales Executive
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Manage your personal leads, schedule follow-ups & close deals.
          </p>
        </button>
      </div>
    </div>
  );
}
