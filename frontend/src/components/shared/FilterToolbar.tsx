"use client";

import React from "react";
import { RotateCcw } from "lucide-react";

export interface FilterToolbarProps {
  children: React.ReactNode;
  onReset?: () => void;
  showReset?: boolean;
  className?: string;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  children,
  onReset,
  showReset = false,
  className = "",
}) => {
  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center gap-3 ${className}`}
    >
      {children}

      {showReset && onReset && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 px-2 py-1.5 rounded transition-colors cursor-pointer self-end md:self-auto shrink-0"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
};
