'use client';

import React, { useState, useMemo } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/types/api.types';
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
  ExecutiveSelectorStep,
  useLeadDistribution,
} from '@/components/team_leader/distribute';
import { Pagination } from '@/components/ui/Pagination';

export default function CreateDistributionPage() {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
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
    handleToggleExecutiveSelection,
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
    isExecutivesLoading,
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
    searchTerm,
    setSearchTerm,
    selectedSource,
    setSelectedSource,
    selectedPriority,
    setSelectedPriority,
  } = useLeadDistribution();

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
    <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER]}>
      <div className="flex flex-col gap-6 pb-28">
        {/* Two-Step Stepper Header */}
        <DistributeStepperHeader
          currentStep={currentStep}
          onSelectStep={setCurrentStep}
          selectedExecCount={selectedExecutiveIds.length}
          totalExecCount={executives.length}
          selectedLeadCount={selectedLeadIds.length}
          activeMode={activeMode}
        />

        {/* STEP 1: Select Sales Executives */}
        {currentStep === 1 && (
          <ExecutiveSelectorStep
            executives={executives}
            selectedExecutiveIds={selectedExecutiveIds}
            onToggleExecutive={handleToggleExecutiveSelection}
            onSelectAll={handleSelectAllExecutives}
            onDeselectAll={handleDeselectAllExecutives}
            onAdvanceToStep2={() => setCurrentStep(2)}
            isLoading={isExecutivesLoading}
          />
        )}

        {/* STEP 2: Split and Lead Distribution Option */}
        {currentStep === 2 && (
          <div className="space-y-6">
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
                  onBackToStep1={() => setCurrentStep(1)}
                />

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
                  onToggleLead={handleToggleLead}
                  onSelectTop30={() => handleSelectAllLeads(filteredLeads.slice(0, 30).map((l) => l.id))}
                  onSelectAll={() => handleSelectAllLeads(filteredLeads.map((l) => l.id))}
                  onClearSelection={handleClearLeadSelection}
                  activeRepsCount={selectedExecCount || executives.length}
                />

                {/* Pagination */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    pageSize={limit}
                    onPageSizeChange={setLimit}
                    totalItems={totalUnassignedCount}
                  />
                </div>

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
          selectedExecCount={selectedExecutiveIds.length}
          totalExecCount={executives.length}
          selectedLeadCount={selectedLeadIds.length}
          totalPoolCount={totalUnassignedCount}
          totalEstValue={totalEstValue}
          onReset={currentStep === 1 ? handleDeselectAllExecutives : handleClearLeadSelection}
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
      </div>
    </ProtectedRoute>
  );
}
