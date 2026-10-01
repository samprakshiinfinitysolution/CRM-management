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
  // Budget is client-side. Search, source, and priority/urgency drive the server query.
  const [selectedMinBudget, setSelectedMinBudget] = useState('ALL');

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
    // Server-driven filter state
    searchTerm,
    setSearchTerm,
    selectedSource,
    setSelectedSource,
    selectedPriority,
    setSelectedPriority,
  } = useLeadDistribution();

  // Budget is client-side. Search, source, and priority are already applied server-side inside the hook's RTK Query call.
  const filteredLeads = useMemo(() => {
    return unassignedLeads.filter((lead) => {
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

      return matchesBudget;
    });
  }, [unassignedLeads, selectedMinBudget]);

  const activeFilterCount = useMemo(() => {
    return (
      (searchTerm ? 1 : 0) +
      (selectedSource !== 'ALL' ? 1 : 0) +
      (selectedMinBudget !== 'ALL' ? 1 : 0) +
      (selectedPriority !== 'ALL' ? 1 : 0)
    );
  }, [searchTerm, selectedSource, selectedMinBudget, selectedPriority]);

  // Handle auto-switch: when user checks leads in Step 1, it auto-switches factor to MANUAL_PICK
  const handleToggleLeadWithStep = (id: string) => {
    handleToggleLead(id);
  };

  const totalEstValue = useMemo(() => {
    if (selectedLeadIds.length === 0) return undefined;
    const selectedLeads = unassignedLeads.filter((l) => selectedLeadIds.includes(l.id));
    const total = selectedLeads.reduce((sum, l) => {
      const budget =
        typeof l.budget === 'number'
          ? l.budget
          : parseFloat(String(l.budget || 0).replace(/[^0-9.-]+/g, '')) || 0;
      return sum + budget;
    }, 0);
    if (total <= 0) return undefined;
    if (total >= 10000000) return `₹${(total / 10000000).toFixed(1)}Cr`;
    if (total >= 100000) return `₹${(total / 100000).toFixed(1)}L`;
    return `₹${total.toLocaleString('en-IN')}`;
  }, [unassignedLeads, selectedLeadIds]);

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
            selectedUrgency={selectedPriority}
            onUrgencyChange={setSelectedPriority}
            onResetFilters={() => {
              setSelectedSource('ALL');
              setSelectedMinBudget('ALL');
              setSelectedPriority('ALL');
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
        selectedLeadCount={selectedLeadIds.length}
        totalPoolCount={totalUnassignedCount}
        totalEstValue={totalEstValue}
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
