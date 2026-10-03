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
import { useAppSelector } from "@/store";
import { Users, Zap, CalendarCheck2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const authMode = useAppSelector((state) => state.auth.authMode);

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
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center px-4 py-8 sm:py-12 relative overflow-hidden font-sans">
      {/* Soft atmospheric gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-80 bg-linear-to-b from-indigo-100/40 via-blue-50/20 to-transparent pointer-events-none -z-10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-100/30 rounded-full pointer-events-none -z-10 blur-3xl" />

      {/* Main Container */}
      <div className="w-full max-w-md lg:max-w-5xl transition-all duration-300">
        <div className="lg:grid lg:grid-cols-12 lg:gap-10 lg:items-center">
          {/* Left Column: Human Story & Value Showcase (Visible on lg+ screens) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-between self-stretch bg-linear-to-br from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
            {/* Subtle glow decorations */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-6">
              {/* Brand Header */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center p-1 shrink-0">
                  <div className="w-full h-full rounded-lg bg-linear-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-black text-sm">
                    LF
                  </div>
                </div>
                <div>
                  <span className="text-base font-bold text-white tracking-tight">
                    LeadFlow CRM
                  </span>
                  <p className="text-xs text-indigo-200/70">
                    Built for sales leaders & representatives
                  </p>
                </div>
              </div>

              {/* Tagline */}
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight leading-snug">
                  Grow relationships, not spreadsheets.
                </h2>
                <p className="text-xs text-indigo-200/80 mt-2 leading-relaxed">
                  A simple, transparent CRM that helps teams distribute leads
                  fairly, follow up on time, and close deals together.
                </p>
              </div>

              {/* Value Highlights */}
              <div className="flex flex-col gap-3 pt-2">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white">
                      Fair Lead Distribution
                    </h3>
                    <p className="text-[11px] text-indigo-200/70 mt-0.5">
                      Distribute incoming leads evenly or by custom quota in a
                      single click.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white">
                      Clear Team Ownership
                    </h3>
                    <p className="text-[11px] text-indigo-200/70 mt-0.5">
                      Every rep gets their own private workspace with their
                      active assigned pipeline.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0">
                    <CalendarCheck2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white">
                      Never Miss a Follow-up
                    </h3>
                    <p className="text-[11px] text-indigo-200/70 mt-0.5">
                      Daily priority queues and smart alerts keep your
                      conversations moving.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial Quote */}
            <div className="relative z-10 pt-6 mt-6 border-t border-white/10">
              <p className="text-xs text-indigo-100 italic leading-relaxed">
                “LeadFlow eliminated all the friction between team leads and
                reps. Everyone knows exactly who to call and when.”
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                  MS
                </div>
                <div className="text-[11px]">
                  <span className="font-semibold text-white">
                    Marcus Sterling
                  </span>
                  <span className="text-indigo-300 ml-1.5">• Team Leader</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Clean, Friendly Auth Card */}
          <div className="lg:col-span-7 flex flex-col w-full">
            {/* Mobile Header (Visible on small screens) */}
            <div className="lg:hidden">
              <AuthHeader />
            </div>

            {/* Desktop Panel Header */}
            <div className="hidden lg:flex flex-col mb-5">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {authMode === "login"
                  ? "Sign in to LeadFlow"
                  : "Create your account"}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {authMode === "login"
                  ? "Enter your credentials or choose a demo account below to get started."
                  : "Join your team workspace and start managing your sales pipeline."}
              </p>
            </div>

            {/* Mode Switcher: Sign In vs Create Account */}
            <AuthModeTabs />

            {/* Role Scope Selection (Only for account registration) */}
            {authMode === "register" && <RoleSelector />}

            {/* The Main Auth Form */}
            <AuthForm />

            {/* Human Footer */}
            <AuthFooter />
          </div>
        </div>
      </div>
    </main>
  );
}
