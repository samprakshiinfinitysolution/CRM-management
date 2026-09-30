'use client';

import React, { useState, useMemo } from 'react';
import {
  DistributeStepperHeader,
  LeadCriteriaMatrix,
  LeadCardStream,
  DistributeModeSelector,
  ExecutiveQuotaSelector,
  DistributionSummaryCard,
  ReassignRecallConsole,
  DistributionSuccessModal,
  DistributeStickyCommandBar,
  useLeadDistribution,
} from '@/components/team_leader/distribute';
import { Pagination } from '@/components/ui/Pagination';

export default function TeamLeaderDistributePage() {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState('ALL');
  const [selectedMinBudget, setSelectedMinBudget] = useState('ALL');
  const [selectedUrgency, setSelectedUrgency] = useState('ALL');

  const {
    activeMode,
    handleSelectMode,
    unassignedLeads,
    executives,
    assignedLeads,
    selectedLeadIds,
    selectedExecutiveIds,
    handleToggleLead,
    handleSelectAllLeads,
    handleClearLeadSelection,
    handleToggleExecutive,
    handleSelectAllExecutives,
    handleDeselectAllExecutives,
    quotas,
    handleUpdateQuota,
    effectiveTotalLeads,
    selectedExecCount,
    equalSharePerExecutive,
    currentAllocatedCount,
    currentRemainderCount,
    isValid,
    validationMessage,
    isSubmitting,
    totalUnassignedCount,
    handleExecuteDistribution,
    handleReassignLeads,
    handleRecallLeads,
    isSuccessModalOpen,
    setIsSuccessModalOpen,
    lastAllocations,
    lastDistributedCount,
    page,
    limit,
    totalPages,
    setPage,
    setLimit,
  } = useLeadDistribution();

  // Client-side criteria filtering preview
  const filteredLeads = useMemo(() => {
    return unassignedLeads.filter((lead) => {
      const matchesSearch =
        !searchTerm ||
        lead.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.leadCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.mobile.includes(searchTerm) ||
        (lead.companyName && lead.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lead.city && lead.city.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesSource =
        selectedSource === 'ALL' ||
        (lead.leadSource && lead.leadSource.toUpperCase().includes(selectedSource.toUpperCase())) ||
        (lead.source && lead.source.toUpperCase().includes(selectedSource.toUpperCase()));

      const matchesUrgency =
        selectedUrgency === 'ALL' ||
        (selectedUrgency === 'URGENT_HIGH' && (lead.priority === 'URGENT' || lead.priority === 'HIGH')) ||
        lead.priority === selectedUrgency;

      let matchesBudget = true;
      if (selectedMinBudget !== 'ALL') {
        const leadBudget =
          typeof lead.budget === 'number'
            ? lead.budget
            : lead.budget
            ? parseFloat(String(lead.budget).replace(/[^0-9.-]+/g, ''))
            : 0;
        if (selectedMinBudget === '1L') matchesBudget = leadBudget >= 100000;
        else if (selectedMinBudget === '2.5L') matchesBudget = leadBudget >= 250000;
        else if (selectedMinBudget === '5L') matchesBudget = leadBudget >= 500000;
      }

      return matchesSearch && matchesSource && matchesUrgency && matchesBudget;
    });
  }, [unassignedLeads, searchTerm, selectedSource, selectedUrgency, selectedMinBudget]);

  const activeFilterCount = useMemo(() => {
    return (
      (searchTerm ? 1 : 0) +
      (selectedSource !== 'ALL' ? 1 : 0) +
      (selectedMinBudget !== 'ALL' ? 1 : 0) +
      (selectedUrgency !== 'ALL' ? 1 : 0)
    );
  }, [searchTerm, selectedSource, selectedMinBudget, selectedUrgency]);

  // Handle auto-switch: when user checks leads in Step 1, it auto-switches factor to MANUAL_PICK
  const handleToggleLeadWithStep = (id: string) => {
    handleToggleLead(id);
  };

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 pt-4 pb-32 flex flex-col gap-6">
      {/* 1. Two-Step Stepper Header */}
      <DistributeStepperHeader
        currentStep={currentStep}
        onSelectStep={setCurrentStep}
        selectedCount={selectedLeadIds.length}
      />

      {/* STEP 1: Select Leads & Criteria Matrix */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <LeadCriteriaMatrix
            totalUnallocated={totalUnassignedCount}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            activeFilterCount={activeFilterCount}
            selectedSource={selectedSource}
            onSourceChange={setSelectedSource}
            selectedMinBudget={selectedMinBudget}
            onMinBudgetChange={setSelectedMinBudget}
            selectedUrgency={selectedUrgency}
            onUrgencyChange={setSelectedUrgency}
            onResetFilters={() => {
              setSelectedSource('ALL');
              setSelectedMinBudget('ALL');
              setSelectedUrgency('ALL');
              setSearchTerm('');
            }}
            filteredCount={filteredLeads.length}
          />

          <LeadCardStream
            leads={filteredLeads}
            selectedLeadIds={selectedLeadIds}
            onToggleLead={handleToggleLeadWithStep}
            onSelectTop30={() => handleSelectAllLeads(filteredLeads.slice(0, 30).map((l) => l.id))}
            onSelectAll={() => handleSelectAllLeads(filteredLeads.map((l) => l.id))}
            onClearSelection={handleClearLeadSelection}
            onAdvanceToStep2={() => setCurrentStep(2)}
            activeRepsCount={executives.length}
          />

          {/* Pagination */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3 shadow-xs">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              pageSize={limit}
              onPageSizeChange={setLimit}
              totalItems={totalUnassignedCount}
            />
          </div>
        </div>
      )}

      {/* STEP 2: Assign & Rule (Equal Split, Custom Split, Manual Split) */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Strategy Mode Switcher Tabs */}
          <DistributeModeSelector
            activeMode={activeMode}
            onSelectMode={handleSelectMode}
            unassignedCount={selectedLeadIds.length > 0 ? selectedLeadIds.length : totalUnassignedCount}
          />

          {activeMode === 'REASSIGN_RECALL' ? (
            <ReassignRecallConsole
              executives={executives}
              assignedLeads={assignedLeads}
              onReassignLeads={handleReassignLeads}
              handleSelectAllExecutives={handleSelectAllExecutives}
              handleDeselectAllExecutives={handleDeselectAllExecutives}
              onRecallLeads={handleRecallLeads}
              isProcessing={isSubmitting}
            />
          ) : (
            <>
              {/* Executive Workload & Quota Allocation Roster */}
              <ExecutiveQuotaSelector
                executives={executives}
                mode={activeMode}
                selectedExecutiveIds={selectedExecutiveIds}
                quotas={quotas}
                onToggleExecutive={handleToggleExecutive}
                onUpdateQuota={handleUpdateQuota}
                onSelectAllExecutives={handleSelectAllExecutives}
                onDeselectAllExecutives={handleDeselectAllExecutives}
                equalSharePerExecutive={equalSharePerExecutive}
                totalLeadsToDistribute={effectiveTotalLeads}
              />

              {/* Live Dry-Run Mathematical Summary & Allocation Card */}
              <DistributionSummaryCard
                mode={activeMode}
                totalLeadsToDistribute={selectedLeadIds.length > 0 ? selectedLeadIds.length : totalUnassignedCount}
                selectedExecutiveCount={selectedExecCount}
                allocatedCount={currentAllocatedCount}
                remainderCount={currentRemainderCount}
                isSubmitting={isSubmitting}
                onExecuteDistribution={handleExecuteDistribution}
                isValid={isValid}
                validationMessage={validationMessage}
              />
            </>
          )}
        </div>
      )}

      {/* Sticky Real-Time Bottom Command Bar */}
      <DistributeStickyCommandBar
        currentStep={currentStep}
        selectedLeadCount={selectedLeadIds.length > 0 ? selectedLeadIds.length : totalUnassignedCount}
        totalEstValue="₹2.4Cr"
        onReset={handleClearLeadSelection}
        onNextStep={() => setCurrentStep(2)}
        onPrevStep={() => setCurrentStep(1)}
        onConfirmDistribute={handleExecuteDistribution}
        isSubmitting={isSubmitting}
        isValid={isValid}
      />

      {/* Confirmation Success Modal */}
      <DistributionSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        totalDistributed={lastDistributedCount}
        allocations={lastAllocations}
        mode={activeMode}
      />
    </main>
  );
}
