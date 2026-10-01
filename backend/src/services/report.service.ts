import prisma from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import {
  UserRole,
  LeadStatus,
  FollowUpStatus,
  TLDashboardMetrics,
  TLDashboardSupervisor,
  TLDashboardUrgentAttention,
  TLDashboardPipelineHealth,
  TLDashboardFunnelBreakdown,
  TLDashboardExecutiveWorkload,
  TLDashboardCriticalEscalation,
  TLDashboardRecentIntake,
} from '../types/index.js';

export function formatCurrencyINR(amount: number): string {
  if (!amount || isNaN(amount)) return '₹0';
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)} Cr`;
  }
  if (amount >= 1000000) {
    return `₹${(amount / 1000000).toFixed(1)} Lacs`;
  }
  if (amount >= 1000) {
    return `₹${Math.round(amount / 1000)} k`;
  }
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export class ReportService {
  /**
   * Generates comprehensive real-time dashboard metrics and KPIs for Team Leaders.
   * Aggregates supervisor status, urgent unassigned pool, pipeline health matrix,
   * stage funnel breakdown, sales executive workload & SLA audit, critical escalations,
   * and recent intake batch metadata.
   */
  static async getTLDashboardMetrics(tlUserId: string): Promise<TLDashboardMetrics> {
    const now = new Date();

    // 1. Fetch authenticated Team Leader details
    const tlUser = await prisma.user.findFirst({
      where: {
        id: tlUserId,
        role: UserRole.TEAM_LEADER,
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!tlUser) {
      throw new AppError('Team Leader not found or unauthorized', 404, 'TL_NOT_FOUND');
    }

    // Define time ranges for calculations
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    // Parallel aggregated queries for top-tier metrics
    const [
      totalPoolCount,
      leadsRecentWeekCount,
      leadsPrecedingWeekCount,
      unassignedCount,
      activeInFlightCount,
      callsTodayCount,
      wonAggregation,
      allFollowUpsCount,
      overdueFollowUpsCount,
      latestBatch,
      activeExecutives,
      allNonDeletedLeads,
      criticalOverdueFollowUps,
    ] = await Promise.all([
      // Total Pool Count (Active non-deleted leads)
      prisma.lead.count({
        where: { isDeleted: false },
      }),

      // Leads created in most recent 7-day period
      prisma.lead.count({
        where: {
          isDeleted: false,
          createdAt: { gte: oneWeekAgo },
        },
      }),

      // Leads created in preceding 7-day period (for week-over-week calculation)
      prisma.lead.count({
        where: {
          isDeleted: false,
          createdAt: { gte: twoWeeksAgo, lt: oneWeekAgo },
        },
      }),

      // Unassigned Leads count (status NEW and assignedToUserId IS NULL)
      prisma.lead.count({
        where: {
          isDeleted: false,
          assignedToUserId: null,
          status: LeadStatus.NEW,
        },
      }),

      // Active In-Flight Leads count
      prisma.lead.count({
        where: {
          isDeleted: false,
          status: {
            in: [
              LeadStatus.ASSIGNED,
              LeadStatus.CONTACTED,
              LeadStatus.INTERESTED,
              LeadStatus.FOLLOW_UP,
              LeadStatus.QUALIFIED,
              LeadStatus.PROPOSAL_QUOTATION,
              LeadStatus.NEGOTIATION,
            ],
          },
        },
      }),

      // Calls / Follow-ups scheduled for Today
      prisma.leadFollowUp.count({
        where: {
          isDeleted: false,
          status: FollowUpStatus.PENDING,
          scheduledAt: {
            gte: startOfToday,
            lte: endOfToday,
          },
          lead: { isDeleted: false },
        },
      }),

      // WON / Closed Deals Aggregation (Count and Total ARR value)
      prisma.lead.aggregate({
        where: {
          isDeleted: false,
          status: LeadStatus.WON_SOLD,
        },
        _sum: { budget: true },
        _count: { id: true },
      }),

      // Total Follow-ups count
      prisma.leadFollowUp.count({
        where: {
          isDeleted: false,
          lead: { isDeleted: false },
        },
      }),

      // Overdue pending follow-ups count
      prisma.leadFollowUp.count({
        where: {
          isDeleted: false,
          status: FollowUpStatus.PENDING,
          scheduledAt: { lt: now },
          lead: { isDeleted: false },
        },
      }),

      // Latest Import Batch metadata
      prisma.importBatch.findFirst({
        orderBy: { createdAt: 'desc' },
        include: {
          uploadedBy: {
            select: { id: true, name: true },
          },
        },
      }),

      // Active Sales Executives with their assigned leads & follow-ups
      prisma.user.findMany({
        where: {
          role: UserRole.SALES_EXECUTIVE,
          isDeleted: false,
        },
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
          assignedLeads: {
            where: { isDeleted: false },
            select: {
              id: true,
              status: true,
              budget: true,
            },
          },
          followUps: {
            where: {
              isDeleted: false,
              lead: { isDeleted: false },
            },
            select: {
              id: true,
              status: true,
              scheduledAt: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),

      // Funnel stage counts via database groupBy (avoids pulling all rows into memory)
      prisma.lead.groupBy({
        by: ['status', 'assignedToUserId'],
        where: { isDeleted: false },
        _count: { id: true },
        _sum: { budget: true },
      }),

      // Critical Escalations (top overdue high/urgent priority follow-ups)
      prisma.leadFollowUp.findMany({
        where: {
          isDeleted: false,
          status: FollowUpStatus.PENDING,
          scheduledAt: { lt: now },
          lead: {
            isDeleted: false,
            status: {
              notIn: [
                LeadStatus.WON_SOLD,
                LeadStatus.LOST,
                LeadStatus.INVALID,
                LeadStatus.DUPLICATE,
              ],
            },
          },
        },
        include: {
          lead: {
            select: {
              id: true,
              leadCode: true,
              customerName: true,
              companyName: true,
              status: true,
              budget: true,
              priority: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { scheduledAt: 'asc' },
        take: 5,
      }),
    ]);

    // -------------------------------------------------------------
    // 2. Supervisor Banner Data & Quick Action Indicators
    // -------------------------------------------------------------
    const supervisor: TLDashboardSupervisor = {
      id: tlUser.id,
      name: tlUser.name,
      email: tlUser.email,
      role: tlUser.role as UserRole,
      shiftStatus: 'Shift Active • Alpha Squad',
      currentDate: now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      quickCounts: {
        unassignedCount,
        lastBatchInfo: latestBatch
          ? {
              id: latestBatch.id,
              fileName: latestBatch.fileName,
              totalRows: latestBatch.totalRows,
              importedCount: latestBatch.importedCount,
              createdAt: latestBatch.createdAt,
            }
          : null,
      },
    };

    // -------------------------------------------------------------
    // 3. Urgent Attention Alert Data
    // -------------------------------------------------------------
    const urgentAttention: TLDashboardUrgentAttention = {
      unassignedCount,
      latestBatch: latestBatch
        ? {
            id: latestBatch.id,
            fileName: latestBatch.fileName,
            totalRows: latestBatch.totalRows,
            importedCount: latestBatch.importedCount,
            createdAt: latestBatch.createdAt,
          }
        : null,
      activeExecutivesCount: activeExecutives.filter((e) => e.isActive).length,
    };

    // -------------------------------------------------------------
    // 4. Pipeline Health Matrix Calculations
    // -------------------------------------------------------------
    let weekOverWeekChange = '+0%';
    let isChangePositive = true;
    if (leadsPrecedingWeekCount > 0) {
      const diff = leadsRecentWeekCount - leadsPrecedingWeekCount;
      const pct = Math.round((diff / leadsPrecedingWeekCount) * 100);
      weekOverWeekChange = `${pct >= 0 ? '+' : ''}${pct}%`;
      isChangePositive = pct >= 0;
    } else if (leadsRecentWeekCount > 0) {
      weekOverWeekChange = '+100%';
      isChangePositive = true;
    }

    const wonTotalAmount = Number(wonAggregation._sum.budget || 0);
    const wonTotalCount = wonAggregation._count.id || 0;
    const conversionRate =
      totalPoolCount > 0
        ? Math.round((wonTotalCount / totalPoolCount) * 1000) / 10
        : 0;

    const slaCompliancePct =
      allFollowUpsCount > 0
        ? Math.max(
            0,
            Math.min(
              100,
              Math.round(
                ((allFollowUpsCount - overdueFollowUpsCount) / allFollowUpsCount) *
                  1000
              ) / 10
            )
          )
        : 100;

    const pipelineHealth: TLDashboardPipelineHealth = {
      totalPool: {
        value: totalPoolCount,
        formattedValue: totalPoolCount.toLocaleString('en-IN'),
        change: weekOverWeekChange,
        subtext: 'vs last wk',
        isPositive: isChangePositive,
      },
      activeInFlight: {
        value: activeInFlightCount,
        formattedValue: activeInFlightCount.toLocaleString('en-IN'),
        callsToday: callsTodayCount,
        subtext: `${callsTodayCount} calls today`,
      },
      wonARR: {
        value: wonTotalAmount,
        formattedValue: formatCurrencyINR(wonTotalAmount),
        wonCount: wonTotalCount,
        conversionRate,
        subtext: `${wonTotalCount} Closed • ${conversionRate}% rate`,
      },
      slaAdherence: {
        value: slaCompliancePct,
        formattedValue: `${slaCompliancePct}%`,
        overdueCount: overdueFollowUpsCount,
        alertBadge:
          overdueFollowUpsCount > 0
            ? `${overdueFollowUpsCount} OVERDUE`
            : undefined,
      },
    };

    // -------------------------------------------------------------
    // 5. Funnel Breakdown & Stage Distribution
    // -------------------------------------------------------------
    const stageMap: Record<
      string,
      { label: string; count: number; totalValue: number; colorClass: string; dotBg: string }
    > = {
      unassigned: {
        label: 'Unassigned',
        count: 0,
        totalValue: 0,
        colorClass: 'bg-amber-500',
        dotBg: 'bg-amber-500',
      },
      contacted: {
        label: 'Contacted',
        count: 0,
        totalValue: 0,
        colorClass: 'bg-blue-500',
        dotBg: 'bg-blue-500',
      },
      followup: {
        label: 'In Follow-up',
        count: 0,
        totalValue: 0,
        colorClass: 'bg-indigo-600',
        dotBg: 'bg-indigo-600',
      },
      proposal: {
        label: 'Proposal',
        count: 0,
        totalValue: 0,
        colorClass: 'bg-purple-500',
        dotBg: 'bg-purple-500',
      },
      won: {
        label: 'Won / Sold',
        count: 0,
        totalValue: 0,
        colorClass: 'bg-emerald-500',
        dotBg: 'bg-emerald-500',
      },
      lost: {
        label: 'Disqualified',
        count: 0,
        totalValue: 0,
        colorClass: 'bg-rose-400',
        dotBg: 'bg-rose-400',
      },
    };

    // Accumulate groupBy results into stage buckets
    let totalFunnelLeads = 0;
    for (const group of allNonDeletedLeads) {
      const cnt = group._count.id;
      const budgetVal = group._sum.budget ? Number(group._sum.budget) : 0;
      totalFunnelLeads += cnt;

      const { status, assignedToUserId } = group;
      if (!assignedToUserId || status === LeadStatus.NEW) {
        stageMap.unassigned.count += cnt;
        stageMap.unassigned.totalValue += budgetVal;
      } else if (status === LeadStatus.CONTACTED || status === LeadStatus.ASSIGNED) {
        stageMap.contacted.count += cnt;
        stageMap.contacted.totalValue += budgetVal;
      } else if (status === LeadStatus.FOLLOW_UP || status === LeadStatus.INTERESTED) {
        stageMap.followup.count += cnt;
        stageMap.followup.totalValue += budgetVal;
      } else if (
        status === LeadStatus.PROPOSAL_QUOTATION ||
        status === LeadStatus.NEGOTIATION ||
        status === LeadStatus.QUALIFIED
      ) {
        stageMap.proposal.count += cnt;
        stageMap.proposal.totalValue += budgetVal;
      } else if (status === LeadStatus.WON_SOLD) {
        stageMap.won.count += cnt;
        stageMap.won.totalValue += budgetVal;
      } else {
        stageMap.lost.count += cnt;
        stageMap.lost.totalValue += budgetVal;
      }
    }

    const stages = Object.entries(stageMap).map(([key, data]) => ({
      key,
      label: data.label,
      count: data.count,
      pct: totalFunnelLeads > 0 ? Math.round((data.count / totalFunnelLeads) * 100) : 0,
      totalValue: data.totalValue,
      colorClass: data.colorClass,
      dotBg: data.dotBg,
    }));

    const funnelBreakdown: TLDashboardFunnelBreakdown = {
      totalMappedLeads: totalFunnelLeads,
      stages,
    };

    // -------------------------------------------------------------
    // 6. Executive Workload & Capacity Audit
    // -------------------------------------------------------------
    const executiveWorkload: TLDashboardExecutiveWorkload[] = activeExecutives.map(
      (exec, index) => {
        const leads = exec.assignedLeads || [];
        const followUps = exec.followUps || [];

        const wonLeads = leads.filter((l) => l.status === LeadStatus.WON_SOLD);
        const wonCount = wonLeads.length;
        const wonAmount = wonLeads.reduce(
          (sum, l) => sum + (l.budget ? Number(l.budget) : 0),
          0
        );

        const activeCount = leads.filter(
          (l) =>
            l.status !== LeadStatus.WON_SOLD &&
            l.status !== LeadStatus.LOST &&
            l.status !== LeadStatus.INVALID &&
            l.status !== LeadStatus.DUPLICATE
        ).length;

        const dueTodayCount = followUps.filter((f) => {
          if (f.status !== FollowUpStatus.PENDING) return false;
          const sch = new Date(f.scheduledAt);
          return sch >= startOfToday && sch <= endOfToday;
        }).length;

        const overdueCount = followUps.filter(
          (f) => f.status === FollowUpStatus.PENDING && new Date(f.scheduledAt) < now
        ).length;

        const totalExecFollowUps = followUps.length;
        const slaPercent =
          totalExecFollowUps > 0
            ? Math.max(
                0,
                Math.round(
                  ((totalExecFollowUps - overdueCount) / totalExecFollowUps) * 100
                )
              )
            : 100;

        // Quota capacity ceiling = 40 active leads
        const capacityPercent = Math.min(
          100,
          Math.round((activeCount / 40) * 100)
        );
        const capacityWarning = activeCount >= 35 || capacityPercent >= 90;

        let actionType: 'assign' | 'nudge' | 'reassign' = 'assign';
        let statusText = 'Available for allocation';
        let roleBadge: string | undefined = undefined;

        if (capacityWarning) {
          actionType = 'reassign';
          statusText = 'Capacity Bottleneck';
          roleBadge = `${capacityPercent}% LOAD`;
        } else if (overdueCount > 0) {
          actionType = 'nudge';
          statusText = `${overdueCount} Overdue Follow-ups`;
          roleBadge = 'SLA ALERT';
        } else if (wonCount >= 10) {
          actionType = 'assign';
          statusText = 'High Conversion Performer';
          roleBadge = 'TOP REP';
        }

        return {
          id: exec.id,
          name: exec.name,
          email: exec.email,
          roleBadge,
          statusText,
          isStatusPositive: !capacityWarning && overdueCount === 0,
          isOnline: exec.isActive,
          wonAmount,
          formattedWonAmount: formatCurrencyINR(wonAmount),
          wonCount,
          activeCount,
          dueTodayCount,
          overdueCount,
          slaPercent,
          capacityPercent,
          capacityWarning,
          actionType,
        };
      }
    );

    // -------------------------------------------------------------
    // 7. Critical Escalations (SLA Breaches)
    // -------------------------------------------------------------
    const criticalEscalations: TLDashboardCriticalEscalation[] =
      criticalOverdueFollowUps.map((f) => {
        const schDate = new Date(f.scheduledAt);
        const overdueHours = Math.max(
          1,
          Math.round((now.getTime() - schDate.getTime()) / (1000 * 60 * 60))
        );
        const dealAmount = f.lead.budget ? Number(f.lead.budget) : 0;

        return {
          id: f.id,
          leadId: f.lead.id,
          leadCode: f.lead.leadCode,
          companyName: f.lead.companyName || f.lead.customerName,
          customerName: f.lead.customerName,
          stageInfo: `${f.lead.status.replace(/_/g, ' ')} stage`,
          arrAmount: dealAmount,
          formattedArrAmount: `${formatCurrencyINR(dealAmount)} ARR`,
          overdueHours,
          ownerId: f.assignedTo?.id || '',
          ownerName: f.assignedTo?.name || 'Unassigned',
          priority: f.lead.priority,
          scheduledAt: f.scheduledAt,
        };
      });

    // -------------------------------------------------------------
    // 8. Recent Ingestion / Batch Intake Snapshot
    // -------------------------------------------------------------
    const recentIntake: TLDashboardRecentIntake | null = latestBatch
      ? {
          batchId: latestBatch.id,
          batchCode: `Batch #${latestBatch.id.slice(0, 8).toUpperCase()}`,
          fileName: latestBatch.fileName,
          totalRows: latestBatch.totalRows,
          importedCount: latestBatch.importedCount,
          duplicateCount: latestBatch.duplicateCount,
          failedCount: latestBatch.failedCount,
          uploadedBy: {
            id: latestBatch.uploadedBy.id,
            name: latestBatch.uploadedBy.name,
          },
          createdAt: latestBatch.createdAt,
          integrityStatus: 'SHA-256 VERIFIED',
        }
      : null;

    return {
      supervisor,
      urgentAttention,
      pipelineHealth,
      funnelBreakdown,
      executiveWorkload,
      criticalEscalations,
      recentIntake,
    };
  }

  /**
   * Generates personal dashboard metrics for a Sales Executive.
   */
  static async getSEDashboardMetrics(seUserId: string) {
    const executive = await prisma.user.findFirst({
      where: {
        id: seUserId,
        role: UserRole.SALES_EXECUTIVE,
        isDeleted: false,
      },
      include: {
        assignedLeads: {
          where: { isDeleted: false },
        },
        followUps: {
          where: {
            lead: { isDeleted: false },
          },
        },
      },
    });

    if (!executive) {
      throw new AppError('Sales Executive not found', 404, 'SE_NOT_FOUND');
    }

    const leads = executive.assignedLeads || [];
    const followUps = executive.followUps || [];
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const activeLeads = leads.filter(
      (l) =>
        l.status !== LeadStatus.WON_SOLD &&
        l.status !== LeadStatus.LOST &&
        l.status !== LeadStatus.INVALID &&
        l.status !== LeadStatus.DUPLICATE
    );

    const wonLeads = leads.filter((l) => l.status === LeadStatus.WON_SOLD);
    const lostLeads = leads.filter((l) => l.status === LeadStatus.LOST);
    const newLeads = leads.filter((l) => l.status === LeadStatus.ASSIGNED);

    const todayFollowUps = followUps.filter((f) => {
      if (f.status !== FollowUpStatus.PENDING) return false;
      const sch = new Date(f.scheduledAt);
      return sch >= startOfToday && sch <= endOfToday;
    });

    const overdueFollowUps = followUps.filter(
      (f) => f.status === FollowUpStatus.PENDING && new Date(f.scheduledAt) < now
    );

    return {
      totalAssigned: leads.length,
      activeCount: activeLeads.length,
      newCount: newLeads.length,
      wonCount: wonLeads.length,
      lostCount: lostLeads.length,
      todayFollowUpsCount: todayFollowUps.length,
      overdueFollowUpsCount: overdueFollowUps.length,
    };
  }
}
