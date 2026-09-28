import React from 'react';
import { BadgeCheck, ChevronRight, Shield } from 'lucide-react';

export default function AuthFooter() {
  return (
    <>
      {/* Operational Guardrails Banner */}
      <div className="bg-slate-100/80 border border-slate-200/60 rounded-xl p-3 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-xs">
            <BadgeCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-800">Zero-Lead-Loss SLA Protocol</p>
            <p className="text-[11px] text-slate-500">Automated queue assignment & supervisor escalations</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>

      {/* Footer Security & Audit Specs */}
      <footer className="mt-auto flex flex-col items-center text-center gap-1.5 text-slate-500">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>256-Bit TLS Encrypted Session</span>
          <span>•</span>
          <span>Audit Logging Active</span>
        </div>
        <p className="text-xs text-slate-400">Access subject to enterprise IAM policies.</p>
        <div className="flex items-center gap-3 text-xs font-semibold text-indigo-600">
          <a href="#terms" className="hover:underline">Enterprise Terms</a>
          <span className="text-slate-300">•</span>
          <a href="#privacy" className="hover:underline">Privacy Charter</a>
          <span className="text-slate-300">•</span>
          <a href="#support" className="hover:underline">IT Operations Helpdesk</a>
        </div>
        <p className="text-[10px] text-slate-400 mt-1">
          Session ID: #LFC-8842-PROD | Bangalore Region (ap-south-1)
        </p>
      </footer>
    </>
  );
}
