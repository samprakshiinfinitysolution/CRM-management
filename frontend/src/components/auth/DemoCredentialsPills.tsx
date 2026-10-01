import React from "react";
import { UserCheck, Shield } from "lucide-react";

interface DemoCredentialsPillsProps {
  onFillCredentials: (role: "tl" | "exec") => void;
}

export default function DemoCredentialsPills({
  onFillCredentials,
}: DemoCredentialsPillsProps) {
  return (
    <div className="flex flex-col gap-2 pb-4 mb-1 border-b border-slate-100">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="font-semibold text-slate-700">Quick sign in with demo accounts:</span>
        <span className="text-[11px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-medium">One-click fill</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onFillCredentials("tl")}
          className="group px-3 py-2 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200/70 hover:border-amber-300 text-left transition-all cursor-pointer shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              Team Leader
            </span>
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-100/70 px-1.5 py-0.2 rounded">
              Lead / Admin
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
            teamleader@leadflow.io
          </p>
        </button>

        <button
          type="button"
          onClick={() => onFillCredentials("exec")}
          className="group px-3 py-2 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/70 hover:border-indigo-300 text-left transition-all cursor-pointer shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              Sales Executive
            </span>
            <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100/70 px-1.5 py-0.2 rounded">
              Sales Rep
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
            alex.sales@leadflow.io
          </p>
        </button>
      </div>
    </div>
  );
}
