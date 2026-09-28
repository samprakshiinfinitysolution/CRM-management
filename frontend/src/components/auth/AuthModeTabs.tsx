'use client';

import React from 'react';
import { UserCheck, User } from 'lucide-react';
import { useAppDispatch, useAppSelector, setAuthMode } from '@/store';

export default function AuthModeTabs() {
  const dispatch = useAppDispatch();
  const authMode = useAppSelector((state) => state.auth.authMode);

  return (
    <div className="w-full bg-slate-200/80 p-1 rounded-xl flex items-center justify-between mb-5 shadow-inner">
      <button
        type="button"
        onClick={() => dispatch(setAuthMode('login'))}
        className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
          authMode === 'login'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <UserCheck className="w-4 h-4" />
        <span>Sign In</span>
      </button>
      <button
        type="button"
        onClick={() => dispatch(setAuthMode('register'))}
        className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
          authMode === 'register'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <User className="w-4 h-4" />
        <span>Request Access</span>
      </button>
    </div>
  );
}
