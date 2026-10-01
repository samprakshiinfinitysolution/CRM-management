"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { getAuthErrorMessage } from "@/lib/authService";
import {
  useRegisterMutation,
  useLoginMutation,
} from "@/store/api/authApi";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
} from "lucide-react";
import DemoCredentialsPills from "./DemoCredentialsPills";
import { registerSchema, loginSchema, setToken } from "@/lib/utils";
import { UserRole, AuthResponse } from "@/types/api.types";
import {
  useAppDispatch,
  useAppSelector,
  setSelectedRole,
  setCredentials,
} from "@/store";
import { useRouter } from "next/navigation";

const RegisterFields = dynamic(() => import("./RegisterFields"), {
  loading: () => (
    <div className="py-2 flex items-center justify-center gap-2 text-xs text-slate-500">
      <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
      <span>Loading registration fields...</span>
    </div>
  ),
  ssr: true,
});

export default function AuthForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { authMode, selectedRole } = useAppSelector((state) => state.auth);

  // Form Fields State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("teamleader@leadflow.io");
  const [password, setPassword] = useState("TL-LeadFlow#2025");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // RTK Query Mutations
  const [registerUser, { isLoading: isRegisterLoading }] = useRegisterMutation();
  const [loginUser, { isLoading: isLoginLoading }] = useLoginMutation();

  const isLoading = isRegisterLoading || isLoginLoading;

  const fillCredentials = (role: "tl" | "exec") => {
    dispatch(setSelectedRole(role));
    if (role === "tl") {
      setEmail("teamleader@leadflow.io");
      setPassword("TL-LeadFlow#2025");
      setConfirmPassword("TL-LeadFlow#2025");
      setFullName("Marcus Sterling");
      toast.success("Filled Team Leader credentials");
    } else {
      setEmail("alex.sales@leadflow.io");
      setPassword("SalesExec*9921");
      setConfirmPassword("SalesExec*9921");
      setFullName("Alex Rivera");
      toast.success("Filled Sales Executive credentials");
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const roleEnum =
      selectedRole === "tl" ? UserRole.TEAM_LEADER : UserRole.SALES_EXECUTIVE;

    if (authMode === "register") {
      const input = {
        name:
          fullName.trim() ||
          (selectedRole === "tl" ? "Marcus Sterling" : "Alex Rivera"),
        email: email.trim(),
        confirmPassword,
        password,
        role: roleEnum,
      };

      const result = registerSchema.safeParse(input);
      if (!result.success) {
        const errorMsg =
          result.error.issues[0]?.message || "Please check your registration details";
        toast.error(errorMsg);
        return;
      }

      try {
        const res = await registerUser({
          name: result.data.name,
          email: result.data.email,
          password: result.data.password,
          role: result.data.role,
        }).unwrap();

        redirectTo(res);
      } catch (err) {
        toast.error(getAuthErrorMessage(err));
      }
    } else {
      const loginInput = {
        email: email.trim(),
        password,
      };

      const result = loginSchema.safeParse(loginInput);
      if (!result.success) {
        const errorMsg =
          result.error.issues[0]?.message || "Please enter a valid email and password";
        toast.error(errorMsg);
        return;
      }

      try {
        const res = await loginUser({
          email: result.data.email,
          password: result.data.password,
        }).unwrap();

        redirectTo(res);
      } catch (err) {
        setIsRedirecting(false);
        toast.error(getAuthErrorMessage(err));
      }
    }
  };

  const redirectTo = (res: AuthResponse) => {
    if (res.data?.user && res.data?.token) {
      setToken(res.data.token, rememberMe ? 30 : 1);
      dispatch(
        setCredentials({
          user: res.data.user,
          token: res.data.token,
        }),
      );

      setIsRedirecting(true);
      toast.success(
        res.message || `Welcome back, ${res.data.user.name || "User"}!`
      );
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } else {
      setIsRedirecting(true);
      toast.success(
        res.message ||
          (authMode === "register"
            ? "Account created successfully! Redirecting..."
            : "Welcome back! Redirecting...")
      );
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    }
  };

  return (
    <form
      onSubmit={handleAuthSubmit}
      noValidate
      className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sm:p-7 flex flex-col gap-4"
    >
      {/* Quick Demo Pre-fill */}
      <DemoCredentialsPills onFillCredentials={fillCredentials} />

      {/* Dynamic Registration Fields */}
      {authMode === "register" && (
        <RegisterFields
          fullName={fullName}
          onFullNameChange={setFullName}
        />
      )}

      {/* Work Email */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="auth-email"
          className="text-xs font-semibold text-slate-700 flex items-center justify-between"
        >
          <span>Work Email</span>
          <span className="text-[11px] text-slate-400 font-normal">e.g. name@company.com</span>
        </label>
        <div className="relative flex items-center">
          <Mail className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            id="auth-email"
            name="email"
            autoComplete="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15 transition-all"
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="auth-password"
            className="text-xs font-semibold text-slate-700"
          >
            Password
          </label>
          {authMode === "login" && (
            <a
              href="#forgot"
              onClick={(e) => {
                e.preventDefault();
                toast.info("Please contact your CRM administrator to reset your password.");
              }}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              Forgot password?
            </a>
          )}
        </div>
        <div className="relative flex items-center">
          <Lock className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            id="auth-password"
            name="password"
            autoComplete={authMode === "login" ? "current-password" : "new-password"}
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full h-10 pl-9 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2.5 text-slate-400 hover:text-slate-700 p-1 cursor-pointer transition-colors"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Confirm Password (only on register) */}
      {authMode === "register" && (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="auth-confirm-password"
            className="text-xs font-semibold text-slate-700"
          >
            Confirm Password
          </label>
          <div className="relative flex items-center">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              id="auth-confirm-password"
              name="confirmPassword"
              autoComplete="new-password"
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full h-10 pl-9 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15 transition-all"
            />
          </div>
        </div>
      )}

      {/* Remember me Checkbox */}
      <div className="flex items-center gap-2 pt-0.5">
        <input
          type="checkbox"
          id="remember-me"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
        />
        <label
          htmlFor="remember-me"
          className="text-xs font-medium text-slate-600 cursor-pointer select-none"
        >
          Remember my session on this device
        </label>
      </div>

      {/* Submit Action Button */}
      <button
        type="button"
        onClick={handleAuthSubmit}
        disabled={isLoading || isRedirecting}
        className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-xs flex items-center justify-center gap-2 mt-2 transition-all active:scale-[0.99] disabled:opacity-75 cursor-pointer"
      >
        {isLoading || isRedirecting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>
              {isRedirecting
                ? "Welcome back! Redirecting..."
                : "Signing you in..."}
            </span>
          </>
        ) : (
          <>
            <span>
              {authMode === "login"
                ? "Sign in to LeadFlow"
                : "Create your account"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
