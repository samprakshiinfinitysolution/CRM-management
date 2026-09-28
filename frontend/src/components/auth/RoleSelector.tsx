'use client';

import React from 'react';
import { Shield, UserCheck } from 'lucide-react';
import { useAppDispatch, useAppSelector, setSelectedRole } from '@/store';

export default function RoleSelector() {
  const dispatch = useAppDispatch();
  const selectedRole = useAppSelector((state) => state.auth.selectedRole);

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Access Scope & Privilege
        </label>
        <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
          Live Routing
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {/* Team Leader Option */}
        <button
          type="button"
          onClick={() => dispatch(setSelectedRole('tl'))}
          className={`p-3 rounded-xl bg-white border text-left transition-all ${
            selectedRole === 'tl'
              ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/30 shadow-sm'
              : 'border-slate-200 hover:border-slate-300 opacity-80'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <span className="text-sm font-bold text-slate-900">Team Leader</span>
            <span className="bg-amber-100 text-amber-900 text-[9px] font-extrabold px-1.5 py-0.5 rounded">
              OPS / LEAD
            </span>
          </div>
          <p className="text-xs text-slate-500 line-clamp-2">
            Excel pipeline intake, lead allocation & SLA overview
          </p>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-indigo-600">
            <Shield className="w-3.5 h-3.5" /> Full Supervisor Scope
          </div>
        </button>

        {/* Sales Exec Option */}
        <button
          type="button"
          onClick={() => dispatch(setSelectedRole('exec'))}
          className={`p-3 rounded-xl bg-white border text-left transition-all ${
            selectedRole === 'exec'
              ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/30 shadow-sm'
              : 'border-slate-200 hover:border-slate-300 opacity-80'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <span className="text-sm font-bold text-slate-900">Sales Exec</span>
            <span className="bg-blue-100 text-blue-900 text-[9px] font-extrabold px-1.5 py-0.5 rounded">
              DIRECT SALES
            </span>
          </div>
          <p className="text-xs text-slate-500 line-clamp-2">
            Assigned lead pool, follow-up queues & call logging
          </p>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-slate-500">
            <UserCheck className="w-3.5 h-3.5" /> Field & Desk Queue
          </div>
        </button>
      </div>
    </div>
  );
}
