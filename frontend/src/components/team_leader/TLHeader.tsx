'use client';

import React, { useState } from 'react';
import { Bell, ChevronDown, LogOut, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAppSelector } from '@/store';
import { performLogout } from '@/lib/authService';

export default function TLHeader() {
  const { user } = useAppSelector((state) => state.auth);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await performLogout({ callBackend: true, redirectTo: '/' });
    } catch {
      await performLogout({ callBackend: false, redirectTo: '/' });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'TL';

  return (
    <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-crm-subtle shadow-xs">
      <div className="max-w-5xl mx-auto h-16 px-4 flex items-center justify-between gap-3">
        {/* Brand & Team Leader Context */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-crm-subtle flex items-center justify-center p-1.5 flex-shrink-0">
            <div className="w-full h-full rounded-lg bg-gradient-to-tr from-indigo-700 to-indigo-500 flex items-center justify-center text-white font-black text-sm shadow-inner">
              LF
            </div>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-crm-primary tracking-tight truncate leading-tight">
                LeadFlow
              </span>
              <span className="px-2 py-0.5 rounded-full bg-crm-warning text-crm-warning text-[10px] font-bold tracking-wide leading-none flex-shrink-0">
                TL/OPS
              </span>
            </div>
            <div className="flex items-center gap-1 cursor-pointer text-crm-muted hover:text-crm-primary transition-colors">
              <span className="text-xs font-medium truncate max-w-[120px]">Supervisor Workspace</span>
              <ChevronDown className="w-3.5 h-3.5 text-crm-muted" />
            </div>
          </div>
        </div>

        {/* Action Controls, Avatar & Logout */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => toast.info('System Alert: 184 leads pending assignment')}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-crm-secondary hover:bg-crm-muted relative active:scale-95 transition-all border border-crm-subtle"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white"></span>
          </button>

          <div
            className="w-9 h-9 rounded-xl bg-crm-dark text-crm-inverse flex items-center justify-center font-bold text-xs shadow-xs"
            title={`Logged in as ${user?.name || 'Team Leader'}`}
          >
            {initials}
          </div>

          <button
            type="button"
            aria-label="Sign Out"
            onClick={handleSignOut}
            disabled={isLoggingOut}
            title="Sign Out"
            className="h-9 px-2.5 flex items-center gap-1.5 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-crm-subtle transition-all text-xs font-semibold disabled:opacity-50"
          >
            {isLoggingOut ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
            ) : (
              <LogOut className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
