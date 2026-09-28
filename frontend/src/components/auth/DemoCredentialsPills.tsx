import React from 'react';

interface DemoCredentialsPillsProps {
  onFillCredentials: (role: 'tl' | 'exec') => void;
}

export default function DemoCredentialsPills({ onFillCredentials }: DemoCredentialsPillsProps) {
  return (
    <div className="flex flex-col gap-1 pb-3 border-b border-slate-100">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        Quick Pre-fill (Internal Sandbox)
      </span>
      <div className="flex items-center gap-2 overflow-x-auto py-1">
        <button
          type="button"
          onClick={() => onFillCredentials('tl')}
          className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-amber-500"></span> TL: teamleader@leadflow.io
        </button>
        <button
          type="button"
          onClick={() => onFillCredentials('exec')}
          className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-blue-500"></span> Rep: alex.sales@leadflow.io
        </button>
      </div>
    </div>
  );
}
