'use client';

import AuthHeader from '@/components/auth/AuthHeader';
import AuthModeTabs from '@/components/auth/AuthModeTabs';
import RoleSelector from '@/components/auth/RoleSelector';
import AuthForm from '@/components/auth/AuthForm';
import AuthFooter from '@/components/auth/AuthFooter';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, removeToken } from '@/lib/utils';
import { decodeJwt } from '@/lib/jwt';
import { UserRole } from '@/types/api.types';

export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const decoded = decodeJwt(token);
    if (!decoded) {
      removeToken();
      return;
    }

    if (decoded.role === UserRole.TEAM_LEADER) {
      router.replace('/team_leader');
    } else if (decoded.role === UserRole.SALES_EXECUTIVE) {
      router.replace('/sales_executive');
    }
  }, [router]);

  return (
    <main className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-crm-canvas text-crm-primary">
      <div className="w-full max-w-120 flex flex-col">
        {/* Brand & System Status Bar Header */}
        <AuthHeader />

        {/* Auth Mode Segmented Pill Switcher (RTK state) */}
        <AuthModeTabs />

        {/* Role Scope Switcher / Persona Context (RTK state) */}
        <RoleSelector />

        {/* Credentials Form (RTK state with dynamic code-split registration fields) */}
        <AuthForm />

        {/* Operational Guardrails Banner & Security Audit Footer */}
        <AuthFooter />
      </div>
    </main>
  );
}
