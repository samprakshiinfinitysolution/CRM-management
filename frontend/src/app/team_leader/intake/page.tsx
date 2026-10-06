'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  IntakeHeader,
  IntakeModeTabs,
  IntakeStatsCards,
  SheetUploadZone,
  SheetPreviewTable,
  PreuploadedLeadsView,
  CreateLeadModal,
  StagedLeadRow,
} from '@/components/team_leader/intake';
import { useCommitImportMutation, useGetLeadsQuery } from '@/store';
import { handleApiError } from '@/lib/errorHandler';
import { downloadImportTemplate } from '@/lib/exportUtils';

export default function TeamLeaderIntakePage() {
  const [activeMode, setActiveMode] = useState<'preuploaded' | 'upload'>('preuploaded');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [stagedRows, setStagedRows] = useState<StagedLeadRow[]>([]);

  // Backend queries & mutations
  const [commitImport, { isLoading: isCommitting }] = useCommitImportMutation();
  const { data: leadsOverview, refetch: refetchLeads } = useGetLeadsQuery({ limit: 1 });
  const preuploadedCount = leadsOverview?.pagination?.total ?? 0;

  // Summary counts for staged upload
  const total = stagedRows.length;
  const valid = stagedRows.filter((r) => r.status === 'VALID').length;
  const duplicates = stagedRows.filter((r) => r.status === 'DUPLICATE').length;
  const invalid = stagedRows.filter((r) => r.status === 'INVALID').length;

  const handleFileSelect = (file: File | null, data: StagedLeadRow[]) => {
    setCurrentFile(file);
    setStagedRows(data);
  };

  const handleDownloadSample = async () => {
    await downloadImportTemplate(true);
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
      // Clear staged state and switch to pre-uploaded repository view
      setCurrentFile(null);
      setStagedRows([]);
      refetchLeads();
      setActiveMode('preuploaded');
    } catch (err: unknown) {
      handleApiError(err, 'Failed to commit leads');
    }
  };

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 pt-4 pb-24 flex flex-col gap-6">
      <IntakeHeader onDownloadSample={handleDownloadSample} />

      {/* Mode Switcher Tabs: Pre-uploaded Repository vs Upload Sheet */}
      <IntakeModeTabs
        activeMode={activeMode}
        onSelectMode={setActiveMode}
        preuploadedCount={preuploadedCount}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* Mode 1: Pre-uploaded Leads Repository View */}
      {activeMode === 'preuploaded' && (
        <PreuploadedLeadsView
          onSwitchToUpload={() => setActiveMode('upload')}
        />
      )}

      {/* Mode 2: Upload Sheet & Ingestion View */}
      {activeMode === 'upload' && (
        <div className="space-y-6">
          <SheetUploadZone
            currentFile={currentFile}
            onFileSelect={handleFileSelect}
          />

          {stagedRows.length > 0 && (
            <>
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
            </>
          )}
        </div>
      )}

      {/* Modal: Create Single Lead Manually */}
      <CreateLeadModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </main>
  );
}
