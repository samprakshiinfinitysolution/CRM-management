import React from "react";
import { BadgeCheck, ChevronRight, Shield } from "lucide-react";

export default function AuthFooter() {
  return (
    <>
      {/* Operational Guardrails Banner */}
      <div className="bg-gradient-to-br from-indigo-50/80 to-blue-50/80 border border-indigo-100 rounded-xl p-3 mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white border border-indigo-100 flex items-center justify-center text-(--crm-brand-primary) shadow-2xs shrink-0">
            <BadgeCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-indigo-950">Zero-Lead-Loss SLA Protocol</p>
            <p className="text-[11px] text-indigo-700/80">Automated queue assignment & supervisor escalations</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0" />
      </div>

      {/* Footer Security & Audit Specs */}
      <footer className="mt-auto flex flex-col items-center text-center gap-1.5 text-crm-muted pb-4">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-crm-secondary uppercase tracking-wider flex-wrap justify-center">
          <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>256-Bit TLS Encrypted Session</span>
          <span className="text-crm-subtle">•</span>
          <span>Audit Logging Active</span>
        </div>
        <p className="text-xs text-crm-muted">Access subject to enterprise IAM policies.</p>
        <div className="flex items-center gap-3 text-xs font-semibold text-(--crm-brand-primary) flex-wrap justify-center">
          <a href="#terms" className="hover:underline">Enterprise Terms</a>
          <span className="text-slate-300">•</span>
          <a href="#privacy" className="hover:underline">Privacy Charter</a>
          <span className="text-slate-300">•</span>
          <a href="#support" className="hover:underline">IT Operations Helpdesk</a>
        </div>
        <p className="text-[10px] text-crm-muted font-mono mt-1">
          Session ID: #LFC-8842-PROD | Bangalore Region (ap-south-1)
        </p>
      </footer>
    </>
  );
}
