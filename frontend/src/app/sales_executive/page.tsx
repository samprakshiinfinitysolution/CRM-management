"use client";

import React, { useState } from "react";
import { useAppSelector } from "@/store";
import { performLogout } from "@/lib/authService";
import { UserCheck, LogOut, CheckCircle2, Shield, Loader2 } from "lucide-react";

export default function SalesExecutivePage() {
  const { user } = useAppSelector((state) => state.auth);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await performLogout({ callBackend: true, redirectTo: "/" });
    } catch {
      await performLogout({ callBackend: false, redirectTo: "/" });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Sales Executive Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">
              Sales Executive Terminal
            </h1>
            <p className="text-[11px] text-slate-400">
              LeadFlow Direct Pipeline & Outreach
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-white">
              {user?.name || "Sales Executive"}
            </span>
            <span className="text-[10px] text-emerald-400 font-medium">
              {user?.email}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-slate-300 hover:text-white text-xs font-medium transition-all"
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Signing out...</span>
              </>
            ) : (
              <>
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-6 flex flex-col gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>RBAC PROTECTED SCOPE</span>
              </div>
              <h2 className="text-base font-bold text-white">
                Welcome back, {user?.name || "Executive"}
              </h2>
              <p className="text-xs text-slate-400">
                You are securely logged into your isolated sales lead queue.
                Only leads assigned to your UID are accessible.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
