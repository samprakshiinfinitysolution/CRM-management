'use client';

import React, { useState } from 'react';
import {
  UserCheck,
  Mail,
  Shield,
  Key,
  LogOut,
  Calendar,
  CheckCircle2,
  Building,
  Loader2,
} from 'lucide-react';
import { useAppSelector } from '@/store';
import { performLogout } from '@/lib/authService';
import LogOutPopUp from '@/components/LogOutPopUp';
import { UserRole } from '@/types/api.types';

export default function ProfilePage() {
  const { user } = useAppSelector((state) => state.auth);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await performLogout({ callBackend: true, redirectTo: '/login' });
    } catch {
      await performLogout({ callBackend: false, redirectTo: '/login' });
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  const isTL = user?.role === UserRole.TEAM_LEADER;
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-indigo-600" />
          <span>User Profile & Security</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review authenticated identity, security credentials, and role privileges
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white flex items-center justify-center font-bold text-xl shadow-md">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  {user?.name || 'Authorized User'}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    isTL
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {isTL ? 'TEAM LEADER' : 'SALES EXECUTIVE'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(true)}
            disabled={isLoggingOut}
            className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer"
          >
            {isLoggingOut ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LogOut className="w-3.5 h-3.5" />
            )}
            <span>Sign Out</span>
          </button>
        </div>

        {/* Identity Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <Shield className="w-5 h-5 text-indigo-600 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">
                Access Authorization
              </span>
              <span className="text-xs font-bold text-slate-800">
                {isTL
                  ? 'Full Supervisory & Lead Ingestion'
                  : 'Isolated Work Queue & Deals'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">
                Account Status
              </span>
              <span className="text-xs font-bold text-emerald-700">
                Active & Verified
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <Mail className="w-5 h-5 text-slate-500 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">
                Primary Identity
              </span>
              <span className="text-xs font-medium text-slate-700 truncate block">
                {user?.email}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <Key className="w-5 h-5 text-slate-500 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">
                Session Token
              </span>
              <span className="text-xs font-mono font-medium text-slate-700">
                Active JWT Bearer
              </span>
            </div>
          </div>
        </div>

        {/* Operational Security Notice */}
        <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
          <span className="font-bold block mb-1">Authoritative Backend Security</span>
          All sessions and permissions are validated server-side on every request. Tamper-evident activity logs record all state modifications and distribution transactions.
        </div>
      </div>

      <LogOutPopUp
        open={isLogoutModalOpen}
        setOpen={setIsLogoutModalOpen}
        onLogout={handleSignOut}
        onClose={() => setIsLogoutModalOpen(false)}
        isPending={isLoggingOut}
      />
    </div>
  );
}
