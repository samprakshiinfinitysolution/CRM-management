'use client';

import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
  DistributeHeader,
  DistributeModeSelector,
  DistributionTabMode,
  UnassignedLeadsTable,
  ExecutiveQuotaSelector,
  DistributionSummaryCard,
  ReassignRecallConsole,
  DistributionSuccessModal,
  AllocationSummaryItem,
} from '@/components/team_leader/distribute';
import {
  LeadItem,
  SalesExecutiveSummary,
  PriorityLevel,
  LeadStatus,
  UserRole,
  type AssignMode,
} from '@/types/api.types';
import { useDistributeLeadsMutation, useGetLeadsQuery, useGetSalesExecutivesQuery } from '@/store';

// =========================================================================
// Initial Mock Data (Ensures rich UI interaction while API is connected)
// =========================================================================
const INITIAL_UNASSIGNED_LEADS: LeadItem[] = [
  {
    id: 'lead-001',
    leadCode: 'CRM-000101',
    customerName: 'Aarav Mehta',
    mobile: '+91 98200 12345',
    email: 'aarav.mehta@techmatrix.in',
    city: 'Mumbai',
    state: 'Maharashtra',
    requirement: 'Enterprise ERP & Multi-Branch Lead Tracking Suite',
    productService: 'Enterprise ERP',
    budget: '₹3,50,000',
    leadSource: 'WEBSITE',
    priority: PriorityLevel.URGENT,
    status: LeadStatus.NEW,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead-002',
    leadCode: 'CRM-000102',
    customerName: 'Pooja Hegde',
    mobile: '+91 99301 54321',
    email: 'pooja.h@zenithgroup.com',
    city: 'Bengaluru',
    state: 'Karnataka',
    requirement: 'Cloud Telephony & Automated Dialer Integration',
    productService: 'Cloud Telephony',
    budget: '₹1,80,000',
    leadSource: 'CAMPAIGN',
    priority: PriorityLevel.HIGH,
    status: LeadStatus.NEW,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead-003',
    leadCode: 'CRM-000103',
    customerName: 'Kunal Singhania',
    mobile: '+91 98111 88990',
    email: 'kunal@singhanias.org',
    city: 'Delhi NCR',
    state: 'Delhi',
    requirement: 'Sales Automation & Custom Quota Engine for 25 Agents',
    productService: 'Sales Automation',
    budget: '₹4,20,000',
    leadSource: 'EXCEL_IMPORT',
    priority: PriorityLevel.HIGH,
    status: LeadStatus.NEW,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead-004',
    leadCode: 'CRM-000104',
    customerName: 'Sneha Kulkarni',
    mobile: '+91 97654 32109',
    email: 'sneha.k@puneinnovations.com',
    city: 'Pune',
    state: 'Maharashtra',
    requirement: 'CRM Migration from Legacy Excel Spreadsheets',
    productService: 'Data Migration',
    budget: '₹95,000',
    leadSource: 'REFERRAL',
    priority: PriorityLevel.MEDIUM,
    status: LeadStatus.NEW,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead-005',
    leadCode: 'CRM-000105',
    customerName: 'Vikramaditya Roy',
    mobile: '+91 98300 67890',
    email: 'vikram.roy@kolkatatech.co',
    city: 'Kolkata',
    state: 'West Bengal',
    requirement: 'Customer Support Helpdesk & SLA Tracker',
    productService: 'Support Suite',
    budget: '₹2,10,000',
    leadSource: 'WEBSITE',
    priority: PriorityLevel.LOW,
    status: LeadStatus.NEW,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead-006',
    leadCode: 'CRM-000106',
    customerName: 'Ananya Deshmukh',
    mobile: '+91 94220 11223',
    email: 'ananya@deshmukhindustries.com',
    city: 'Nagpur',
    state: 'Maharashtra',
    requirement: 'Supply Chain Logistics CRM & Inventory Sync',
    productService: 'Supply Chain CRM',
    budget: '₹5,00,000',
    leadSource: 'CAMPAIGN',
    priority: PriorityLevel.URGENT,
    status: LeadStatus.NEW,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead-007',
    leadCode: 'CRM-000107',
    customerName: 'Rohan Banerjee',
    mobile: '+91 98450 99887',
    email: 'rohan.b@fintechspark.io',
    city: 'Hyderabad',
    state: 'Telangana',
    requirement: 'FinTech Compliance & Lead Verification API',
    productService: 'FinTech Module',
    budget: '₹3,00,000',
    leadSource: 'EXCEL_IMPORT',
    priority: PriorityLevel.HIGH,
    status: LeadStatus.NEW,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead-008',
    leadCode: 'CRM-000108',
    customerName: 'Meera Iyer',
    mobile: '+91 98401 23456',
    email: 'meera.iyer@chennairealty.com',
    city: 'Chennai',
    state: 'Tamil Nadu',
    requirement: 'Real Estate Buyer CRM with WhatsApp Bot Integration',
    productService: 'Real Estate CRM',
    budget: '₹2,75,000',
    leadSource: 'WEBSITE',
    priority: PriorityLevel.MEDIUM,
    status: LeadStatus.NEW,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_EXECUTIVES: SalesExecutiveSummary[] = [
  {
    id: 'exec-1',
    name: 'Rohit Sharma',
    email: 'rohit.sharma@crm.internal',
    role: UserRole.SALES_EXECUTIVE,
    isActive: true,
    createdAt: '2026-01-10T10:00:00.000Z',
    totalAssignedLeads: 45,
    activeLeads: 12,
    convertedLeads: 28,
    lostLeads: 5,
    followUpsPending: 4,
    followUpsOverdue: 0,
    conversionRate: 62.2,
    capacityPercentage: 40,
    totalPipelineValue: 1250000,
    workloadStatus: 'OPTIMAL',
  },
  {
    id: 'exec-2',
    name: 'Priya Patel',
    email: 'priya.patel@crm.internal',
    role: UserRole.SALES_EXECUTIVE,
    isActive: true,
    createdAt: '2026-01-15T10:00:00.000Z',
    totalAssignedLeads: 52,
    activeLeads: 24,
    convertedLeads: 21,
    lostLeads: 7,
    followUpsPending: 8,
    followUpsOverdue: 1,
    conversionRate: 40.4,
    capacityPercentage: 80,
    totalPipelineValue: 980000,
    workloadStatus: 'NEAR_CAPACITY',
  },
  {
    id: 'exec-3',
    name: 'Amit Verma',
    email: 'amit.verma@crm.internal',
    role: UserRole.SALES_EXECUTIVE,
    isActive: true,
    createdAt: '2026-02-01T10:00:00.000Z',
    totalAssignedLeads: 38,
    activeLeads: 9,
    convertedLeads: 22,
    lostLeads: 7,
    followUpsPending: 3,
    followUpsOverdue: 0,
    conversionRate: 57.9,
    capacityPercentage: 30,
    totalPipelineValue: 820000,
    workloadStatus: 'OPTIMAL',
  },
  {
    id: 'exec-4',
    name: 'Sneha Roy',
    email: 'sneha.roy@crm.internal',
    role: UserRole.SALES_EXECUTIVE,
    isActive: true,
    createdAt: '2026-02-10T10:00:00.000Z',
    totalAssignedLeads: 60,
    activeLeads: 28,
    convertedLeads: 25,
    lostLeads: 7,
    followUpsPending: 12,
    followUpsOverdue: 3,
    conversionRate: 41.6,
    capacityPercentage: 93,
    totalPipelineValue: 1450000,
    workloadStatus: 'OVERLOADED',
  },
];

const INITIAL_ASSIGNED_LEADS: LeadItem[] = [
  {
    id: 'assigned-01',
    leadCode: 'CRM-000090',
    customerName: 'Vikram Joshi',
    mobile: '+91 99880 12345',
    email: 'vikram.j@corp.in',
    city: 'Mumbai',
    requirement: 'Retail POS & Inventory Module',
    priority: PriorityLevel.HIGH,
    status: LeadStatus.CONTACTED,
    assignedToUserId: 'exec-1',
    assignedToId: 'exec-1',
    assignedTo: { id: 'exec-1', name: 'Rohit Sharma', email: 'rohit.sharma@crm.internal' },
    assignedAt: '2026-09-27T10:00:00.000Z',
    createdAt: '2026-09-27T09:00:00.000Z',
    updatedAt: '2026-09-28T10:00:00.000Z',
  },
  {
    id: 'assigned-02',
    leadCode: 'CRM-000091',
    customerName: 'Sunita Rao',
    mobile: '+91 98770 54321',
    email: 'sunita.rao@techhub.com',
    city: 'Bengaluru',
    requirement: 'SaaS Multi-Tenant CRM Migration',
    priority: PriorityLevel.URGENT,
    status: LeadStatus.INTERESTED,
    assignedToUserId: 'exec-2',
    assignedToId: 'exec-2',
    assignedTo: { id: 'exec-2', name: 'Priya Patel', email: 'priya.patel@crm.internal' },
    assignedAt: '2026-09-26T14:30:00.000Z',
    createdAt: '2026-09-26T12:00:00.000Z',
    updatedAt: '2026-09-28T11:00:00.000Z',
  },
  {
    id: 'assigned-03',
    leadCode: 'CRM-000092',
    customerName: 'Harish Mehta',
    mobile: '+91 98220 99881',
    email: 'harish@mehtaglobal.org',
    city: 'Ahmedabad',
    requirement: 'Automated WhatsApp Marketing Integration',
    priority: PriorityLevel.MEDIUM,
    status: LeadStatus.FOLLOW_UP,
    assignedToUserId: 'exec-4',
    assignedToId: 'exec-4',
    assignedTo: { id: 'exec-4', name: 'Sneha Roy', email: 'sneha.roy@crm.internal' },
    assignedAt: '2026-09-25T09:00:00.000Z',
    createdAt: '2026-09-25T08:00:00.000Z',
    updatedAt: '2026-09-28T15:00:00.000Z',
  },
];

export default function TeamLeaderDistributePage() {
  // =========================================================================
  // UI States
  // =========================================================================
  const [activeMode, setActiveMode] = useState<DistributionTabMode>('EQUAL_SPLIT');
  const [executives, setExecutives] = useState<SalesExecutiveSummary[]>(INITIAL_EXECUTIVES);
  const [assignedLeads, setAssignedLeads] = useState<LeadItem[]>(INITIAL_ASSIGNED_LEADS);

  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [selectedExecutiveIds, setSelectedExecutiveIds] = useState<string[]>(
    INITIAL_EXECUTIVES.map((e) => e.id)
  );
  const [quotas, setQuotas] = useState<Record<string, number>>({
    'exec-1': 2,
    'exec-2': 2,
    'exec-3': 2,
    'exec-4': 2,
  });


  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [lastAllocations, setLastAllocations] = useState<AllocationSummaryItem[]>([]);
  const [lastDistributedCount, setLastDistributedCount] = useState<number>(0);

  // =========================================================================
  // API Placeholder Functions (To be wired to backend REST endpoints)
  // =========================================================================
  const  [distributeLeads, {isLoading:isDistributing}] =   useDistributeLeadsMutation();
  const { data: salesExecutive, isLoading: isExecutivesLoading, refetch: refetchExecutives } = useGetSalesExecutivesQuery();
  const {
    data: leadsRes,
    isLoading: isQueryLoading,
    isFetching: isQueryFetching,
    refetch: queryRefetch,
  } = useGetLeadsQuery({
    status: LeadStatus.NEW,
    limit: 100,
    page: 1,
  });

  const unassignedLeads = leadsRes?.data && leadsRes.data.length > 0 ? leadsRes.data : INITIAL_UNASSIGNED_LEADS;

  /**   
   * Fetch fresh unassigned leads pool from backend
   */
  const handleFetchUnassignedLeads = async () => {
    try {
      await queryRefetch();
      toast.info('Refreshed unassigned lead pool');
    } catch {
      toast.error('Failed to fetch unassigned leads');
    }
  };

  /**
   * API Placeholder: Fetch sales executives and capacity metrics
   * Route: GET /api/users?role=SALES_EXECUTIVE
   */
  //const handleFetchExecutives = async () => {
  //  try {


  //    // TODO: Connect with backend query: const res = await userApi.getSalesExecutives();
  //    toast.info('API Placeholder: Refreshed sales executives list');
  //  } catch {
  //    toast.error('Failed to fetch sales executives');
  //  }
  //};

  /**
   * API Placeholder: Execute Lead Distribution (Equal, Fixed, or Manual)
   * Route: POST /api/leads/distribute
   * Body: { mode, targetExecutiveIds, quotas, leadIds }
   */
  const handleExecuteDistribution = async () => {
    setIsSubmitting(true);

    try {

      // Calculate allocation items for modal preview
      const results: { salesExecutiveId: string; count: number }[] = [];
      const effectiveLeadsToDistribute =selectedLeadIds.length > 0 ? selectedLeadIds.length : unassignedLeads.length;

        let mode:AssignMode;
        

      if (activeMode === 'EQUAL_SPLIT') {
       mode = "EQUAL"

      } else if (activeMode === 'FIXED_QUOTA') {
        mode = "CUSTOM" 
        Object.entries(quotas).forEach(([id, qty]) => {
          const exec = executives.find((e) => e.id === id);
          if (exec && qty > 0) {
            results.push({ salesExecutiveId: id, count: qty });
          }
        });
      } else if (activeMode === 'MANUAL_PICK') {
        mode = "EXPLICIT"
        selectedExecutiveIds.forEach((id) => {
          const exec = executives.find((e) => e.id === id);
          if (exec) {
            results.push({ salesExecutiveId: id, count: effectiveLeadsToDistribute });
          }
        });

        try{
        const res = await distributeLeads({
            mode: mode as AssignMode,
            leadIds:selectedLeadIds,
            executiveIds:selectedExecutiveIds,
            allocations:results,
            assignments:[],
            reason:"Equal Distribution",
        })
        if(res.data?.success){
            toast.success(res.data.message || "Leads assigned Successfully")
        }
        if(res.data?.error){
          toast.error(res.data?.error?.message || "Failed to assign leads")
        }
    } catch(err){
        toast.error("Error while assigning leads")
    } finally{
        setIsSubmitting(false);
    }
      }

      const totalDist = results.reduce((acc, curr) => acc + curr.count, 0);

      // Local state update simulation
    //  setLastAllocations(results);
      setLastDistributedCount(totalDist);
      setIsSuccessModalOpen(true);
      setSelectedLeadIds([]);

      toast.success(`Successfully allocated ${totalDist} leads across ${results.length} executives!`);
    } catch {
      toast.error('Failed to execute lead distribution');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * API Placeholder: Reassign leads between executives
   * Route: POST /api/leads/reassign
   * Body: { sourceExecutiveId, targetExecutiveId, leadIds, reason }
   */
  const handleReassignLeads = async (
    sourceExecId: string,
    targetExecId: string,
    leadIds: string[],
    reason: string
  ) => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));

      const sourceExec = executives.find((e) => e.id === sourceExecId);
      const targetExec = executives.find((e) => e.id === targetExecId);

      toast.success(
        `Reassigned ${leadIds.length} leads from ${sourceExec?.name || 'Source'} to ${
          targetExec?.name || 'Target'
        }`
      );
    } catch {
      toast.error('Failed to reassign leads');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * API Placeholder: Recall leads back to unassigned pool
   * Route: POST /api/leads/recall
   * Body: { sourceExecutiveId, leadIds, reason }
   */
  const handleRecallLeads = async (
    sourceExecId: string,
    leadIds: string[],
    reason: string
  ) => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));

      const sourceExec = executives.find((e) => e.id === sourceExecId);
      toast.success(
        `Recalled ${leadIds.length} leads from ${sourceExec?.name || 'Executive'} back to unassigned pool`
      );
    } catch {
      toast.error('Failed to recall leads to pool');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectAllExecutive = () => {
    const allExecId = executives.map((executive)=>executive.id)
    setSelectedExecutiveIds((prev)=>{
      const newSet = new Set([...prev, ...allExecId]);
      return Array.from(newSet);
    })
  }

  // =========================================================================
  // Live Mathematical Calculations & Previews
  // =========================================================================
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

  // Active metrics depending on mode
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

  // Form Validation
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

  // =========================================================================
  // Handlers
  // =========================================================================
  const handleToggleLead = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleExecutive = (id: string) => {
    if (activeMode === 'MANUAL_PICK') {
      setSelectedExecutiveIds([id]);
      
      return;
    }
    setSelectedExecutiveIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
    
  };

  const handleUpdateQuota = (id: string, quota: number) => {
    setQuotas((prev) => ({
      ...prev,
      [id]: Math.max(0, quota),
    }));
  };

  console.log(salesExecutive)

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 pt-4 pb-24 flex flex-col gap-6">
      {/* 1. Header with Top KPIs and Refresh */}
      <DistributeHeader
        unassignedCount={leadsRes?.pagination?.total || 0}
        activeExecutivesCount={salesExecutive?.data?.length || 0}
        totalSelectedLeads={selectedLeadIds.length}
        onRefresh={handleFetchUnassignedLeads}
        onResetSelection={() => setSelectedLeadIds([])}
      />

      {/* 2. Distribution Strategy Selector Tabs */}
      <DistributeModeSelector
        activeMode={activeMode}
        onSelectMode={(mode) => {
          setActiveMode(mode);
          if (mode === 'MANUAL_PICK' && selectedExecutiveIds.length > 1) {
            setSelectedExecutiveIds([executives[0]?.id || '']);
          }
        }}
        unassignedCount={unassignedLeads.length}
      />

      {/* 3. Conditional Mode Rendering */}
      {activeMode === 'REASSIGN_RECALL' ? (
        /* Reassignment & Recall Console View */
        <ReassignRecallConsole
          executives={executives}
          assignedLeads={assignedLeads}
          onReassignLeads={handleReassignLeads}
          onRecallLeads={handleRecallLeads}
          isProcessing={isSubmitting}
        />
      ) : (
        /* Standard Distribution Suite (Equal, Fixed, Manual) */
        <div className="space-y-6">
          {/* Executive Quota Allocation Grid */}
          <ExecutiveQuotaSelector
            executives={salesExecutive?.data || []}
            mode={activeMode}
            selectedExecutiveIds={selectedExecutiveIds}
            quotas={quotas}
            onToggleExecutive={handleToggleExecutive}
            onUpdateQuota={handleUpdateQuota}
            onSelectAllExecutives={() => handleSelectAllExecutive()}
            onDeselectAllExecutives={() => setSelectedExecutiveIds([])}
            equalSharePerExecutive={equalSharePerExecutive}
            totalLeadsToDistribute={effectiveTotalLeads}
          />

          {/* Unassigned Leads Table & Selector */}
          <UnassignedLeadsTable
            leads={leadsRes?.data || []}
            selectedLeadIds={selectedLeadIds}
            onToggleLead={handleToggleLead}
            onSelectAll={(ids) => setSelectedLeadIds(ids)}
            onClearSelection={() => setSelectedLeadIds([])}
            isLoading={isQueryLoading || isQueryFetching}
          />

          {/* Live Dry-Run Summary & Execution Bar */}
          <DistributionSummaryCard
            mode={activeMode}
            totalLeadsToDistribute={effectiveTotalLeads}
            selectedExecutiveCount={selectedExecCount}
            allocatedCount={currentAllocatedCount}
            remainderCount={currentRemainderCount}
            isSubmitting={isSubmitting}
            onExecuteDistribution={handleExecuteDistribution}
            isValid={isValid}
            validationMessage={validationMessage}
          />
        </div>
      )}

      {/* 4. Distribution Success Confirmation Modal */}
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