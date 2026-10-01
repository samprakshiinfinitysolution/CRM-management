"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import {
  useRegisterMutation,
  useLoginMutation,
  getAuthErrorMessage,
} from "@/lib/authService";
import {
  AtSign,
  X,
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

// Dynamic code splitting: lazy load RegisterFields so login-only users don't bundle it initially
const RegisterFields = dynamic(() => import("./RegisterFields"), {
  loading: () => (
    <div className="py-4 flex items-center justify-center gap-2 text-xs text-crm-muted">
      <Loader2 className="w-4 h-4 animate-spin text-(--crm-brand-primary)" />
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
  const [trustDevice, setTrustDevice] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // RTK Query Mutations
  const [registerUser, { isLoading: isRegisterLoading }] =
    useRegisterMutation();
  const [loginUser, { isLoading: isLoginLoading }] = useLoginMutation();

  const isLoading = isRegisterLoading || isLoginLoading;

  const fillCredentials = (role: "tl" | "exec") => {
    dispatch(setSelectedRole(role));
    if (role === "tl") {
      setEmail("teamleader@leadflow.io");
      setPassword("TL-LeadFlow#2025");
      setConfirmPassword("TL-LeadFlow#2025");
      setFullName("Marcus Sterling");
    } else {
      setEmail("alex.sales@leadflow.io");
      setPassword("SalesExec*9921");
      setConfirmPassword("SalesExec*9921");
      setFullName("Alex Rivera");
    }
    toast.info(
      `Pre-filled ${role === "tl" ? "Team Leader" : "Sales Executive"} sandbox credentials`,
    );
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
          result.error.issues[0]?.message || "Invalid registration details";
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
          result.error.issues[0]?.message || "Invalid login credentials";
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
      setToken(res.data.token);
      dispatch(
        setCredentials({
          user: res.data.user,
          token: res.data.token,
        }),
      );

      setIsRedirecting(true);
      toast.success(
        res.message || "Authenticated successfully! Redirecting...",
      );
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } else {
      setIsRedirecting(true);
      toast.success(
        res.message ||
          (authMode === "register"
            ? "Access authorization approved! User registered in CRM."
            : "Authenticated successfully! Redirecting..."),
      );
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    }
  };

  return (
    <form
      onSubmit={handleAuthSubmit}
      className="bg-crm-card rounded-2xl shadow-xs border border-crm-subtle p-5 sm:p-6 mb-4 flex flex-col gap-4"
    >
      {/* Quick Demo Credential Pills */}
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
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-crm-primary flex items-center gap-1">
            <span>Enterprise Work Email</span>
            <span className="text-rose-500">*</span>
          </label>
          <span className="text-[10px] font-bold text-(--crm-brand-primary) tracking-wider">
            @COMPANY.COM
          </span>
        </div>
        <div className="relative flex items-center">
          <AtSign className="w-4 h-4 text-crm-muted absolute left-3 pointer-events-none" />
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@enterprise.com"
            className="w-full h-10 pl-9 pr-8 rounded-xl bg-crm-subtle border border-crm-subtle text-crm-primary placeholder:text-crm-muted text-sm focus:bg-white focus:outline-none focus:border-(--crm-brand-primary) focus:ring-2 focus:ring-indigo-500/15 transition-all shadow-2xs"
          />
          {email && (
            <button
              type="button"
              onClick={() => setEmail("")}
              className="absolute right-2.5 text-crm-muted hover:text-crm-primary transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <span className="text-[11px] text-crm-muted">
          SSO mapped to Google Workspace / Microsoft Entra ID.
        </span>
      </div>

      {/* Password Field */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-crm-primary flex items-center gap-1">
            <span>
              {authMode === "login"
                ? "Secure Access Key"
                : "Define Account Password"}
            </span>
            <span className="text-rose-500">*</span>
          </label>
          {authMode === "login" && (
            <a
              href="#forgot"
              className="text-xs font-semibold text-(--crm-brand-primary) hover:underline"
            >
              Forgot key?
            </a>
          )}
        </div>
        <div className="relative flex items-center">
          <Lock className="w-4 h-4 text-crm-muted absolute left-3 pointer-events-none" />
          <input
            required
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full h-10 pl-9 pr-10 rounded-xl bg-crm-subtle border border-crm-subtle text-crm-primary placeholder:text-crm-muted text-sm focus:bg-white focus:outline-none focus:border-(--crm-brand-primary) focus:ring-2 focus:ring-indigo-500/15 transition-all tracking-wider shadow-2xs"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2.5 text-crm-muted hover:text-crm-primary p-1 cursor-pointer transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {authMode === "register" && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-crm-primary flex items-center gap-1">
              <span>Confirm Account Password</span>
              <span className="text-rose-500">*</span>
            </label>
          </div>
          <div className="relative flex items-center">
            <Lock className="w-4 h-4 text-crm-muted absolute left-3 pointer-events-none" />
            <input
              required
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="w-full h-10 pl-9 pr-10 rounded-xl bg-crm-subtle border border-crm-subtle text-crm-primary placeholder:text-crm-muted text-sm focus:bg-white focus:outline-none focus:border-(--crm-brand-primary) focus:ring-2 focus:ring-indigo-500/15 transition-all tracking-wider shadow-2xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 text-crm-muted hover:text-crm-primary p-1 cursor-pointer transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Device Trust & Biometric Checkbox */}
      <div className="flex items-start gap-2.5 pt-1">
        <input
          type="checkbox"
          id="trust-device"
          checked={trustDevice}
          onChange={(e) => setTrustDevice(e.target.checked)}
          className="w-4 h-4 mt-0.5 rounded text-(--crm-brand-primary) focus:ring-(--crm-brand-primary) border-crm-subtle"
        />
        <div className="flex flex-col">
          <label
            htmlFor="trust-device"
            className="text-xs font-semibold text-crm-primary cursor-pointer"
          >
            Trust this device & enable biometric rapid pass
          </label>
          <p className="text-[11px] text-crm-muted">
            Maintains a tamper-resistant 30-day authenticated terminal token.
          </p>
        </div>
      </div>

      {/* Primary Action Button */}
      <button
        type="submit"
        disabled={isLoading || isRedirecting}
        className="w-full h-11 bg-(--crm-brand-primary) hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-xs flex items-center justify-center gap-2 mt-2 transition-all active:scale-[0.99] disabled:opacity-70 cursor-pointer"
      >
        {isLoading || isRedirecting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>
              {isRedirecting
                ? "Authenticated! Redirecting in 2s..."
                : "Connecting to IAM Gateway..."}
            </span>
          </>
        ) : (
          <>
            <span>
              {authMode === "login"
                ? "Sign In to LeadFlow Workspace"
                : "Submit Access Authorization Request"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
