"use client";

import React from "react";
import { LogIn, UserPlus } from "lucide-react";
import { useAppDispatch, useAppSelector, setAuthMode } from "@/store";

export default function AuthModeTabs() {
  const dispatch = useAppDispatch();
  const authMode = useAppSelector((state) => state.auth.authMode);

  return (
    <div className="w-full bg-card/80 p-1 rounded-lg border border-slate-200/80 flex items-center justify-between mb-5">
      <button
        type="button"
        onClick={() => dispatch(setAuthMode("login"))}
        className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
          authMode === "login"
            ? "bg-card text-slate-900 dark:text-slate-100 shadow-sm border border-slate-200/50"
            : "text-slate-500 hover:text-slate-900"
        }`}
      >
        <LogIn className="w-3.5 h-3.5" />
        <span>Sign In</span>
      </button>
      <button
        type="button"
        onClick={() => dispatch(setAuthMode("register"))}
        className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
          authMode === "register"
            ? "bg-card text-slate-900 dark:text-slate-100 shadow-sm border border-slate-200/50"
            : "text-slate-500 hover:text-slate-900"
        }`}
      >
        <UserPlus className="w-3.5 h-3.5" />
        <span>Create Account</span>
      </button>
    </div>
  );
}
