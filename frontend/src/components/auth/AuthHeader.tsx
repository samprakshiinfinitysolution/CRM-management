import React from "react";
import { ShieldCheck } from "lucide-react";

export default function AuthHeader() {
  return (
    <header className="flex flex-col items-center text-center mt-1 mb-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-2xl bg-white shadow-xs border border-crm-subtle flex items-center justify-center p-1 shrink-0">
          <div className="w-full h-full rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 flex items-center justify-center text-white font-black text-sm shadow-inner">
            LF
          </div>
        </div>
        <div className="text-left">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-crm-primary tracking-tight">LeadFlow CRM</h1>
            <span className="bg-crm-brand-subtle text-indigo-700 border border-indigo-200/80 text-[10px] font-bold px-2 py-0.5 rounded-full">
              v2.4 PROD
            </span>
          </div>
          <p className="text-xs text-crm-muted">Lead Management & Distribution Engine</p>
        </div>
      </div>

      {/* Security Scoped Pill */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-crm-muted border border-crm-subtle text-crm-secondary text-[11px] font-medium tracking-wide">
        <ShieldCheck className="w-3.5 h-3.5 text-(--crm-brand-primary)" />
        <span>Enterprise SSO & RBAC Workspace</span>
      </div>
    </header>
  );
}
