"use client";

import React, { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import heroImg from "@/app/assests/hero-image.png";
import { getToken } from "@/lib/utils";
import { decodeJwt, DecodedTokenPayload } from "@/lib/jwt";
import {
  ArrowRight,
  ShieldCheck,
  Users,
  BarChart3,
  FileSpreadsheet,
  Lock,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Check,
  Sliders,
  Calendar,
  Download,
  Menu,
  X,
  RotateCcw,
  Cloud,
  FileText,
  User,
  Star,
  Handshake,
  CheckCircle2,
} from "lucide-react";

// =========================================================================
// Client Auth Synchronization
// =========================================================================
function subscribeAuth(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

let cachedToken: string | null = null;
let cachedUser: DecodedTokenPayload | null = null;

function getClientUser(): DecodedTokenPayload | null {
  if (typeof window === "undefined") return null;
  const token = getToken() || null;
  if (token !== cachedToken) {
    cachedToken = token;
    cachedUser = token ? decodeJwt(token) : null;
  }
  return cachedUser;
}

export default function HomePage() {
  const currentUser = useSyncExternalStore(
    subscribeAuth,
    getClientUser,
    () => null,
  );

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDistributionTab, setActiveDistributionTab] = useState<
    "EQUAL" | "CUSTOM" | "MANUAL"
  >("EQUAL");

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string,
  ) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      window.history.pushState(null, "", `#${targetId}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-600 selection:text-white flex flex-col antialiased">
      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR (Sticky Frosted Glass) */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 group-hover:bg-indigo-700 flex items-center justify-center text-white font-extrabold text-sm shadow-xs transition-colors ring-2 ring-indigo-50">
              LF
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 leading-tight">
                LeadFlow <span className="text-indigo-600">CRM</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase">
                Enterprise Lead Engine
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-600 tracking-wide">
            <a
              href="#features"
              onClick={(e) => handleNavClick(e, "features")}
              className="hover:text-indigo-600 transition-colors"
            >
              Capabilities
            </a>
            <a
              href="#workflow"
              onClick={(e) => handleNavClick(e, "workflow")}
              className="hover:text-indigo-600 transition-colors"
            >
              Lifecycle Pipeline
            </a>
            <a
              href="#distribution"
              onClick={(e) => handleNavClick(e, "distribution")}
              className="hover:text-indigo-600 transition-colors"
            >
              Distribution Modes
            </a>
            <a
              href="#followups"
              onClick={(e) => handleNavClick(e, "followups")}
              className="hover:text-indigo-600 transition-colors"
            >
              Follow-up SLA
            </a>
            <a
              href="#reports"
              onClick={(e) => handleNavClick(e, "reports")}
              className="hover:text-indigo-600 transition-colors"
            >
              Reports
            </a>
            <a
              href="#security"
              onClick={(e) => handleNavClick(e, "security")}
              className="hover:text-indigo-600 transition-colors"
            >
              RBAC Security
            </a>
          </nav>

          {/* Auth Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {currentUser ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login?mode=login"
                  className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 transition-all shadow-2xs"
                >
                  Sign In
                </Link>
                <Link
                  href="/login?mode=register"
                  className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs hover:shadow transition-all active:scale-[0.98]"
                >
                  <span>Start Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-5 pt-3 pb-6 space-y-3 shadow-lg">
            <nav className="flex flex-col space-y-2 text-xs font-semibold text-slate-700">
              <a
                href="#features"
                onClick={(e) => handleNavClick(e, "features")}
                className="px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Capabilities
              </a>
              <a
                href="#workflow"
                onClick={(e) => handleNavClick(e, "workflow")}
                className="px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Lifecycle Pipeline
              </a>
              <a
                href="#distribution"
                onClick={(e) => handleNavClick(e, "distribution")}
                className="px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Distribution Modes
              </a>
              <a
                href="#followups"
                onClick={(e) => handleNavClick(e, "followups")}
                className="px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Follow-up SLA
              </a>
              <a
                href="#reports"
                onClick={(e) => handleNavClick(e, "reports")}
                className="px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Reports
              </a>
              <a
                href="#security"
                onClick={(e) => handleNavClick(e, "security")}
                className="px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                RBAC Security
              </a>
            </nav>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              {currentUser ? (
                <Link
                  href="/dashboard"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-xs"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to Dashboard</span>
                </Link>
              ) : (
                <>
                  <Link
                    href="/login?mode=login"
                    className="w-full inline-flex items-center justify-center px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/login?mode=register"
                    className="w-full inline-flex items-center justify-center px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs"
                  >
                    Start Workspace
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION (Spatial Depth & Clear Call to Actions) */}
      {/* ========================================================================= */}
      <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-28 overflow-hidden bg-white border-b border-slate-200/80">
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-50/60 via-slate-50/20 to-transparent pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold shadow-2xs mb-6">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span>PostgreSQL ACID Authoritative CRM Engine</span>
            <span className="text-slate-300">|</span>
            <span className="text-[11px] font-bold text-indigo-800">v2.4 Production</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight max-w-4xl leading-[1.12]">
            Everything Your Sales Team Needs to Run the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
              Lead Lifecycle
            </span>
          </h1>

          {/* Hero Subtitle */}
          <p className="mt-5 text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed max-w-2xl">
            From bulk Excel intake and duplicate detection to transactional lead distribution and follow-up queues. Built for Team Leaders who demand operational control and Executives who execute.
          </p>

          {/* Primary Call to Action Row */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            <Link
              href={currentUser ? "/dashboard" : "/login?mode=register"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
            >
              <UserPlus className="w-4 h-4" />
              <span>{currentUser ? "Open CRM Console" : "Create Team Workspace"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href={currentUser ? "/dashboard/distributions/create" : "/login?mode=login"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-300 shadow-2xs transition-all active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4 text-slate-500" />
              <span>{currentUser ? "Distribute Leads" : "Sign In to Workspace"}</span>
            </Link>
          </div>

          {/* Trust Guarantees */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-[11px] font-medium text-slate-500">
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Zero client-side authority leaks</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Deterministic remainder split</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Append-only audit timeline</span>
            </div>
          </div>

          {/* Spatial Floating Dashboard Stage */}
          <div className="mt-12 sm:mt-16 w-full max-w-5xl relative">
            {/* Top-Left Floating Badge Chip */}
            <div className="hidden md:flex absolute -top-5 -left-5 z-20 items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-md text-left">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-900 block leading-tight">
                  Equal Split Engine
                </span>
                <span className="text-[10px] text-slate-500">
                  30 leads balanced across 3 reps
                </span>
              </div>
            </div>

            {/* Bottom-Right Floating Badge Chip */}
            <div className="hidden md:flex absolute -bottom-5 -right-5 z-20 items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-md text-left">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-900 block leading-tight">
                  RBAC Boundary Active
                </span>
                <span className="text-[10px] text-slate-500">
                  Zero cross-rep lead leakage
                </span>
              </div>
            </div>

            {/* Console Preview Container */}
            <div className="rounded-2xl border border-slate-200 bg-white p-2 sm:p-3 shadow-xl overflow-hidden transition-all hover:shadow-2xl">
              <div className="relative w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-950">
                <Image
                  src={heroImg}
                  alt="LeadFlow CRM Console Dashboard Preview"
                  priority
                  width={1792}
                  height={856}
                  className="block w-full h-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. CAPABILITIES RIBBON (10 Unified Features Strip) */}
      {/* ========================================================================= */}
      <section className="py-6 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {/* 1. Lead Intake */}
            <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-2xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Cloud className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">Lead Intake</p>
                <p className="text-[10px] text-slate-500 truncate">REST API & Webhooks</p>
              </div>
            </div>

            {/* 2. Excel Imports */}
            <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-2xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">Excel Staging</p>
                <p className="text-[10px] text-slate-500 truncate">Atomic batch import</p>
              </div>
            </div>

            {/* 3. Deduplication */}
            <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-2xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">Deduplication</p>
                <p className="text-[10px] text-slate-500 truncate">Phone & email check</p>
              </div>
            </div>

            {/* 4. Distribution */}
            <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-2xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">Lead Splitting</p>
                <p className="text-[10px] text-slate-500 truncate">Equal, Custom, Manual</p>
              </div>
            </div>

            {/* 5. Follow-ups SLA */}
            <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-2xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">Follow-up SLA</p>
                <p className="text-[10px] text-slate-500 truncate">Today / Overdue queue</p>
              </div>
            </div>

            {/* 6. Activity Timeline */}
            <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-2xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">Audit Trail</p>
                <p className="text-[10px] text-slate-500 truncate">Immutable history</p>
              </div>
            </div>

            {/* 7. Status Machine */}
            <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-2xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">State Transitions</p>
                <p className="text-[10px] text-slate-500 truncate">Strict workflow rules</p>
              </div>
            </div>

            {/* 8. Conversion Reports */}
            <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-2xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">Rep Analytics</p>
                <p className="text-[10px] text-slate-500 truncate">Conversion rates & KPIs</p>
              </div>
            </div>

            {/* 9. Excel Export */}
            <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-2xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <Download className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">Spreadsheet Export</p>
                <p className="text-[10px] text-slate-500 truncate">Filtered workbooks</p>
              </div>
            </div>

            {/* 10. Role Isolation */}
            <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-2xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">Role Isolation</p>
                <p className="text-[10px] text-slate-500 truncate">Backend verified auth</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. THE PROBLEM & SOLUTION BENTO (Clean Architectural Comparison) */}
      {/* ========================================================================= */}
      <section id="features" className="py-16 sm:py-24 bg-white border-b border-slate-200/80 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">
              OPERATIONAL REALITY
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Why High-Volume Sales Teams Outgrow Spreadsheets
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              When lead data, distribution, and follow-ups live across fragmented files, operational delays and missed deals become inevitable.
            </p>
          </div>

          {/* 4 Bento Architecture Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Bento 1: Unstructured Data */}
            <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Unvalidated Lead Intake
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Incoming CSVs frequently contain duplicate phones and missing names, polluting the database.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-semibold text-emerald-700 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>LeadFlow staging validates before commit</span>
              </div>
            </div>

            {/* Bento 2: Manual Distribution */}
            <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Manual Cherry-Picking
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Team Leaders lose hours manually assigning rows, leading to unfair distribution disputes.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-semibold text-emerald-700 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Deterministic Equal & Custom algorithms</span>
              </div>
            </div>

            {/* Bento 3: Lost Follow-ups */}
            <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Missed Callback Deadlines
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sales Executives forget scheduled customer callbacks buried inside cluttered email threads.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-semibold text-emerald-700 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Today, Upcoming & Overdue SLA queues</span>
              </div>
            </div>

            {/* Bento 4: Zero Governance */}
            <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Uncontrolled Data Leaks
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Shared sheets let any rep inspect colleagues&apos; accounts or alter historical records undetected.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-semibold text-emerald-700 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Strict row-level RBAC & audit logging</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. THE COMPLETE LEAD LIFECYCLE PIPELINE (#workflow) */}
      {/* ========================================================================= */}
      <section id="workflow" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200/80 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">
              THE WORKFLOW ENGINE
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              A Controlled 8-Stage Lead Lifecycle
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Every lead follows an explicit state machine with strict database transaction boundaries.
            </p>
          </div>

          {/* Stepper Grid Container */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 text-center">
              {/* 1. Intake */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 shadow-2xs border border-indigo-100">
                  <Cloud className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900">1. Intake</span>
                <span className="text-[11px] text-slate-500 mt-0.5">API / Excel</span>
              </div>

              {/* 2. Validation */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 shadow-2xs border border-indigo-100">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900">2. Validate</span>
                <span className="text-[11px] text-slate-500 mt-0.5">Deduplication</span>
              </div>

              {/* 3. Distribution */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2 shadow-2xs border border-purple-100">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900">3. Distribute</span>
                <span className="text-[11px] text-slate-500 mt-0.5">Equal / Custom</span>
              </div>

              {/* 4. Execution */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 shadow-2xs border border-emerald-100">
                  <User className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900">4. Execution</span>
                <span className="text-[11px] text-slate-500 mt-0.5">Rep Queue</span>
              </div>

              {/* 5. Follow-up */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2 shadow-2xs border border-amber-100">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900">5. Follow-up</span>
                <span className="text-[11px] text-slate-500 mt-0.5">SLA Reminders</span>
              </div>

              {/* 6. Qualification */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2 shadow-2xs border border-purple-100">
                  <Star className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900">6. Qualify</span>
                <span className="text-[11px] text-slate-500 mt-0.5">Budget Fit</span>
              </div>

              {/* 7. Deal Won */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 shadow-2xs border border-emerald-100">
                  <Handshake className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900">7. Deal Close</span>
                <span className="text-[11px] text-slate-500 mt-0.5">Protected State</span>
              </div>

              {/* 8. Reporting */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 shadow-2xs border border-indigo-100">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900">8. Reporting</span>
                <span className="text-[11px] text-slate-500 mt-0.5">Audit & KPIs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. INTERACTIVE LEAD DISTRIBUTION ENGINE SHOWCASE (#distribution) */}
      {/* ========================================================================= */}
      <section id="distribution" className="py-16 sm:py-24 bg-white border-b border-slate-200/80 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">
              DISTRIBUTION MODES
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Distribute Leads the Way Your Team Works
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Select between three deterministic distribution modes executed inside ACID transactions to ensure operational fairness.
            </p>

            {/* Interactive Tab Selector */}
            <div className="inline-flex p-1 bg-slate-100 border border-slate-200 rounded-xl mt-4">
              <button
                type="button"
                onClick={() => setActiveDistributionTab("EQUAL")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeDistributionTab === "EQUAL"
                    ? "bg-white text-indigo-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Equal Split
              </button>
              <button
                type="button"
                onClick={() => setActiveDistributionTab("CUSTOM")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeDistributionTab === "CUSTOM"
                    ? "bg-white text-indigo-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Custom Allocation
              </button>
              <button
                type="button"
                onClick={() => setActiveDistributionTab("MANUAL")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeDistributionTab === "MANUAL"
                    ? "bg-white text-indigo-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Manual Assignment
              </button>
            </div>
          </div>

          {/* Interactive Showcase Card */}
          <div className="max-w-4xl mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
            {activeDistributionTab === "EQUAL" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
                    Mode 01 · Mathematical Division
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Equal Split Engine
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Divides unassigned leads equally across all selected representatives. Deterministic remainder allocation ensures zero leftover confusion.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700 font-medium">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Presets based strictly on unassigned pool size</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Deterministic remainder distribution rule</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Zero lead table clutter in Equal Split</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 font-sans font-bold text-slate-900">
                    <span>Distribution Preview</span>
                    <span className="text-indigo-600 text-xs">30 Leads ÷ 3 Reps</span>
                  </div>
                  <div className="flex justify-between py-1.5 px-2.5 rounded bg-slate-50 text-slate-800">
                    <span>Rahul Sharma</span>
                    <span className="font-bold text-indigo-600">+10 leads</span>
                  </div>
                  <div className="flex justify-between py-1.5 px-2.5 rounded bg-slate-50 text-slate-800">
                    <span>Priya Mehta</span>
                    <span className="font-bold text-indigo-600">+10 leads</span>
                  </div>
                  <div className="flex justify-between py-1.5 px-2.5 rounded bg-slate-50 text-slate-800">
                    <span>Arjun Verma</span>
                    <span className="font-bold text-indigo-600">+10 leads</span>
                  </div>
                  <div className="pt-2 text-[11px] font-sans text-emerald-700 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>100% Balanced & Verified</span>
                  </div>
                </div>
              </div>
            )}

            {activeDistributionTab === "CUSTOM" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
                    Mode 02 · Quota Steppers
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Custom Allocation Quotas
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Set specific quantities per executive according to experience, active workload, or conversion performance.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700 font-medium">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Live quota balance meter prevents overallocation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Inline steppers [-] [value] [+] for speed</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Backend validation enforces exact target sum</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 font-sans font-bold text-slate-900">
                    <span>Quota Balance Tracker</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">30/30 Balanced</span>
                  </div>
                  <div className="flex justify-between py-1.5 px-2.5 rounded bg-slate-50 text-slate-800">
                    <span>Rahul (Senior)</span>
                    <span className="font-bold text-indigo-600">15 leads</span>
                  </div>
                  <div className="flex justify-between py-1.5 px-2.5 rounded bg-slate-50 text-slate-800">
                    <span>Priya (Mid-Level)</span>
                    <span className="font-bold text-indigo-600">10 leads</span>
                  </div>
                  <div className="flex justify-between py-1.5 px-2.5 rounded bg-slate-50 text-slate-800">
                    <span>Arjun (Junior)</span>
                    <span className="font-bold text-indigo-600">5 leads</span>
                  </div>
                  <div className="pt-2 text-[11px] font-sans text-slate-500 flex items-center justify-between">
                    <span>Remaining in pool: 1,210</span>
                    <span className="text-indigo-600 font-semibold">Total: 30 leads</span>
                  </div>
                </div>
              </div>
            )}

            {activeDistributionTab === "MANUAL" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
                    Mode 03 · Direct Lead Mapping
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Manual Assignment Table
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Pick exact high-priority accounts from the unassigned table and assign them directly to domain specialists.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700 font-medium">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Search by Lead Code, customer name, or phone</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Filter by status, priority, city, and source</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>One-click assign to single or multiple reps</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 font-bold text-slate-900">
                    <span>Assigned Account Mappings</span>
                    <span className="text-xs text-indigo-600 font-mono">3 Selected</span>
                  </div>
                  <div className="p-2 rounded border border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <div>
                      <span className="font-mono font-bold text-indigo-600">CRM-001842</span>
                      <p className="text-slate-800 font-medium text-[11px]">Rahul Enterprises</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold text-[10px]">→ Rahul S.</span>
                  </div>
                  <div className="p-2 rounded border border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <div>
                      <span className="font-mono font-bold text-indigo-600">CRM-001843</span>
                      <p className="text-slate-800 font-medium text-[11px]">Apex Logistics Ltd</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold text-[10px]">→ Priya M.</span>
                  </div>
                  <div className="p-2 rounded border border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <div>
                      <span className="font-mono font-bold text-indigo-600">CRM-001844</span>
                      <p className="text-slate-800 font-medium text-[11px]">Zenith Retailers</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold text-[10px]">→ Arjun V.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FOLLOW-UPS QUEUE & SALES EXECUTIVE WORKSPACE (#followups) */}
      {/* ========================================================================= */}
      <section id="followups" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200/80 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">
              EXECUTIVE EXECUTION
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Never Miss the Next Customer Conversation
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Sales Executives work from a dedicated follow-up queue segmented into Today, Upcoming, and Overdue SLA buckets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* TODAY */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-slate-900 uppercase">
                    Today&apos;s Follow-ups
                  </span>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active SLA
                </span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-indigo-600">09:30 AM</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-white border rounded text-slate-600">Call</span>
                  </div>
                  <span className="font-semibold text-slate-900 block mt-1">Apex Global Systems</span>
                  <span className="text-slate-500 text-[11px]">Pricing walk-through & proposal review</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-indigo-600">11:00 AM</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-white border rounded text-slate-600">Meeting</span>
                  </div>
                  <span className="font-semibold text-slate-900 block mt-1">Vanguard Logistics</span>
                  <span className="text-slate-500 text-[11px]">Procurement sign-off confirmation</span>
                </div>
              </div>
            </div>

            {/* UPCOMING */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span className="text-xs font-bold text-slate-900 uppercase">
                    Upcoming Queue
                  </span>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Scheduled
                </span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-slate-700">Tomorrow · 10:00 AM</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-white border rounded text-slate-600">Demo</span>
                  </div>
                  <span className="font-semibold text-slate-900 block mt-1">Horizon Cloud Tech</span>
                  <span className="text-slate-500 text-[11px]">Introductory requirements discovery</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-slate-700">Oct 10 · 02:00 PM</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-white border rounded text-slate-600">Call</span>
                  </div>
                  <span className="font-semibold text-slate-900 block mt-1">Solaris Clean Energy</span>
                  <span className="text-slate-500 text-[11px]">Contract renewal terms discussion</span>
                </div>
              </div>
            </div>

            {/* OVERDUE */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-xs font-bold text-slate-900 uppercase">
                    Overdue Queue
                  </span>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                  Action Required
                </span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-200">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-rose-700">Past SLA</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-white border border-rose-200 rounded text-rose-700">Urgent</span>
                  </div>
                  <span className="font-semibold text-slate-900 block mt-1">Acme Industries</span>
                  <span className="text-slate-500 text-[11px]">Unanswered follow-up call · Flagged to TL</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg text-slate-600 text-[11px]">
                  Team Leaders receive immediate alerts when reps exceed follow-up SLAs.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. REPORTING & EXPORT ENGINE (#reports) */}
      {/* ========================================================================= */}
      <section id="reports" className="py-16 sm:py-20 bg-white border-b border-slate-200/80 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">
              OPERATIONAL REPORTING
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Actionable Performance Analytics & Export
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Filter by executive, source, priority, and date range, then export production-ready Excel reports.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Team Performance Breakdown
                </span>
                <span className="text-[11px] text-slate-500">
                  Current Month · Live PostgreSQL Aggregations
                </span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold shadow-2xs self-start sm:self-auto">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export to Excel</span>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Sales Executive</th>
                    <th className="py-2.5 px-3">Assigned Leads</th>
                    <th className="py-2.5 px-3">Contacted</th>
                    <th className="py-2.5 px-3">Won / Sold</th>
                    <th className="py-2.5 px-3">Conversion Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white font-medium">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">David Miller</td>
                    <td className="py-2.5 px-3 text-slate-700">420</td>
                    <td className="py-2.5 px-3 text-slate-700">382</td>
                    <td className="py-2.5 px-3 font-semibold text-emerald-600">38</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">9.0%</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">Sarah Jenkins</td>
                    <td className="py-2.5 px-3 text-slate-700">395</td>
                    <td className="py-2.5 px-3 text-slate-700">361</td>
                    <td className="py-2.5 px-3 font-semibold text-emerald-600">42</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">10.6%</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">Rahul Sharma</td>
                    <td className="py-2.5 px-3 text-slate-700">378</td>
                    <td className="py-2.5 px-3 text-slate-700">342</td>
                    <td className="py-2.5 px-3 font-semibold text-emerald-600">35</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">9.3%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. SECURITY & ROLE ISOLATION (#security) */}
      {/* ========================================================================= */}
      <section id="security" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200/80 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">
              GOVERNANCE & PERMISSIONS
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Backend-Enforced Role Isolation
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Authorization boundaries are validated on every database query, ensuring reps only access leads assigned to their authenticated identity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Team Leader Box */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Team Leader Authority
                </h3>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Inspect unassigned intake pool and manage company-wide pipeline</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Execute Equal, Custom, and Manual lead distribution transactions</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Reassign leads between representatives or recall to unassigned pool</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Perform Excel bulk intake with pre-commit validation reporting</span>
                </li>
              </ul>
            </div>

            {/* Sales Executive Box */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <Users className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Sales Executive Boundary
                </h3>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>View strictly leads assigned to authenticated user identity</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Update permitted lifecycle statuses and log structured notes</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Schedule follow-ups and log customer calls in personal queue</span>
                </li>
                <li className="flex items-start gap-2 text-slate-400">
                  <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>Zero access to unassigned pool or peer executives&apos; records</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. FINAL CALL TO ACTION */}
      {/* ========================================================================= */}
      <section className="py-20 bg-white border-b border-slate-200/80 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
            <span>Ready for Production Deployment</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight">
            Bring Your Lead Operations Into One Workflow
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Manage incoming leads, distribute work fairly, stay on top of follow-up SLAs, and give your sales executives a clear path to closing deals.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href={currentUser ? "/dashboard" : "/login?mode=register"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
            >
              <UserPlus className="w-4 h-4" />
              <span>{currentUser ? "Open CRM Console" : "Start Team Workspace"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href={currentUser ? "/dashboard/leads" : "/login?mode=login"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-300 shadow-2xs transition-all active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4 text-slate-500" />
              <span>{currentUser ? "View Leads" : "Sign In"}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 11. FOOTER */}
      {/* ========================================================================= */}
      <footer className="bg-slate-50 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              LF
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block">
                LeadFlow CRM
              </span>
              <span className="text-xs text-slate-500">
                Lead Management &amp; Sales Distribution Platform
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 font-medium">
            <a
              href="#features"
              onClick={(e) => handleNavClick(e, "features")}
              className="hover:text-indigo-600 transition-colors"
            >
              Capabilities
            </a>
            <a
              href="#workflow"
              onClick={(e) => handleNavClick(e, "workflow")}
              className="hover:text-indigo-600 transition-colors"
            >
              Pipeline
            </a>
            <a
              href="#distribution"
              onClick={(e) => handleNavClick(e, "distribution")}
              className="hover:text-indigo-600 transition-colors"
            >
              Distribution
            </a>
            <a
              href="#followups"
              onClick={(e) => handleNavClick(e, "followups")}
              className="hover:text-indigo-600 transition-colors"
            >
              Follow-ups
            </a>
            <a
              href="#reports"
              onClick={(e) => handleNavClick(e, "reports")}
              className="hover:text-indigo-600 transition-colors"
            >
              Reports
            </a>
            <a
              href="#security"
              onClick={(e) => handleNavClick(e, "security")}
              className="hover:text-indigo-600 transition-colors"
            >
              Security
            </a>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <Link href="/login?mode=login" className="hover:text-indigo-600">
              Sign In
            </Link>
            <span className="text-slate-300">•</span>
            <Link href="/login?mode=register" className="hover:text-indigo-600">
              Create Account
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-slate-200 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} LeadFlow CRM. All rights reserved. Built with PostgreSQL ACID transactions &amp; row-level isolation.
        </div>
      </footer>
    </div>
  );
}
