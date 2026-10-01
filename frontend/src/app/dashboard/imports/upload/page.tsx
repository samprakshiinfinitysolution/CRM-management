'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UploadCloud, Download } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/types/api.types';
import {
  IntakeStatsCards,
  SheetUploadZone,
  SheetPreviewTable,
  StagedLeadRow,
} from '@/components/team_leader/intake';
import { useCommitImportMutation, useGetLeadsQuery } from '@/store';
import { handleApiError } from '@/lib/errorHandler';

export default function ImportUploadPage() {
  const router = useRouter();
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [stagedRows, setStagedRows] = useState<StagedLeadRow[]>([]);

  const [commitImport, { isLoading: isCommitting }] = useCommitImportMutation();
  const { refetch: refetchLeads } = useGetLeadsQuery({ limit: 1 });

  const total = stagedRows.length;
  const valid = stagedRows.filter((r) => r.status === 'VALID').length;
  const duplicates = stagedRows.filter((r) => r.status === 'DUPLICATE').length;
  const invalid = stagedRows.filter((r) => r.status === 'INVALID').length;

  const handleFileSelect = (file: File | null, data: StagedLeadRow[]) => {
    setCurrentFile(file);
    setStagedRows(data);
  };

  const handleDownloadSample = () => {
    const sampleData = [
      {
        'Customer Name': 'Rahul Sharma',
        'Mobile': '+91 98765 43210',
        'Email': 'rahul.sharma@example.com',
        'City': 'Mumbai',
        'Requirement': 'Enterprise CRM Suite',
        'Budget': '₹1,50,000',
        'Source': 'WEBSITE',
      },
      {
        'Customer Name': 'Priya Patel',
        'Mobile': '+91 91234 56789',
        'Email': 'priya.p@techsolutions.com',
        'City': 'Ahmedabad',
        'Requirement': 'Lead Distribution & Telephony',
        'Budget': '₹2,00,000',
        'Source': 'CAMPAIGN',
      },
      {
        'Customer Name': 'Amit Verma',
        'Mobile': '+91 98111 22334',
        'Email': 'amit.v@vermacorp.in',
        'City': 'Delhi NCR',
        'Requirement': 'Sales Automation Module',
        'Budget': '₹85,000',
        'Source': 'REFERRAL',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    ws['!cols'] = [
      { wch: 20 },
      { wch: 18 },
      { wch: 25 },
      { wch: 15 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sample Leads');
    XLSX.writeFile(wb, 'CRM_Lead_Bulk_Import_Sample.xlsx');
    toast.success('Sample template downloaded');
  };

  const handleCommitIngest = async () => {
    if (valid === 0) {
      toast.error('No valid leads available to ingest');
      return;
    }

    try {
      const res = await commitImport({
        fileName: currentFile?.name || 'leads_import.xlsx',
        rows: stagedRows,
        skipDuplicates: true,
      }).unwrap();

      toast.success(
        res?.message ||
          `Successfully ingested ${res?.data?.importedCount ?? valid} leads into unassigned pool!`
      );
      refetchLeads();
      router.push('/dashboard/leads');
    } catch (err: unknown) {
      handleApiError(err, 'Failed to commit leads');
    }
  };

  return (
    <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER]}>
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/imports"
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-indigo-600" />
                <span>Upload & Stage Leads Spreadsheet</span>
              </h1>
              <p className="text-xs text-slate-500">
                Drag-and-drop your .xlsx / .csv file for instant schema validation and duplicate detection
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadSample}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Download Sample Template</span>
          </button>
        </div>

        {/* Upload Zone */}
        <SheetUploadZone
          currentFile={currentFile}
          onFileSelect={handleFileSelect}
        />

        {/* Staged Data Preview & Verification */}
        {stagedRows.length > 0 && (
          <div className="space-y-6">
            <IntakeStatsCards
              total={total}
              valid={valid}
              duplicates={duplicates}
              invalid={invalid}
            />

            <SheetPreviewTable
              rows={stagedRows}
              onCommit={handleCommitIngest}
              isCommitting={isCommitting}
            />
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
