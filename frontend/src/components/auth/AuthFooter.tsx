import React from "react";
import { Lock } from "lucide-react";

export default function AuthFooter() {
  return (
    <footer className="mt-6 flex flex-col items-center text-center gap-2 text-slate-500 dark:text-slate-400 pb-4">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>Secure authentication with encrypted sessions</span>
      </div>

      <p className="text-xs text-slate-400">
        Need an invite or account assistance? Contact your workspace admin.
      </p>

      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
        <span>© {new Date().getFullYear()} LeadFlow CRM</span>
        <span>•</span>
        <a href="#privacy" className="hover:text-slate-600 transition-colors">
          Privacy
        </a>
        <span>•</span>
        <a href="#terms" className="hover:text-slate-600 transition-colors">
          Terms
        </a>
        <span>•</span>
        <a href="#support" className="hover:text-slate-600 transition-colors">
          Support
        </a>
      </div>
    </footer>
  );
}
