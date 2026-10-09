"use client";

import React from "react";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  icon,
  action,
  children,
  className,
  headerClassName,
  bodyClassName,
}) => {
  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white/90 p-5 sm:p-6 shadow-xs backdrop-blur-md transition-all duration-300 hover:border-slate-300 hover:shadow-md",
        "dark:border-slate-800/80 dark:bg-slate-900/90 dark:hover:border-slate-700/80 dark:hover:shadow-indigo-950/20",
        className
      )}
    >
      {/* Background soft glow gradient for antigravity feel */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/5 blur-2xl transition-opacity duration-500 group-hover:opacity-100 dark:bg-indigo-400/10" />

      {/* Card Header */}
      <div
        className={cn(
          "flex items-center justify-between pb-3",
          headerClassName
        )}
      >
        <div className="flex items-center gap-2.5">
          {icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100/80 dark:bg-indigo-950/60 dark:text-indigo-400 dark:border-indigo-900/60">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {action ? (
          action
        ) : (
          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors cursor-pointer"
            title="Options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Card Body */}
      <div className={cn("relative z-10 w-full flex-1 pt-2", bodyClassName)}>
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
