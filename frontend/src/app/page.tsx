"use client";

import React, { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { getToken } from "@/lib/utils";
import { decodeJwt, DecodedTokenPayload } from "@/lib/jwt";
import {
  ArrowRight,
  ShieldCheck,
  Users,
  BarChart3,
  FileSpreadsheet,
  Lock,
  ChevronRight,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Check,
  Sliders,
  Calendar,
  Bell,
  Download,
  Menu,
  X,
  Eye,
  RotateCcw,
  Cloud,
  FileText,
  User,
  Star,
  Handshake,
} from "lucide-react";
import Image from "next/image";
import heroImg from "@/app/assests/hero-image.png";

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
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-600 selection:text-white flex flex-col antialiased">
      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
              LF
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              LeadFlow <span className="text-blue-600">CRM</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a
              href="#features"
              onClick={(e) => handleNavClick(e, "features")}
              className="hover:text-blue-600 transition-colors"
            >
              Features
            </a>
            <a
              href="#workflow"
              onClick={(e) => handleNavClick(e, "workflow")}
              className="hover:text-blue-600 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#distribution"
              onClick={(e) => handleNavClick(e, "distribution")}
              className="hover:text-blue-600 transition-colors"
            >
              Distribution
            </a>
            <a
              href="#followups"
              onClick={(e) => handleNavClick(e, "followups")}
              className="hover:text-blue-600 transition-colors"
            >
              Follow-ups
            </a>
            <a
              href="#reports"
              onClick={(e) => handleNavClick(e, "reports")}
              className="hover:text-blue-600 transition-colors"
            >
              Reports
            </a>
            <a
              href="#security"
              onClick={(e) => handleNavClick(e, "security")}
              className="hover:text-blue-600 transition-colors"
            >
              Security
            </a>
          </nav>

          {/* Auth Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {currentUser ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login?mode=login"
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/login?mode=register"
                  className="inline-flex items-center px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm hover:shadow transition-all"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-5 pt-3 pb-6 space-y-3 shadow-lg">
            <nav className="flex flex-col space-y-2 text-sm font-semibold text-slate-700">
              <a
                href="#features"
                onClick={(e) => handleNavClick(e, "features")}
                className="px-3 py-2 rounded-md hover:bg-slate-100"
              >
                Features
              </a>
              <a
                href="#workflow"
                onClick={(e) => handleNavClick(e, "workflow")}
                className="px-3 py-2 rounded-md hover:bg-slate-100"
              >
                How It Works
              </a>
              <a
                href="#distribution"
                onClick={(e) => handleNavClick(e, "distribution")}
                className="px-3 py-2 rounded-md hover:bg-slate-100"
              >
                Distribution
              </a>
              <a
                href="#followups"
                onClick={(e) => handleNavClick(e, "followups")}
                className="px-3 py-2 rounded-md hover:bg-slate-100"
              >
                Follow-ups
              </a>
              <a
                href="#reports"
                onClick={(e) => handleNavClick(e, "reports")}
                className="px-3 py-2 rounded-md hover:bg-slate-100"
              >
                Reports
              </a>
              <a
                href="#security"
                onClick={(e) => handleNavClick(e, "security")}
                className="px-3 py-2 rounded-md hover:bg-slate-100"
              >
                Security
              </a>
            </nav>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              {currentUser ? (
                <Link
                  href="/dashboard"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold text-sm shadow-sm"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to Dashboard</span>
                </Link>
              ) : (
                <>
                  <Link
                    href="/login?mode=login"
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/login?mode=register"
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold text-sm"
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION (EXACT MATCH TO DESIGN) */}
      {/* ========================================================================= */}
      <section className="pt-12 pb-16 lg:pt-8 lg:pb-24 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* LEFT COLUMN: Header, Description & 10 Feature Badges */}
            <div className="lg:col-span-5 space-y-7">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-[0.08em] text-indigo-600 uppercase">
                  WHAT IS LEADFLOW CRM?
                </span>
                <span className="w-6 h-px bg-indigo-300" />
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[43px] font-bold text-slate-950 leading-[1.15]">
                Everything Your Sales Team Needs to Manage the{" "}
                <span className="text-indigo-600">Lead Lifecycle</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-7 max-w-xl">
                LeadFlow CRM is a lead management and sales distribution
                platform designed to give Team Leaders operational control while
                keeping Sales Executives focused on execution.
              </p>

              {/* 10 Feature Cards Grid: 2 rows of 5 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 shadow-sm">
                {/* 1. Lead Intake */}
                <div className="flex flex-col items-center justify-center min-h-25 p-3 bg-white hover:bg-indigo-50/40 transition-colors text-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5">
                    <Cloud className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-800 leading-tight">
                    Lead Intake
                  </span>
                </div>

                {/* 2. Excel Imports */}
                <div className="flex flex-col items-center justify-center min-h-25 p-3 bg-white hover:bg-indigo-50/40 transition-colors text-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-800 leading-tight">
                    Excel Imports
                  </span>
                </div>

                {/* 3. Duplicate Detection */}
                <div className="flex flex-col items-center justify-center min-h-25 p-3 bg-white hover:bg-indigo-50/40 transition-colors text-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-800 leading-tight">
                    Duplicate Detection
                  </span>
                </div>

                {/* 4. Lead Assignment */}
                <div className="flex flex-col items-center justify-center min-h-25 p-3 bg-white hover:bg-indigo-50/40 transition-colors text-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-800 leading-tight">
                    Lead Assignment
                  </span>
                </div>

                {/* 5. Follow-ups */}
                <div className="flex flex-col items-center justify-center min-h-25 p-3 bg-white hover:bg-indigo-50/40 transition-colors text-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-800 leading-tight">
                    Follow-ups
                  </span>
                </div>

                {/* 6. Activities & Notes */}
                <div className="flex flex-col items-center justify-center min-h-25 p-3 bg-white hover:bg-indigo-50/40 transition-colors text-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-800 leading-tight">
                    Activities &amp; Notes
                  </span>
                </div>

                {/* 7. Status Transitions */}
                <div className="flex flex-col items-center justify-center min-h-25 p-3 bg-white hover:bg-indigo-50/40 transition-colors text-center">
                  <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mb-1.5">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-800 leading-tight">
                    Status Transitions
                  </span>
                </div>

                {/* 8. Performance Reporting */}
                <div className="flex flex-col items-center justify-center min-h-25 p-3 bg-white hover:bg-indigo-50/40 transition-colors text-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-800 leading-tight">
                    Performance Reporting
                  </span>
                </div>

                {/* 9. Excel Exports */}
                <div className="flex flex-col items-center justify-center min-h-25 p-3 bg-white hover:bg-indigo-50/40 transition-colors text-center">
                  <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mb-1.5">
                    <Download className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-800 leading-tight">
                    Excel Exports
                  </span>
                </div>

                {/* 10. Notifications */}
                <div className="flex flex-col items-center justify-center min-h-25 p-3 bg-white hover:bg-indigo-50/40 transition-colors text-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5">
                    <Bell className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-800 leading-tight">
                    Notifications
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: GORGEOUS FLOATING DASHBOARD MOCKUP */}
            <div className="lg:col-span-7 relative flex items-center justify-center lg:pl-4">
              <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_18px_46px_-18px_rgba(15,23,42,0.22)]">
                <Image
                  src={heroImg}
                  alt="LeadFlow CRM Operations Console Dashboard Preview"
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
      {/* 3. THE PROBLEM SECTION (EXACT MATCH TO DESIGN) */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 bg-[#f8fafc] border-t border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Title */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider text-blue-600 uppercase">
                  THE PROBLEM
                </span>
                <span className="w-6 h-[1.5px] bg-blue-600/40" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                Sales Teams Lose Time When Lead Operations Are Fragmented
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed">
                When lead data, distribution and follow-ups live in different
                tools or spreadsheets, it creates delays, missed opportunities
                and unnecessary manual work.
              </p>
            </div>

            {/* Right 4 Grid Cards */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Card 1: Leads arrive without structure */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all space-y-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Leads arrive without structure
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Excel files and incoming leads need validation before entering
                  the CRM.
                </p>
              </div>

              {/* Card 2: Distribution becomes manual */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all space-y-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Distribution becomes manual
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Team Leaders need a reliable way to distribute large volumes
                  of leads across executives.
                </p>
              </div>

              {/* Card 3: Follow-ups get missed */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all space-y-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Follow-ups get missed
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sales Executives need a dedicated queue for today&apos;s,
                  upcoming and overdue follow-ups.
                </p>
              </div>

              {/* Card 4: Management lacks visibility */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all space-y-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Eye className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Management lacks visibility
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Team Leaders need performance metrics, conversion information
                  and historical activity.
                </p>
              </div>
            </div>
          </div>

          {/* Center Pill */}
          <div className="flex justify-center pt-2">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-800 text-xs sm:text-sm font-semibold shadow-2xs">
              <RotateCcw className="w-4 h-4 text-blue-600" />
              <span>
                LeadFlow brings all three into one controlled workflow.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. THE SOLUTION: A COMPLETE LEAD LIFECYCLE (EXACT MATCH TO DESIGN) */}
      {/* ========================================================================= */}
      <section
        id="workflow"
        className="py-14 sm:py-16 bg-white border-b border-slate-200/80 scroll-mt-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left Label & Title */}
              <div className="lg:col-span-3 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold tracking-wider text-blue-600 uppercase">
                    THE SOLUTION
                  </span>
                  <span className="w-5 h-[1.5px] bg-blue-600/40" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  A Complete Lead Lifecycle
                </h3>
              </div>

              {/* Right Stepper Flow with 8 Connected Steps */}
              <div className="lg:col-span-9 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                {/* 1. Lead Intake */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5 shadow-2xs border border-blue-100">
                    <Cloud className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">
                    Lead Intake
                  </span>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 hidden md:block" />

                {/* 2. Validation */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5 shadow-2xs border border-blue-100">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">
                    Validation
                  </span>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 hidden md:block" />

                {/* 3. Distribution */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-1.5 shadow-2xs border border-purple-100">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">
                    Distribution
                  </span>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 hidden md:block" />

                {/* 4. Sales Execution */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5 shadow-2xs border border-emerald-100">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">
                    Sales Execution
                  </span>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 hidden md:block" />

                {/* 5. Follow-up */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5 shadow-2xs border border-blue-100">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">
                    Follow-up
                  </span>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 hidden md:block" />

                {/* 6. Qualification */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-1.5 shadow-2xs border border-purple-100">
                    <Star className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">
                    Qualification
                  </span>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 hidden md:block" />

                {/* 7. Deal */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center mb-1.5 shadow-2xs border border-cyan-100">
                    <Handshake className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">
                    Deal
                  </span>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 hidden md:block" />

                {/* 8. Reporting */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5 shadow-2xs border border-blue-100">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">
                    Reporting
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. TEAM LEADER WORKSPACE COMMAND */}
      {/* ========================================================================= */}
      <section
        id="features"
        className="py-16 sm:py-20 bg-[#f8fafc] border-b border-slate-200/80 scroll-mt-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Description */}
            <div className="lg:col-span-5 space-y-5">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Management Command
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                One Command Center for Your Sales Team
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Team Leaders retain authoritative oversight over team capacity,
                incoming lead pools, and transactional reassignments while
                tracking execution compliance.
              </p>

              <div className="space-y-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    View total, unassigned, and assigned leads in real time
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Distribute, reassign, and recall leads atomically</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    Monitor follow-up workload across all team executives
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    View employee performance and track conversion outcomes
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    Review permanent audit history and export filtered Excel
                    reports
                  </span>
                </div>
              </div>
            </div>

            {/* Right Interactive Table Mockup */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Team Leader Workspace Console
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Live Operations &amp; Performance Review
                  </span>
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                  ● PostgreSQL ACID Sync
                </span>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Total Leads
                  </span>
                  <p className="text-xl font-bold text-slate-900">12,480</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80">
                  <span className="text-[11px] text-blue-700 font-medium">
                    Unassigned
                  </span>
                  <p className="text-xl font-bold text-blue-700">342</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                  <span className="text-[11px] text-emerald-800 font-medium">
                    Won/Sold
                  </span>
                  <p className="text-xl font-bold text-emerald-700">214</p>
                </div>
              </div>

              {/* Employee Performance Table */}
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-2 uppercase tracking-wider">
                  Employee Performance
                </span>
                <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200/80">
                      <tr>
                        <th className="py-2.5 px-3">Employee</th>
                        <th className="py-2.5 px-3">Assigned</th>
                        <th className="py-2.5 px-3">Won/Sold</th>
                        <th className="py-2.5 px-3">Conversion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          David Miller
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">420</td>
                        <td className="py-2.5 px-3 font-semibold text-emerald-600">
                          38
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">
                          9.0%
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          Sarah Jenkins
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">395</td>
                        <td className="py-2.5 px-3 font-semibold text-emerald-600">
                          42
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">
                          10.6%
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          Rahul Sharma
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">378</td>
                        <td className="py-2.5 px-3 font-semibold text-emerald-600">
                          35
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">
                          9.3%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. LEAD DISTRIBUTION ENGINE (EQUAL / CUSTOM / MANUAL) */}
      {/* ========================================================================= */}
      <section
        id="distribution"
        className="py-16 sm:py-20 bg-white border-b border-slate-200/80 scroll-mt-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Core Differentiator
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Distribute Leads the Way Your Team Works
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              LeadFlow provides three deterministic distribution modes executed
              inside ACID database transactions to eliminate manual errors and
              guarantee fairness.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Mode 1: Equal */}
            <div className="p-6 rounded-2xl bg-[#f8fafc] border border-slate-200/90 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Mode 01
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-2">
                  Equal Distribution
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Automatically divide selected leads evenly among selected
                  executives. Deterministic remainder handling leaves left-over
                  leads cleanly in the unassigned pool.
                </p>
                <div className="mt-4 p-3 bg-white rounded-xl border border-slate-200/80 text-xs font-mono text-slate-700">
                  <div className="font-semibold text-blue-600">
                    11 Leads ÷ 3 Executives:
                  </div>
                  <div className="mt-1 text-slate-600">
                    • Executive A → 4<br />
                    • Executive B → 4<br />• Executive C → 3
                  </div>
                </div>
              </div>
              <span className="mt-5 text-[11px] text-slate-400 font-medium">
                Best for high-volume inbound queue fairness
              </span>
            </div>

            {/* Mode 2: Custom */}
            <div className="p-6 rounded-2xl bg-[#f8fafc] border border-slate-200/90 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Mode 02
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-2">
                  Custom Distribution
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Team Leaders explicitly define how many leads each executive
                  receives based on capacity, shift schedule, or conversion
                  seniority.
                </p>
                <div className="mt-4 p-3 bg-white rounded-xl border border-slate-200/80 text-xs font-mono text-slate-700">
                  <div className="font-semibold text-blue-600">
                    10 Leads Total:
                  </div>
                  <div className="mt-1 text-slate-600">
                    • Senior Rep → 5<br />
                    • Mid-Level Rep → 3<br />• Junior Rep → 2
                  </div>
                </div>
              </div>
              <span className="mt-5 text-[11px] text-slate-400 font-medium">
                Backend validates allocation sum matches pool
              </span>
            </div>

            {/* Mode 3: Manual */}
            <div className="p-6 rounded-2xl bg-[#f8fafc] border border-slate-200/90 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Mode 03
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-2">
                  Manual Assignment
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Select specific individual leads from the unassigned table and
                  explicitly assign them to chosen domain specialists or key
                  account managers.
                </p>
                <div className="mt-4 p-3 bg-white rounded-xl border border-slate-200/80 text-xs font-mono text-slate-700">
                  <div className="font-semibold text-blue-600">
                    Direct Mapping:
                  </div>
                  <div className="mt-1 text-slate-600">
                    • CRM-001842 → David Miller
                    <br />
                    • CRM-001841 → Sarah Jenkins
                    <br />• CRM-001840 → Rahul Sharma
                  </div>
                </div>
              </div>
              <span className="mt-5 text-[11px] text-slate-400 font-medium">
                One-to-one selective routing for high-value leads
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FOLLOW-UPS QUEUE & SALES EXECUTIVE WORKSPACE */}
      {/* ========================================================================= */}
      <section
        id="followups"
        className="py-16 sm:py-20 bg-[#f8fafc] border-b border-slate-200/80 scroll-mt-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Follow-up Queue
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Never Lose Track of the Next Conversation
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              LeadFlow gives Sales Executives a structured follow-up queue so
              important customer conversations do not disappear inside
              spreadsheets.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* TODAY */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-slate-900 uppercase">
                    Today&apos;s Follow-ups
                  </span>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                  Active
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-mono font-bold text-blue-600 block">
                    09:30 AM
                  </span>
                  <span className="font-semibold text-slate-900">
                    Apex Global
                  </span>
                  <span className="text-slate-500 block text-[11px]">
                    Pricing walk-through call
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-mono font-bold text-blue-600 block">
                    11:00 AM
                  </span>
                  <span className="font-semibold text-slate-900">
                    Vanguard Logistics
                  </span>
                  <span className="text-slate-500 block text-[11px]">
                    Procurement sign-off check
                  </span>
                </div>
              </div>
            </div>

            {/* UPCOMING */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-xs font-bold text-slate-900 uppercase">
                    Upcoming
                  </span>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  Scheduled
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-mono font-bold text-slate-600 block">
                    Tomorrow • 10:00 AM
                  </span>
                  <span className="font-semibold text-slate-900">
                    Horizon Cloud
                  </span>
                  <span className="text-slate-500 block text-[11px]">
                    Introductory requirements discovery
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-mono font-bold text-slate-600 block">
                    Oct 10 • 02:00 PM
                  </span>
                  <span className="font-semibold text-slate-900">
                    Solaris Energy
                  </span>
                  <span className="text-slate-500 block text-[11px]">
                    Contract terms negotiation
                  </span>
                </div>
              </div>
            </div>

            {/* OVERDUE */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-xs font-bold text-slate-900 uppercase">
                    Overdue
                  </span>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700">
                  Action Required
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200">
                  <span className="font-mono font-bold text-rose-700 block">
                    Missed SLA
                  </span>
                  <span className="font-semibold text-slate-900">
                    Acme Industries
                  </span>
                  <span className="text-slate-500 block text-[11px]">
                    Unanswered follow-up call • Highlighted to TL
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. REPORTING & DATA EXPORT */}
      {/* ========================================================================= */}
      <section
        id="reports"
        className="py-16 sm:py-20 bg-white border-b border-slate-200/80 scroll-mt-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Data Visibility
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Turn CRM Activity Into Actionable Reports
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Team Leaders can generate reports filtered by executive, status,
              source, date ranges, and conversion outcomes, then export
              production-grade spreadsheets instantly.
            </p>
          </div>

          <div className="mt-12 max-w-4xl mx-auto bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Performance Report
                </span>
                <span className="text-[11px] text-slate-500">
                  Filtered: Current Month • All Active Executives
                </span>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-xs transition-colors self-start sm:self-auto"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export to Excel</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200/80">
                  <tr>
                    <th className="py-2.5 px-3">Employee</th>
                    <th className="py-2.5 px-3">Assigned</th>
                    <th className="py-2.5 px-3">Contacted</th>
                    <th className="py-2.5 px-3">Won/Sold</th>
                    <th className="py-2.5 px-3">Conversion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      David Miller
                    </td>
                    <td className="py-2.5 px-3">420</td>
                    <td className="py-2.5 px-3">382</td>
                    <td className="py-2.5 px-3 font-semibold text-emerald-700">
                      38
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      9.0%
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      Sarah Jenkins
                    </td>
                    <td className="py-2.5 px-3">395</td>
                    <td className="py-2.5 px-3">361</td>
                    <td className="py-2.5 px-3 font-semibold text-emerald-700">
                      42
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      10.6%
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      Rahul Sharma
                    </td>
                    <td className="py-2.5 px-3">378</td>
                    <td className="py-2.5 px-3">342</td>
                    <td className="py-2.5 px-3 font-semibold text-emerald-700">
                      35
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      9.3%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. SECURITY & ROLE ISOLATION */}
      {/* ========================================================================= */}
      <section
        id="security"
        className="py-16 sm:py-20 bg-[#f8fafc] border-b border-slate-200/80 scroll-mt-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Governance &amp; Authorization
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Built Around Controlled Access
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              LeadFlow enforces strict backend-authoritative role isolation.
              Sales Executives cannot access the unassigned pool or
              cross-inspect leads assigned to peer executives.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Team Leader Box */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Team Leader Authority
                </h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    Inspect unassigned intake pool and active company pipeline
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    Execute Equal, Custom, and Manual lead distribution
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    Reassign leads between executives or recall leads to
                    unassigned pool
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Upload Excel spreadsheets and inspect error logs</span>
                </li>
              </ul>
            </div>

            {/* Sales Executive Box */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Sales Executive Boundary
                </h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    View strictly assigned leads matching authenticated user
                    identity
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Update permitted lifecycle statuses and priority levels
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Add customer notes, call logs, and scheduled follow-ups
                  </span>
                </li>
                <li className="flex items-center gap-2 text-slate-500">
                  <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    Zero access to unassigned pool or colleagues&apos; leads
                  </span>
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
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Bring Your Lead Operations Into One Workflow
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Manage incoming leads, distribute work fairly, stay on top of
            follow-ups and give your sales team a clear path from first contact
            to closed deal.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/login?mode=register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-sm transition-all"
            >
              <UserPlus className="w-5 h-5" />
              <span>Create Workspace</span>
            </Link>
            <Link
              href="/login?mode=login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-base border border-slate-300 transition-all"
            >
              <LogIn className="w-5 h-5 text-slate-500" />
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 11. FOOTER */}
      {/* ========================================================================= */}
      <footer className="bg-[#f8fafc] py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
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
              className="hover:text-blue-600 transition-colors"
            >
              Features
            </a>
            <a
              href="#workflow"
              onClick={(e) => handleNavClick(e, "workflow")}
              className="hover:text-blue-600 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#distribution"
              onClick={(e) => handleNavClick(e, "distribution")}
              className="hover:text-blue-600 transition-colors"
            >
              Distribution
            </a>
            <a
              href="#followups"
              onClick={(e) => handleNavClick(e, "followups")}
              className="hover:text-blue-600 transition-colors"
            >
              Follow-ups
            </a>
            <a
              href="#reports"
              onClick={(e) => handleNavClick(e, "reports")}
              className="hover:text-blue-600 transition-colors"
            >
              Reports
            </a>
            <a
              href="#security"
              onClick={(e) => handleNavClick(e, "security")}
              className="hover:text-blue-600 transition-colors"
            >
              Security
            </a>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <Link href="/login?mode=login" className="hover:text-blue-600">
              Sign In
            </Link>
            <span className="text-slate-300">•</span>
            <Link href="/login?mode=register" className="hover:text-blue-600">
              Create Account
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-slate-200 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} LeadFlow CRM. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
