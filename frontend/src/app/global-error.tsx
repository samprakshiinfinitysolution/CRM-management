"use client";

import React, { useEffect } from "react";
import { AlertOctagon, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global App Error caught]:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 font-sans antialiased">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-5 border border-rose-100 shadow-xs">
            <AlertOctagon className="w-8 h-8" />
          </div>

          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Application Error
          </h1>

          <p className="text-xs text-slate-500 mt-2 mb-6 leading-relaxed">
            A critical unexpected error occurred in the CRM application shell. We have logged the incident and you can reload the session below.
          </p>

          {error.digest && (
            <div className="mb-6 px-3 py-1.5 rounded-lg bg-slate-100 text-[11px] font-mono text-slate-600">
              Error Ref: {error.digest}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </button>

            <a
              href="/dashboard"
              className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-2 text-center"
            >
              <Home className="w-3.5 h-3.5" />
              Dashboard
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
