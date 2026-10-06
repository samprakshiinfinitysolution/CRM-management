"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Clock,
  RefreshCw,
  Calendar,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";

export default function SalesExecutiveError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error("[Sales Executive Workspace Error caught]:", error);
  }, [error]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200 shadow-lg p-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-100 shadow-2xs">
          <AlertCircle className="w-8 h-8" />
        </div>

        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Sales Workspace Interrupted
        </h2>

        <p className="text-xs text-slate-500 mt-1.5 mb-6 max-w-sm leading-relaxed">
          An error occurred while loading your follow-up queue or lead details.
          You can reload your workspace to continue working.
        </p>

        {error.digest && (
          <div className="mb-5 px-3 py-1 rounded-md bg-slate-100 text-[11px] font-mono text-slate-600">
            Reference: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full mb-4">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reload Queue
          </button>

          <Link
            href="/sales_executive"
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-2 text-center"
          >
            <Clock className="w-3.5 h-3.5" />
            Today&apos;s Follow-ups
          </Link>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400">
          <Link
            href="/dashboard/my-leads"
            className="inline-flex items-center gap-1 hover:text-slate-700 transition-colors"
          >
            <Calendar className="w-3 h-3" /> My Assigned Leads
          </Link>
          <span>•</span>
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center gap-1 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <span>{showDetails ? "Hide details" : "Show details"}</span>
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
