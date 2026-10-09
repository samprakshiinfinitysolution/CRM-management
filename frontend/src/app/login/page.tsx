"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import AuthIllustration from "@/components/auth/AuthIllustration";
import { getToken, removeToken } from "@/lib/utils";
import { decodeJwt } from "@/lib/jwt";
import { useAppDispatch, setAuthMode } from "@/store";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const modeParam = params.get("mode");
      if (modeParam === "register" || modeParam === "login") {
        dispatch(setAuthMode(modeParam));
      }
    }

    const token = getToken();
    if (!token) return;

    const decoded = decodeJwt(token);
    if (!decoded) {
      removeToken();
      return;
    }

    router.replace("/dashboard");
  }, [router, dispatch]);

  return (
    <main className="min-h-screen bg-[#eaf2f8] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center px-4 py-8 sm:py-12 relative overflow-hidden font-sans select-none transition-colors">
      <div className="absolute top-4 right-4 z-30">
        <ThemeToggle />
      </div>
      {/* ------------------------------------------------------------- */}
      {/* Subtle Minimalist Wavy Background Patterns (Top-Right & Bottom-Left) */}
      {/* ------------------------------------------------------------- */}
      <svg
        className="absolute top-6 right-6 w-48 sm:w-64 h-28 text-slate-300/45 pointer-events-none -z-10"
        viewBox="0 0 240 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      >
        <path d="M0 25 Q30 5 60 25 T120 25 T180 25 T240 25" />
        <path d="M0 50 Q30 30 60 50 T120 50 T180 50 T240 50" />
        <path d="M0 75 Q30 55 60 75 T120 75 T180 75 T240 75" />
      </svg>

      <svg
        className="absolute bottom-6 left-6 w-48 sm:w-64 h-28 text-slate-300/45 pointer-events-none -z-10"
        viewBox="0 0 240 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      >
        <path d="M0 25 Q30 5 60 25 T120 25 T180 25 T240 25" />
        <path d="M0 50 Q30 30 60 50 T120 50 T180 50 T240 50" />
        <path d="M0 75 Q30 55 60 75 T120 75 T180 75 T240 75" />
      </svg>

      {/* ------------------------------------------------------------- */}
      {/* Main Floating Auth Container */}
      {/* ------------------------------------------------------------- */}
      <div className="w-full max-w-4xl lg:max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-300/40 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden relative z-10 transition-all">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-135">
          {/* Left Column: Isometric Team Collaboration Illustration */}
          <div className="hidden lg:flex lg:col-span-6 bg-slate-50/70 dark:bg-slate-800/40 p-6 sm:p-10 flex-col items-center justify-center border-r border-slate-100 dark:border-slate-800 relative">
            <AuthIllustration />
          </div>

          {/* Right Column: Clean Minimalist Auth Form */}
          <div className="lg:col-span-6 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white dark:bg-slate-900">
            <AuthForm />
          </div>
        </div>
      </div>
    </main>
  );
}
