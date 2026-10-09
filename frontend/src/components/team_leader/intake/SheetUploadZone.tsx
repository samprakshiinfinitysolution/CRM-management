"use client";

import React, { useRef, useState } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  X,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { usePostImportFileMutation } from "@/store";
import { handleApiError } from "@/lib/errorHandler";

export interface StagedLeadRow {
  id: string;
  rowNumber?: number;
  customerName: string;
  mobile: string;
  alternateMobile?: string | null;
  email?: string;
  companyName?: string | null;
  city?: string;
  requirement?: string;
  budget?: string;
  source?: string;
  leadSource?: string | null;
  status: "VALID" | "DUPLICATE" | "INVALID";
  validationNote?: string;
}

interface SheetUploadZoneProps {
  currentFile: File | null;
  onFileSelect: (file: File | null, data: StagedLeadRow[]) => void;
}

export const SheetUploadZone: React.FC<SheetUploadZoneProps> = ({
  currentFile,
  onFileSelect,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [postImportFile, { isLoading: isPostImportFilePending }] =
    usePostImportFileMutation();

  const isBusy = isProcessing || isPostImportFilePending;

  const processFile = async (file: File) => {
    // Validate file type before parsing
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];
    if (
      !validTypes.includes(file.type) &&
      !file.name.endsWith(".csv") &&
      !file.name.endsWith(".xlsx") &&
      !file.name.endsWith(".xls")
    ) {
      toast.error(
        "Invalid file type. Please upload a .xlsx, .xls, or .csv file.",
      );
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await postImportFile(formData).unwrap();
      const rawRows = res?.data?.rows || [];

      const formattedRows: StagedLeadRow[] = rawRows.map((r, idx) => ({
        id: r.id || `staged-${r.rowNumber || idx + 1}-${Date.now()}`,
        rowNumber: r.rowNumber,
        customerName: r.customerName || "N/A",
        mobile: r.mobile || "",
        alternateMobile: r.alternateMobile,
        email: r.email || undefined,
        companyName: r.companyName,
        city: r.city || undefined,
        requirement: r.requirement || undefined,
        budget:
          r.budget !== null && r.budget !== undefined
            ? String(r.budget)
            : undefined,
        source: r.source || r.leadSource || "EXCEL",
        leadSource: r.leadSource,
        status: r.status,
        validationNote: r.validationNote || undefined,
      }));

      onFileSelect(file, formattedRows);
      toast.success(
        res?.message ||
          `Parsed and extracted ${formattedRows.length} rows from ${file.name}`,
      );
    } catch (err: unknown) {
      handleApiError(
        err,
        "Failed to parse spreadsheet. Please ensure a valid .xlsx or .csv file.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null, []);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    // Moving drag events to the wrapper lets users drop files even if a file is already loaded
    <div
      className="w-full"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleInputChange}
      />

      {!currentFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`p-8 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer border-2 rounded-lg ${
            isDragging
              ? "border-blue-500 bg-blue-500/10"
              : "border-slate-700 hover:border-slate-500"
          }`}
        >
          <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 mb-3">
            {isBusy ? (
              <RefreshCw className="w-7 h-7 animate-spin" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>
          <h3 className="text-base font-semibold text-accent-foreground mb-1">
            {isBusy
              ? "Processing spreadsheet..."
              : "Click or Drag & Drop spreadsheet here"}
          </h3>
          <p className="text-xs text-slate-400 mb-4 max-w-md">
            Supports{" "}
            <span className="text-blue-400 font-medium">.xlsx, .xls, .csv</span>{" "}
            files with columns: Customer Name, Mobile, Email, City, Requirement,
            Budget, Source.
          </p>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-card/5 border border-white/10 text-xs font-medium text-accent-foreground/50">
              Browse from computer
            </span>
          </div>
        </div>
      ) : (
        <div
          className={`p-5 rounded-lg bg-card/3 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isDragging
              ? "border-blue-500 bg-blue-500/10 animate-pulse"
              : "border-white/10"
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
              {isBusy ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-accent-foreground truncate max-w-xs sm:max-w-md">
                  {isBusy ? "Reading file..." : currentFile.name}
                </h4>
                {!isBusy && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle className="w-3 h-3" /> Ready
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {(currentFile.size / 1024).toFixed(1)} KB •{" "}
                {isDragging
                  ? "Drop to replace file"
                  : "Drag a new file or click replace"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-lg bg-card/5 hover:bg-card/10 border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition-all disabled:opacity-50"
            >
              Replace Sheet
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={handleRemove}
              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 transition-all disabled:opacity-50"
              title="Remove File"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
