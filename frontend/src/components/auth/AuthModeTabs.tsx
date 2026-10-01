"use client";

import React from "react";
import { UserCheck, User } from "lucide-react";
import { useAppDispatch, useAppSelector, setAuthMode } from "@/store";

export default function AuthModeTabs() {
  const dispatch = useAppDispatch();
  const authMode = useAppSelector((state) => state.auth.authMode);

  return (
    <div className="w-full bg-crm-muted p-1 rounded-xl border border-crm-subtle flex items-center justify-between mb-4 shadow-2xs">
      <button
        type="button"
        onClick={() => dispatch(setAuthMode("login"))}
        className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
          authMode === "login"
            ? "bg-white text-crm-primary shadow-xs font-semibold"
            : "text-crm-muted hover:text-crm-primary"
        }`}
      >
        <UserCheck className="w-3.5 h-3.5" />
        <span>Sign In</span>
      </button>
      <button
        type="button"
        onClick={() => dispatch(setAuthMode("register"))}
        className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
          authMode === "register"
            ? "bg-white text-crm-primary shadow-xs font-semibold"
            : "text-crm-muted hover:text-crm-primary"
        }`}
      >
        <User className="w-3.5 h-3.5" />
        <span>Request Access</span>
      </button>
    </div>
  );
}
