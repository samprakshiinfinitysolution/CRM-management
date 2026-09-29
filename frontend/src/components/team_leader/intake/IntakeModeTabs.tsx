"use client";

import React from "react";
import { Database, UploadCloud, PlusCircle } from "lucide-react";

interface IntakeModeTabsProps {
  activeMode: "preuploaded" | "upload";
  onSelectMode: (mode: "preuploaded" | "upload") => void;
  preuploadedCount?: number;
  onOpenCreateModal: () => void;
}

export const IntakeModeTabs: React.FC<IntakeModeTabsProps> = ({
  activeMode,
  onSelectMode,
  preuploadedCount = 0,
  onOpenCreateModal,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
      {/* Segmented Mode Switcher */}
      <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-xl border border-white/10 w-full sm:w-auto overflow-x-auto">
        <button
          type="button"
          onClick={() => onSelectMode("preuploaded")}
          className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeMode === "preuploaded"
              ? "bg-blue-600 text-card shadow-md"
              : "text-accent-foreground hover:text-accent-foreground/70 hover:bg-white/5"
          }`}
        >
          <Database className="w-3.5 h-3.5 shrink-0" />
          <span>Pre-Uploaded Repository</span>
          {preuploadedCount > 0 && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeMode === "preuploaded"
                  ? "bg-white/20 text-white"
                  : "bg-white/10 text-slate-300"
              }`}
            >
              {preuploadedCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onSelectMode("upload")}
          className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeMode === "upload"
              ? "bg-blue-600 text-card shadow-md"
              : "text-accent-foreground hover:text-accent-foreground/70 hover:bg-white/5"
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5 shrink-0" />
          <span>Upload Spreadsheet</span>
        </button>
      </div>

      {/* Action Button: Create Lead Manually */}
      <div className="flex items-center w-full sm:w-auto">
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-hover transition-all active:scale-95"
        >
          <PlusCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>Create Lead Manually</span>
        </button>
      </div>
    </div>
  );
};
