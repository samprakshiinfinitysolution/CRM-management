"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthModeTabs from "@/components/auth/AuthModeTabs";
import RoleSelector from "@/components/auth/RoleSelector";
import AuthForm from "@/components/auth/AuthForm";
import AuthFooter from "@/components/auth/AuthFooter";
import { getToken, removeToken } from "@/lib/utils";
import { decodeJwt } from "@/lib/jwt";
import {
  Layers,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles,
  Database,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const decoded = decodeJwt(token);
    if (!decoded) {
      removeToken();
      return;
    }

    router.replace("/dashboard");
  }, [router]);

  return (
    <main className="min-h-screen bg-crm-canvas text-crm-primary flex flex-col justify-center items-center px-4 py-8 sm:py-12 relative overflow-hidden font-sans">
      {/* Ambient Canvas Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-100/50 via-blue-50/20 to-transparent pointer-events-none -z-10 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-200/20 rounded-full pointer-events-none -z-10 blur-3xl" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-200/20 rounded-full pointer-events-none -z-10 blur-3xl" />

      {/* Main Container */}
      <div className="w-full max-w-md lg:max-w-5xl transition-all duration-300">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start">
          {/* Left Column: Enterprise Platform Showcase (Visible on lg+ screens) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-between self-stretch bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden border border-indigo-800/40">
            {/* Subtle internal glow decoration */}
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-6">
              {/* Header Badge */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white shadow-md flex items-center justify-center p-1 shrink-0">
                  <div className="w-full h-full rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 flex items-center justify-center text-white font-black text-sm shadow-inner">
                    LF
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white tracking-tight">
                      LeadFlow CRM
                    </span>
                    <span className="bg-white/15 text-indigo-200 border border-white/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      PROD v2.4
                    </span>
                  </div>
                  <p className="text-xs text-indigo-200/70">
                    Authoritative Lead Distribution Engine
                  </p>
                </div>
              </div>

              {/* Tagline */}
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight leading-snug">
                  High-velocity pipeline with zero lead leakage.
                </h2>
                <p className="text-xs text-indigo-200/80 mt-2 leading-relaxed">
                  Enterprise-grade backend authoritative CRM built with PostgreSQL ACID transactions, deterministic distribution algorithms, and strict executive isolation.
                </p>
              </div>

              {/* Value Pillar Cards */}
              <div className="flex flex-col gap-3 pt-2">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">ACID Lead Distribution</h3>
                    <p className="text-[11px] text-indigo-200/70 mt-0.5">
                      Deterministic equal, custom, and manual assignment with race-condition prevention.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Sales Executive Isolation</h3>
                    <p className="text-[11px] text-indigo-200/70 mt-0.5">
                      Server-side row ownership locks reps strictly to their assigned leads.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Zero-Lead-Loss SLA Protocol</h3>
                    <p className="text-[11px] text-indigo-200/70 mt-0.5">
                      Follow-up work queues, supervisor escalation banners, and activity timelines.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom System Spec */}
            <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-indigo-200/60 font-mono">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                PostgreSQL System of Record
              </span>
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                SOC2 Ready
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Authentication Form Panel */}
          <div className="lg:col-span-7 flex flex-col w-full">
            {/* Mobile Header: Visible on <lg screens */}
            <div className="lg:hidden">
              <AuthHeader />
            </div>

            {/* Desktop Panel Header: Visible on lg+ screens */}
            <div className="hidden lg:flex flex-col mb-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-crm-primary tracking-tight">
                  Sign In to Workspace
                </h2>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-crm-muted border border-crm-subtle text-crm-secondary text-[11px] font-medium">
                  <Sparkles className="w-3 h-3 text-(--crm-brand-primary)" />
                  <span>Role-Based Access Control</span>
                </div>
              </div>
              <p className="text-xs text-crm-muted mt-1">
                Select your operating persona and enter credentials to access your console.
              </p>
            </div>

            {/* Auth Mode Segmented Pill Switcher (RTK state) */}
            <AuthModeTabs />

            {/* Role Scope Switcher / Persona Context (RTK state) */}
            <RoleSelector />

            {/* Credentials Form (RTK state with dynamic code-split registration fields) */}
            <AuthForm />

            {/* Operational Guardrails Banner & Security Audit Footer */}
            <AuthFooter />
          </div>
        </div>
      </div>
    </main>
  );
}
