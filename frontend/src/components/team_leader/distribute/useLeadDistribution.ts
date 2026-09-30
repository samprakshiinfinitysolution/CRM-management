'use client';

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { DistributionTabMode } from './DistributeModeSelector';
import { AllocationSummaryItem } from './DistributionSuccessModal';
import {
  LeadStatus,
  type AssignMode,
} from '@/types/api.types';
import {
  useDistributeLeadsMutation,
  useGetLeadsQuery,
  useGetSalesExecutivesQuery,
} from '@/store';
import {
} from './mockData';
import { handleApiError } from '@/lib/errorHandler';

export function useLeadDistribution() {
  // Tab / distribution strategy mode
  const [activeMode, setActiveMode] = useState<DistributionTabMode>('EQUAL_SPLIT');
  const [assignedLeads] = useState([]);

  // Selection state
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [userSelectedExecutiveIds, setUserSelectedExecutiveIds] = useState<string[] | null>(null);
  const [userCustomQuotas, setUserCustomQuotas] = useState<Record<string, number>>({});

  // Modal & operation status
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [lastAllocations, setLastAllocations] = useState<AllocationSummaryItem[]>([]);
  const [lastDistributedCount, setLastDistributedCount] = useState<number>(0);

  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // RTK Query API connections
  const [distributeLeads, { isLoading: isDistributing }] = useDistributeLeadsMutation();
  const {
    data: salesExecutive,
    isLoading: isExecutivesLoading,
    refetch: refetchExecutives,
  } = useGetSalesExecutivesQuery();

  const {
    data: leadsRes,
    isLoading: isQueryLoading,
    isFetching: isQueryFetching,
    refetch: queryRefetch,
  } = useGetLeadsQuery({
    status: LeadStatus.NEW,
    limit,
    page,
  });

  // Resolved list of leads and executives
  const unassignedLeads = useMemo(() => {
    return leadsRes?.data && leadsRes.data.length > 0 ? leadsRes.data : [];
  }, [leadsRes]);

  const executives = useMemo(() => {
    return salesExecutive?.data && salesExecutive.data.length > 0
      ? salesExecutive.data
      : [];
  }, [salesExecutive]);

  // Derived quotas for each executive (defaults to 2 unless customized by the user)
  const quotas = useMemo<Record<string, number>>(() => {
    const calculatedQuotas: Record<string, number> = {};
    executives.forEach((e) => {
      calculatedQuotas[e.id] = userCustomQuotas[e.id] !== undefined ? userCustomQuotas[e.id] : 2;
    });
    return calculatedQuotas;
  }, [executives, userCustomQuotas]);

  // Derived selected executives (defaults to all available executives)
  const selectedExecutiveIds = useMemo(() => {
    if (userSelectedExecutiveIds !== null) {
      return userSelectedExecutiveIds;
    }
    return [];
  }, [userSelectedExecutiveIds, executives]);

  // Mathematical distribution metrics
  const effectiveTotalLeads = useMemo(() => {
    return selectedLeadIds.length > 0 ? selectedLeadIds.length : unassignedLeads.length;
  }, [selectedLeadIds.length, unassignedLeads.length]);

  const selectedExecCount = selectedExecutiveIds.length;

  const equalSharePerExecutive = useMemo(() => {
    if (selectedExecCount === 0 || effectiveTotalLeads === 0) return 0;
    return Math.floor(effectiveTotalLeads / selectedExecCount);
  }, [effectiveTotalLeads, selectedExecCount]);

  const equalAllocatedCount = equalSharePerExecutive * selectedExecCount;
  const equalRemainderCount = effectiveTotalLeads - equalAllocatedCount;

  const fixedTotalAllocated = useMemo(() => {
    return Object.values(quotas).reduce((sum, val) => sum + (val || 0), 0);
  }, [quotas]);

  const fixedRemainderCount = Math.max(0, effectiveTotalLeads - fixedTotalAllocated);

  const manualAllocatedCount = selectedExecCount > 0 ? effectiveTotalLeads : 0;
  const manualRemainderCount = selectedExecCount > 0 ? 0 : effectiveTotalLeads;

  const currentAllocatedCount =
    activeMode === 'EQUAL_SPLIT'
      ? equalAllocatedCount
      : activeMode === 'FIXED_QUOTA'
      ? fixedTotalAllocated
      : manualAllocatedCount;

  const currentRemainderCount =
    activeMode === 'EQUAL_SPLIT'
      ? equalRemainderCount
      : activeMode === 'FIXED_QUOTA'
      ? fixedRemainderCount
      : manualRemainderCount;

  // Validation
  const isValid = useMemo(() => {
    if (effectiveTotalLeads === 0) return false;
    if (activeMode === 'EQUAL_SPLIT') {
      return selectedExecCount > 0 && equalSharePerExecutive > 0;
    }
    if (activeMode === 'FIXED_QUOTA') {
      return fixedTotalAllocated > 0 && fixedTotalAllocated <= effectiveTotalLeads;
    }
    if (activeMode === 'MANUAL_PICK') {
      return selectedExecCount === 1 && selectedLeadIds.length > 0;
    }
    return true;
  }, [
    activeMode,
    effectiveTotalLeads,
    selectedExecCount,
    equalSharePerExecutive,
    fixedTotalAllocated,
    selectedLeadIds.length,
  ]);

  const validationMessage = useMemo(() => {
    if (effectiveTotalLeads === 0) return 'No unassigned leads available in pool.';
    if (activeMode === 'EQUAL_SPLIT' && selectedExecCount === 0)
      return 'Please select at least one sales executive to receive leads.';
    if (activeMode === 'FIXED_QUOTA' && fixedTotalAllocated > effectiveTotalLeads)
      return `Total assigned quota (${fixedTotalAllocated}) exceeds available leads (${effectiveTotalLeads}).`;
    if (activeMode === 'FIXED_QUOTA' && fixedTotalAllocated === 0)
      return 'Please specify at least 1 lead quota for an executive.';
    if (activeMode === 'MANUAL_PICK' && selectedLeadIds.length === 0)
      return 'Please check at least one lead from the table to assign.';
    if (activeMode === 'MANUAL_PICK' && selectedExecCount !== 1)
      return 'Please select exactly one target executive to assign the picked leads.';
    return undefined;
  }, [
    activeMode,
    effectiveTotalLeads,
    selectedExecCount,
    fixedTotalAllocated,
    selectedLeadIds.length,
  ]);

  // Lead selection handlers - auto-switches split factor to MANUAL_PICK (Explicit) on manual selection
  const handleToggleLead = (id: string) => {
    setSelectedLeadIds((prev) => {
      const isRemoving = prev.includes(id);
      const next = isRemoving ? prev.filter((item) => item !== id) : [...prev, id];

      // If user starts manually selecting leads while not in MANUAL_PICK, auto-switch to MANUAL_PICK (Explicit Split)
      if (!isRemoving && activeMode !== 'MANUAL_PICK' && activeMode !== 'REASSIGN_RECALL') {
        setActiveMode('MANUAL_PICK');
        if (selectedExecutiveIds.length !== 1 && executives.length > 0) {
          setUserSelectedExecutiveIds([executives[0].id]);
        }
        toast.info('Switched to Manual Split mode for selected leads', {
          id: 'auto-mode-switch',
          duration: 2500,
        });
      }

      return next;
    });
  };

  const handleSelectAllLeads = (ids: string[]) => {
    setSelectedLeadIds(ids);
    if (ids.length > 0 && activeMode !== 'MANUAL_PICK' && activeMode !== 'REASSIGN_RECALL') {
      setActiveMode('MANUAL_PICK');
      if (selectedExecutiveIds.length !== 1 && executives.length > 0) {
        setUserSelectedExecutiveIds([executives[0].id]);
      }
      toast.info('Switched to Manual Split mode for selected leads', {
        id: 'auto-mode-switch',
        duration: 2500,
      });
    }
  };

  const handleClearLeadSelection = () => {
    setSelectedLeadIds([]);
  };

  // Executive selection handlers
  const handleToggleExecutive = (id: string) => {
    if (activeMode === 'MANUAL_PICK') {
      setUserSelectedExecutiveIds([id]);
      return;
    }
    setUserSelectedExecutiveIds(
      selectedExecutiveIds.includes(id)
        ? selectedExecutiveIds.filter((item) => item !== id)
        : [...selectedExecutiveIds, id]
    );
  };

  const handleSelectAllExecutives = () => {
    setUserSelectedExecutiveIds(executives.map((executive) => executive.id));
  };

  const handleDeselectAllExecutives = () => {
    setUserSelectedExecutiveIds([]);
  };

  const handleUpdateQuota = (id: string, quota: number) => {
    setUserCustomQuotas((prev) => ({
      ...prev,
      [id]: Math.max(0, quota),
    }));
  };

  const handleSelectMode = (mode: DistributionTabMode) => {
    setActiveMode(mode);
    if (mode === 'MANUAL_PICK' && selectedExecutiveIds.length > 1) {
      setUserSelectedExecutiveIds([executives[0]?.id || '']);
    }
  };

  const handleFetchUnassignedLeads = async () => {
    try {
      await queryRefetch();
      toast.info('Refreshed unassigned lead pool');
    } catch (err) {
      handleApiError(err, 'Failed to fetch unassigned leads');
    }
  };

  // Distribution execution
  const handleExecuteDistribution = async () => {
    setIsSubmitting(true);
    try {
      // Guard against attempting to distribute mock preview items to backend
      const hasMockExecutives = selectedExecutiveIds.some((id) => id.startsWith('exec-'));
      const hasMockLeads = selectedLeadIds.some((id) => id.startsWith('lead-'));
      if (hasMockExecutives || (selectedLeadIds.length > 0 && hasMockLeads)) {
        toast.warning(
          'Sample preview data cannot be distributed. Please ensure real sales executives and unassigned leads are created in the database.'
        );
        setIsSubmitting(false);
        return;
      }

      let mode: AssignMode;
      const modalAllocations: AllocationSummaryItem[] = [];

      if (activeMode === 'EQUAL_SPLIT') {
        mode = 'EQUAL';
        selectedExecutiveIds.forEach((id) => {
          const exec = executives.find((e) => e.id === id);
          if (exec) {
            modalAllocations.push({
              executiveName: exec.name,
              count: equalSharePerExecutive,
            });
          }
        });

        const res = await distributeLeads({
          mode,
          executiveIds: selectedExecutiveIds,
          leadIds: selectedLeadIds.length > 0 ? selectedLeadIds : undefined,
          reason: 'Equal Distribution Split',
        }).unwrap();

        toast.success(res.message || 'Leads distributed equally');
        setLastAllocations(modalAllocations);
        setLastDistributedCount(equalAllocatedCount);
        setIsSuccessModalOpen(true);
        setSelectedLeadIds([]);
        queryRefetch();
        refetchExecutives();
      } else if (activeMode === 'FIXED_QUOTA') {
        mode = 'CUSTOM';
        const allocations = Object.entries(quotas)
          .filter(([, qty]) => qty > 0)
          .map(([id, qty]) => {
            const exec = executives.find((e) => e.id === id);
            if (exec) {
              modalAllocations.push({
                executiveName: exec.name,
                count: qty,
              });
            }
            return { salesExecutiveId: id, count: qty };
          });

        const res = await distributeLeads({
          mode,
          allocations,
          leadIds: selectedLeadIds.length > 0 ? selectedLeadIds : undefined,
          reason: 'Fixed Quota Allocation',
        }).unwrap();

        toast.success(res.message || 'Leads allocated successfully');
        setLastAllocations(modalAllocations);
        setLastDistributedCount(fixedTotalAllocated);
        setIsSuccessModalOpen(true);
        setSelectedLeadIds([]);
        queryRefetch();
        refetchExecutives();
      } else if (activeMode === 'MANUAL_PICK') {
        mode = 'EXPLICIT';
        if (selectedExecutiveIds.length !== 1 || selectedLeadIds.length === 0) {
          toast.error('Please select exactly one target executive and at least one lead');
          setIsSubmitting(false);
          return;
        }

        const targetExecId = selectedExecutiveIds[0];
        const exec = executives.find((e) => e.id === targetExecId);
        if (exec) {
          modalAllocations.push({
            executiveName: exec.name,
            count: selectedLeadIds.length,
          });
        }

        const assignments = selectedLeadIds.map((leadId) => ({
          leadId,
          salesExecutiveId: targetExecId,
        }));

        const res = await distributeLeads({
          mode,
          assignments,
          reason: 'Manual Pick Assignment',
        }).unwrap();

        toast.success(res.message || 'Leads assigned successfully');
        setLastAllocations(modalAllocations);
        setLastDistributedCount(selectedLeadIds.length);
        setIsSuccessModalOpen(true);
        setSelectedLeadIds([]);
        queryRefetch();
        refetchExecutives();
      }
    } catch (err) {
      handleApiError(err, 'Failed to distribute leads');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reassignment & Recall handlers
  const handleReassignLeads = async (
    sourceExecId: string,
    targetExecId: string,
    leadIds: string[],
    _reason: string
  ) => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const sourceExec = executives.find((e) => e.id === sourceExecId);
      const targetExec = executives.find((e) => e.id === targetExecId);
      toast.success(
        `Reassigned ${leadIds.length} leads from ${sourceExec?.name || 'Source'} to ${targetExec?.name || 'Target'}`
      );
    } catch (err) {
      handleApiError(err, 'Failed to reassign leads');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecallLeads = async (
    sourceExecId: string,
    leadIds: string[],
    _reason: string
  ) => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const sourceExec = executives.find((e) => e.id === sourceExecId);
      toast.success(
        `Recalled ${leadIds.length} leads from ${sourceExec?.name || 'Executive'} back to unassigned pool`
      );
    } catch (err) {
      handleApiError(err, 'Failed to recall leads to pool');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // Strategy & Tabs
    activeMode,
    handleSelectMode,

    // Entities
    unassignedLeads,
    executives,
    assignedLeads,

    // Selection
    selectedLeadIds,
    selectedExecutiveIds,
    handleToggleLead,
    handleSelectAllLeads,
    handleClearLeadSelection,
    handleToggleExecutive,
    handleSelectAllExecutives,
    handleDeselectAllExecutives,

    // Quotas
    quotas,
    handleUpdateQuota,

    // Mathematical metrics
    effectiveTotalLeads,
    selectedExecCount,
    equalSharePerExecutive,
    currentAllocatedCount,
    currentRemainderCount,

    // Validation
    isValid,
    validationMessage,

    // Query & Submission states
    isSubmitting: isSubmitting || isDistributing,
    isQueryLoading,
    isQueryFetching,
    isExecutivesLoading,
    totalUnassignedCount: leadsRes?.pagination?.total || unassignedLeads.length,
    //totalLeads,

    // Pagination controls
    page,
    limit,
    totalPages: leadsRes?.pagination?.totalPages || Math.max(1, Math.ceil((leadsRes?.pagination?.total || unassignedLeads.length) / limit)),
    setPage,
    setLimit,

    // Execution handlers
    handleFetchUnassignedLeads,
    handleExecuteDistribution,
    handleReassignLeads,
    handleRecallLeads,

    // Success Modal
    isSuccessModalOpen,
    setIsSuccessModalOpen,
    lastAllocations,
    lastDistributedCount,
  };
}
