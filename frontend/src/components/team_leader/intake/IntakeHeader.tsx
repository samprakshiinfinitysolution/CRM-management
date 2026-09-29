'use client';

import React from 'react';
import { UploadCloud, Download, FileSpreadsheet } from 'lucide-react';

interface IntakeHeaderProps {
  onDownloadSample: () => void;
}

export const IntakeHeader: React.FC<IntakeHeaderProps> = ({ onDownloadSample }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 banner-effect p-4">
      <div>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-accent-foreground tracking-tight">
              Lead Bulk Intake & Ingestion
            </h1>
            <p className="text-sm text-accent-foreground/50">
              Upload Excel or CSV sheets to stage, validate, and preview leads
              before ingesting into the CRM pipeline.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onDownloadSample}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-crm-brand-hover text-hover transition-all active:scale-95"
        >
          <Download className="w-4 h-4 text-crm-brand-hover" />
          <span>Download Sample Template</span>
        </button>
      </div>
    </div>
  );
};
