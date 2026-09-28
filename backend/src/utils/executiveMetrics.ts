import { LeadStatus, FollowUpStatus } from '../types/index.js';

export interface RawLeadForMetrics {
  id?: string;
  status: LeadStatus | string;
  budget?: number | string | null | { toString(): string };
  [key: string]: any;
}

export interface RawFollowUpForMetrics {
  id?: string;
  status: FollowUpStatus | string;
  scheduledAt: Date | string;
  [key: string]: any;
}

export interface ExecutiveMetrics {
  totalAssignedLeads: number;
  activeLeads: number;
  convertedLeads: number;
  lostLeads: number;
  followUpsPending: number;
  followUpsOverdue: number;
  conversionRate: number;
  capacityPercentage: number;
  totalPipelineValue: number;
  workloadStatus: 'OPTIMAL' | 'NEAR_CAPACITY' | 'OVERLOADED';
  statusBreakdown: Record<string, number>;
}

/**
 * Reusable computation of workload and conversion metrics for an executive's leads and follow-ups.
 * Eliminates duplicate calculations across summary listings, detail drawers, and analytics views.
 */
export function calculateExecutiveMetrics(
  assignedLeads: RawLeadForMetrics[] = [],
  followUps: RawFollowUpForMetrics[] = [],
  now: Date = new Date()
): ExecutiveMetrics {
  const leads = assignedLeads || [];
  const totalAssignedLeads = leads.length;

  const convertedLeads = leads.filter(
    (l) => l.status === LeadStatus.WON_SOLD
  ).length;

  const lostLeads = leads.filter((l) => l.status === LeadStatus.LOST).length;

  const activeLeads = leads.filter(
    (l) =>
      l.status !== LeadStatus.WON_SOLD &&
      l.status !== LeadStatus.LOST &&
      l.status !== LeadStatus.INVALID &&
      l.status !== LeadStatus.DUPLICATE
  ).length;

  const totalPipelineValue = leads
    .filter(
      (l) =>
        l.status !== LeadStatus.LOST &&
        l.status !== LeadStatus.INVALID &&
        l.status !== LeadStatus.DUPLICATE
    )
    .reduce((sum, l) => sum + (l.budget ? Number(l.budget) : 0), 0);

  const statusBreakdown: Record<string, number> = {};
  leads.forEach((l) => {
    statusBreakdown[l.status] = (statusBreakdown[l.status] || 0) + 1;
  });

  const pendingFollowUps = (followUps || []).filter(
    (f) => f.status === FollowUpStatus.PENDING
  );
  const followUpsPending = pendingFollowUps.length;

  const followUpsOverdue = pendingFollowUps.filter(
    (f) => new Date(f.scheduledAt) < now
  ).length;

  const conversionRate =
    totalAssignedLeads > 0
      ? Math.round((convertedLeads / totalAssignedLeads) * 1000) / 10
      : 0;

  // Baseline max active capacity quota = 40 leads
  const capacityPercentage = Math.min(
    100,
    Math.round((activeLeads / 40) * 100)
  );

  let workloadStatus: 'OPTIMAL' | 'NEAR_CAPACITY' | 'OVERLOADED' = 'OPTIMAL';
  if (activeLeads >= 35) {
    workloadStatus = 'OVERLOADED';
  } else if (activeLeads >= 25) {
    workloadStatus = 'NEAR_CAPACITY';
  }

  return {
    totalAssignedLeads,
    activeLeads,
    convertedLeads,
    lostLeads,
    followUpsPending,
    followUpsOverdue,
    conversionRate,
    capacityPercentage,
    totalPipelineValue,
    workloadStatus,
    statusBreakdown,
  };
}
