"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  RefreshCw,
  LayoutDashboard,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";

export default function TeamLeaderError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error("[Team Leader Workspace Error caught]:", error);
  }, [error]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200 shadow-lg p-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 border border-indigo-100 shadow-2xs">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Team Leader Console Interrupted
        </h2>

        <p className="text-xs text-slate-500 mt-1.5 mb-6 max-w-sm leading-relaxed">
          An error occurred while rendering the distribution or intake workflow.
          You can refresh this view or navigate to the supervisor overview.
        </p>

        {error.digest && (
          <div className="mb-5 px-3 py-1 rounded-md bg-slate-100 text-[11px] font-mono text-slate-600">
            Digest Code: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full mb-4">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Action
          </button>

          <Link
            href="/team_leader"
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-2 text-center"
          >
            <Users className="w-3.5 h-3.5" />
            Team Leader Home
          </Link>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 hover:text-slate-700 transition-colors"
          >
            <LayoutDashboard className="w-3 h-3" /> Standard Dashboard
          </Link>
          <span>•</span>
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center gap-1 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <span>{showDetails ? "Hide details" : "Technical details"}</span>
            {showDetails ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        </div>

        {showDetails && (
          <div className="w-full text-left mt-4 p-3.5 rounded-lg bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto max-h-40 border border-slate-800">
            <div className="font-bold text-rose-400 mb-1">
              {error.name}: {error.message}
            </div>
            {error.stack && (
              <pre className="text-[11px] text-slate-400 whitespace-pre-wrap leading-relaxed">
                {error.stack}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
