import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function AuthHeader() {
  return (
    <header className="flex flex-col items-center text-center mt-2 mb-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center p-2">
          <div className="w-full h-full rounded-lg bg-gradient-to-tr from-indigo-700 to-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-inner">
            LF
          </div>
        </div>
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">LeadFlow CRM</h1>
            <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">
              v2.4
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500">Lead Management & Distribution Engine</p>
        </div>
      </div>

      {/* Security Scoped Pill */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/70 text-slate-700 text-[11px] font-bold tracking-wide uppercase">
        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
        <span>Enterprise SSO & RBAC Scoped Workspace</span>
      </div>
    </header>
  );
}
