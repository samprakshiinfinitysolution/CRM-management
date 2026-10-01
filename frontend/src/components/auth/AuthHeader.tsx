import React from "react";
import { Sparkles } from "lucide-react";

export default function AuthHeader() {
  return (
    <header className="flex flex-col items-center text-center mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 shadow-md flex items-center justify-center text-white font-bold text-base">
          LF
        </div>
        <div className="text-left">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            LeadFlow
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Smart CRM for modern sales teams
          </p>
        </div>
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50/80 border border-indigo-100/80 text-indigo-700 text-xs font-medium">
        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
        <span>Welcome to your workspace</span>
      </div>
    </header>
  );
}
