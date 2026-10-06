import prisma from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { UserRole, FollowUpStatus, LeadStatus } from '../types/index.js';
import { getBusinessDayRange } from '../utils/timezone.helper.js';
import AuditService from './audit.service.js';

// ---------------------------------------------------------------------------
// Input Types
// ---------------------------------------------------------------------------

export interface CreateFollowUpInput {
  leadId: string;
  scheduledAt: string | Date;
  type: string; // Call | Meeting | Email | WhatsApp
  notes?: string;
}

export interface CompleteFollowUpInput {
  notes?: string;
  nextStatus?: LeadStatus; // Optional: transition lead status on completion
  nextFollowUpAt?: string | Date; // Optional: immediately reschedule after completing
  nextFollowUpType?: string;
}

export interface RescheduleFollowUpInput {
  newScheduledAt: string | Date;
  newType?: string;
  reason?: string;
}

export interface FollowUpQueryParams {
  scope?: 'today' | 'upcoming' | 'overdue' | 'completed' | 'all';
  leadId?: string;
  executiveId?: string; // TL only — filter by specific executive
  page?: number;
  limit?: number;
  timeZone?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// Allowed lead status transitions when completing a follow-up
const ALLOWED_NEXT_STATUSES: LeadStatus[] = [
  LeadStatus.CONTACTED,
  LeadStatus.INTERESTED,
  LeadStatus.FOLLOW_UP,
  LeadStatus.QUALIFIED,
  LeadStatus.PROPOSAL_QUOTATION,
  LeadStatus.NEGOTIATION,
  LeadStatus.WON_SOLD,
  LeadStatus.NOT_INTERESTED,
  LeadStatus.NO_RESPONSE,
  LeadStatus.WRONG_NUMBER,
  LeadStatus.ON_HOLD,
  LeadStatus.LOST,
];

// Statuses where lead is terminal — follow-ups cannot be created
const TERMINAL_STATUSES = new Set<LeadStatus>([LeadStatus.WON_SOLD, LeadStatus.LOST]);

// Statuses where updating lead to FOLLOW_UP is appropriate
const ELIGIBLE_FOR_FOLLOW_UP_STATUS: LeadStatus[] = [
  LeadStatus.ASSIGNED,
  LeadStatus.CONTACTED,
  LeadStatus.INTERESTED,
];

// ---------------------------------------------------------------------------
// FollowUpService
// ---------------------------------------------------------------------------

export class FollowUpService {
  /**
   * Retrieves follow-ups for the authenticated user (role-scoped).
   * Sales Executives: strictly their own assigned leads' follow-ups.
   * Team Leaders: all follow-ups, optionally filtered by executiveId.
   */
  static async getFollowUps(
    userId: string,
    userRole: UserRole,
    params: FollowUpQueryParams = {}
  ) {
    const {
      scope = 'all',
      leadId,
      executiveId,
      page = 1,
      limit = 25,
      timeZone = 'Asia/Kolkata',
    } = params;

    const { startOfToday, endOfToday } = getBusinessDayRange(new Date(), timeZone);

    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(100, limit));
    const skip = (safePage - 1) * safeLimit;

    const where: any = {
      isDeleted: false,
    };

    // RBAC data isolation (AGENTS.md Rule 10)
    if (userRole === UserRole.SALES_EXECUTIVE) {
      where.assignedToUserId = userId;
    } else if (userRole === UserRole.TEAM_LEADER && executiveId) {
      where.assignedToUserId = executiveId;
    }

    // Filter by specific lead if provided
    if (leadId) {
      where.leadId = leadId;
    }

    // Scope-based filtering with exact timezone date ranges
    switch (scope) {
      case 'today':
        where.status = FollowUpStatus.PENDING;
        where.scheduledAt = { gte: startOfToday, lte: endOfToday };
        break;
      case 'overdue':
        where.status = FollowUpStatus.PENDING;
        where.scheduledAt = { lt: startOfToday };
        break;
      case 'upcoming':
        where.status = FollowUpStatus.PENDING;
        where.scheduledAt = { gt: endOfToday };
        break;
      case 'completed':
        where.status = FollowUpStatus.COMPLETED;
        break;
      case 'all':
      default:
        break;
    }

    const [followUps, total] = await Promise.all([
      prisma.leadFollowUp.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: { scheduledAt: 'asc' },
        include: {
          lead: {
            select: {
              id: true,
              leadCode: true,
              customerName: true,
              mobile: true,
              companyName: true,
              status: true,
              priority: true,
              assignedToUserId: true,
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
      }),
      prisma.leadFollowUp.count({ where }),
    ]);

    return {
      followUps,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  /**
   * Returns aggregated counts — due today, upcoming, overdue, completed this month.
   */
  static async getFollowUpSummary(userId: string, userRole: UserRole, timeZone: string = 'Asia/Kolkata') {
    const { startOfToday, endOfToday, startOfMonth } = getBusinessDayRange(new Date(), timeZone);

    // Base ownership filter
    const ownerFilter: any =
      userRole === UserRole.SALES_EXECUTIVE
        ? { assignedToUserId: userId }
        : {};

    const [dueToday, upcoming, overdue, completedThisMonth] = await Promise.all([
      prisma.leadFollowUp.count({
        where: {
          ...ownerFilter,
          isDeleted: false,
          status: FollowUpStatus.PENDING,
          scheduledAt: { gte: startOfToday, lte: endOfToday },
        },
      }),
      prisma.leadFollowUp.count({
        where: {
          ...ownerFilter,
          isDeleted: false,
          status: FollowUpStatus.PENDING,
          scheduledAt: { gt: endOfToday },
        },
      }),
      prisma.leadFollowUp.count({
        where: {
          ...ownerFilter,
          isDeleted: false,
          status: FollowUpStatus.PENDING,
          scheduledAt: { lt: startOfToday },
        },
      }),
      prisma.leadFollowUp.count({
        where: {
          ...ownerFilter,
          isDeleted: false,
          status: FollowUpStatus.COMPLETED,
          completedAt: { gte: startOfMonth },
        },
      }),
    ]);

    return { dueToday, upcoming, overdue, completedThisMonth };
  }

  /**
   * Creates a new follow-up for a lead.
   * Atomically: creates follow-up, updates lead status to FOLLOW_UP (if eligible),
   * appends to LeadStatusHistory and LeadActivity.
   */
  static async createFollowUp(
    input: CreateFollowUpInput,
    actorUserId: string,
    actorRole: UserRole
  ) {
    const scheduledAt = new Date(input.scheduledAt);
    if (isNaN(scheduledAt.getTime())) {
      throw new AppError('Invalid scheduledAt date', 400, 'INVALID_DATE');
    }

    return prisma.$transaction(async (tx) => {
      // 1. Validate lead exists
      const lead = await tx.lead.findFirst({
        where: { id: input.leadId, isDeleted: false },
        select: {
          id: true,
          leadCode: true,
          status: true,
          assignedToUserId: true,
          customerName: true,
        },
      });

      if (!lead) {
        throw new AppError('Lead not found', 404, 'LEAD_NOT_FOUND');
      }

      // 2. RBAC: Sales Executives can only schedule follow-ups on their own leads
      if (
        actorRole === UserRole.SALES_EXECUTIVE &&
        lead.assignedToUserId !== actorUserId
      ) {
        throw new AppError(
          'You can only schedule follow-ups for leads assigned to you',
          403,
          'FORBIDDEN'
        );
      }

      // 3. Terminal status guard — block follow-ups on closed leads
      if (TERMINAL_STATUSES.has(lead.status as LeadStatus)) {
        throw new AppError(
          `Cannot schedule a follow-up on a ${lead.status} lead. Contact your Team Leader to reopen.`,
          400,
          'LEAD_TERMINAL_STATUS'
        );
      }

      // 4. Create the LeadFollowUp record
      const followUp = await tx.leadFollowUp.create({
        data: {
          leadId: input.leadId,
          assignedToUserId: lead.assignedToUserId ?? actorUserId,
          scheduledAt,
          type: input.type,
          status: FollowUpStatus.PENDING,
          notes: input.notes ?? null,
        },
        include: {
          lead: {
            select: {
              id: true,
              leadCode: true,
              customerName: true,
              mobile: true,
              status: true,
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
      });

      // 5. Update lead status to FOLLOW_UP if still in early pipeline stage
      if (ELIGIBLE_FOR_FOLLOW_UP_STATUS.includes(lead.status as LeadStatus)) {
        await tx.lead.update({
          where: { id: input.leadId },
          data: { status: 'FOLLOW_UP' },
        });

        // Append LeadStatusHistory record (immutable — Rule 13)
        await tx.leadStatusHistory.create({
          data: {
            leadId: input.leadId,
            oldStatus: lead.status,
            newStatus: 'FOLLOW_UP',
            changedByUserId: actorUserId,
            notes: `Follow-up scheduled: ${input.type} at ${scheduledAt.toISOString()}`,
          },
        });
      }

      // 6. Append chronological activity record (immutable — Rule 15)
      await tx.leadActivity.create({
        data: {
          leadId: input.leadId,
          actorUserId: actorUserId,
          actionType: 'FOLLOW_UP_SCHEDULED',
          description: `Follow-up (${input.type}) scheduled for ${scheduledAt.toLocaleString('en-IN')}`,
          metadata: {
            followUpId: followUp.id,
            scheduledAt: scheduledAt.toISOString(),
            type: input.type,
            notes: input.notes,
          },
        },
      });

      // 7. Atomic AuditLog entry for follow-up creation
      await AuditService.log({
        tx,
        actorUserId,
        action: 'CREATE',
        entityType: 'LeadFollowUp',
        entityId: followUp.id,
        newValue: {
          leadId: input.leadId,
          type: input.type,
          scheduledAt: scheduledAt.toISOString(),
          assignedToUserId: followUp.assignedToUserId,
          notes: input.notes,
        },
      });

      return followUp;
    });
  }

  /**
   * Marks a follow-up as COMPLETED.
   * Atomically: updates follow-up with compare-and-swap, optionally updates lead status,
   * appends to LeadNote (outcome), LeadStatusHistory, and LeadActivity.
   */
  static async completeFollowUp(
    followUpId: string,
    input: CompleteFollowUpInput,
    actorUserId: string,
    actorRole: UserRole
  ) {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch and validate follow-up
      const followUp = await tx.leadFollowUp.findFirst({
        where: { id: followUpId, isDeleted: false },
        include: {
          lead: {
            select: {
              id: true,
              status: true,
              leadCode: true,
              customerName: true,
              assignedToUserId: true,
            },
          },
        },
      });

      if (!followUp) {
        throw new AppError('Follow-up not found', 404, 'FOLLOW_UP_NOT_FOUND');
      }

      if (followUp.status === FollowUpStatus.COMPLETED) {
        throw new AppError('Follow-up is already completed', 409, 'ALREADY_COMPLETED');
      }

      if (TERMINAL_STATUSES.has(followUp.lead.status as LeadStatus)) {
        throw new AppError(
          `Cannot complete follow-up on ${followUp.lead.status} lead`,
          400,
          'LEAD_TERMINAL_STATUS'
        );
      }

      // 2. RBAC ownership check (must be assigned to this executive or executive owns the lead)
      if (
        actorRole === UserRole.SALES_EXECUTIVE &&
        followUp.assignedToUserId !== actorUserId &&
        followUp.lead.assignedToUserId !== actorUserId
      ) {
        throw new AppError(
          'You can only complete follow-ups assigned to you',
          403,
          'FORBIDDEN'
        );
      }

      const now = new Date();

      // 3. Atomic Compare-and-Swap: ensure status is PENDING and update to COMPLETED
      const updateResult = await tx.leadFollowUp.updateMany({
        where: {
          id: followUpId,
          status: FollowUpStatus.PENDING,
          isDeleted: false,
        },
        data: {
          status: FollowUpStatus.COMPLETED,
          completedAt: now,
          notes: input.notes ?? followUp.notes,
        },
      });

      if (updateResult.count === 0) {
        throw new AppError('Follow-up is already completed or inactive', 409, 'ALREADY_COMPLETED');
      }

      // 4. Optionally update lead status
      if (input.nextStatus && ALLOWED_NEXT_STATUSES.includes(input.nextStatus)) {
        const currentLeadStatus = followUp.lead.status as LeadStatus;
        if (currentLeadStatus !== input.nextStatus) {
          await tx.lead.update({
            where: { id: followUp.leadId },
            data: { status: input.nextStatus },
          });

          await tx.leadStatusHistory.create({
            data: {
              leadId: followUp.leadId,
              oldStatus: currentLeadStatus,
              newStatus: input.nextStatus,
              changedByUserId: actorUserId,
              notes: input.notes ?? `Status updated after follow-up completion`,
            },
          });
        }
      }

      // 5. Add outcome note to LeadNote if notes provided
      if (input.notes && input.notes.trim()) {
        await tx.leadNote.create({
          data: {
            leadId: followUp.leadId,
            authorUserId: actorUserId,
            content: `[Follow-up outcome — ${followUp.type}]: ${input.notes.trim()}`,
          },
        });
      }

      // 6. Append activity log (immutable — Rule 15)
      await tx.leadActivity.create({
        data: {
          leadId: followUp.leadId,
          actorUserId: actorUserId,
          actionType: 'FOLLOW_UP_COMPLETED',
          description: `Follow-up (${followUp.type}) completed`,
          metadata: {
            followUpId,
            completedAt: now.toISOString(),
            outcome: input.notes,
            nextStatus: input.nextStatus,
          },
        },
      });

      // 7. Optional: immediately schedule next follow-up
      let nextFollowUp = null;
      if (input.nextFollowUpAt) {
        const nextDate = new Date(input.nextFollowUpAt);
        if (isNaN(nextDate.getTime())) {
          throw new AppError('Invalid nextFollowUpAt date', 400, 'INVALID_DATE');
        }

        nextFollowUp = await tx.leadFollowUp.create({
          data: {
            leadId: followUp.leadId,
            assignedToUserId: followUp.assignedToUserId,
            scheduledAt: nextDate,
            type: input.nextFollowUpType ?? followUp.type,
            status: FollowUpStatus.PENDING,
          },
        });
      }

      const completedRecord = await tx.leadFollowUp.findUnique({
        where: { id: followUpId },
        include: {
          lead: {
            select: {
              id: true,
              leadCode: true,
              customerName: true,
              status: true,
            },
          },
          assignedTo: {
            select: { id: true, name: true },
          },
        },
      });

      if (!completedRecord) {
        throw new AppError('Follow-up not found after update', 404, 'FOLLOW_UP_NOT_FOUND');
      }

      // 8. Atomic AuditLog entry for completing follow-up
      await AuditService.log({
        tx,
        actorUserId: actorUserId,
        action: 'UPDATE',
        entityType: 'LeadFollowUp',
        entityId: followUpId,
        oldValue: { status: followUp.status, scheduledAt: followUp.scheduledAt },
        newValue: {
          status: FollowUpStatus.COMPLETED,
          notes: input.notes,
          nextStatus: input.nextStatus,
          completedAt: now.toISOString(),
        },
      });

      return {
        ...completedRecord,
        nextFollowUp,
      };
    });
  }

  /**
   * Reschedules a follow-up to a new date/time.
   * Atomically: marks old record as MISSED (compare-and-swap), creates new PENDING record,
   * appends to LeadActivity.
   */
  static async rescheduleFollowUp(
    followUpId: string,
    input: RescheduleFollowUpInput,
    actorUserId: string,
    actorRole: UserRole
  ) {
    const newScheduledAt = new Date(input.newScheduledAt);
    if (isNaN(newScheduledAt.getTime())) {
      throw new AppError('Invalid newScheduledAt date', 400, 'INVALID_DATE');
    }

    return prisma.$transaction(async (tx) => {
      // 1. Fetch and validate follow-up
      const followUp = await tx.leadFollowUp.findFirst({
        where: { id: followUpId, isDeleted: false },
        include: {
          lead: {
            select: {
              id: true,
              status: true,
              assignedToUserId: true,
              leadCode: true,
              customerName: true,
            },
          },
        },
      });

      if (!followUp) {
        throw new AppError('Follow-up not found', 404, 'FOLLOW_UP_NOT_FOUND');
      }

      if (followUp.status === FollowUpStatus.COMPLETED) {
        throw new AppError(
          'A completed follow-up cannot be rescheduled',
          409,
          'ALREADY_COMPLETED'
        );
      }

      // 2. RBAC ownership check
      if (
        actorRole === UserRole.SALES_EXECUTIVE &&
        followUp.assignedToUserId !== actorUserId &&
        followUp.lead.assignedToUserId !== actorUserId
      ) {
        throw new AppError(
          'You can only reschedule follow-ups assigned to you',
          403,
          'FORBIDDEN'
        );
      }

      // 3. Atomic Compare-and-Swap: mark old follow-up as MISSED
      const updateResult = await tx.leadFollowUp.updateMany({
        where: {
          id: followUpId,
          status: FollowUpStatus.PENDING,
          isDeleted: false,
        },
        data: { status: FollowUpStatus.MISSED },
      });

      if (updateResult.count === 0) {
        throw new AppError(
          'Follow-up is already processed or inactive',
          409,
          'ALREADY_COMPLETED'
        );
      }

      // 4. Create new PENDING follow-up with new date
      const newFollowUp = await tx.leadFollowUp.create({
        data: {
          leadId: followUp.leadId,
          assignedToUserId: followUp.assignedToUserId,
          scheduledAt: newScheduledAt,
          type: input.newType ?? followUp.type,
          status: FollowUpStatus.PENDING,
          notes: input.reason ?? null,
        },
        include: {
          lead: {
            select: {
              id: true,
              leadCode: true,
              customerName: true,
              status: true,
            },
          },
          assignedTo: {
            select: { id: true, name: true },
          },
        },
      });

      // 5. Append activity log (immutable — Rule 15)
      await tx.leadActivity.create({
        data: {
          leadId: followUp.leadId,
          actorUserId: actorUserId,
          actionType: 'FOLLOW_UP_RESCHEDULED',
          description: `Follow-up rescheduled to ${newScheduledAt.toISOString()}`,
          metadata: {
            oldFollowUpId: followUpId,
            newFollowUpId: newFollowUp.id,
            oldScheduledAt: followUp.scheduledAt.toISOString(),
            newScheduledAt: newScheduledAt.toISOString(),
            reason: input.reason,
          },
        },
      });

      // 6. Atomic AuditLog entry for rescheduling follow-up
      await AuditService.log({
        tx,
        actorUserId,
        action: 'UPDATE',
        entityType: 'LeadFollowUp',
        entityId: followUpId,
        oldValue: { scheduledAt: followUp.scheduledAt.toISOString() },
        newValue: {
          newFollowUpId: newFollowUp.id,
          newScheduledAt: newScheduledAt.toISOString(),
          reason: input.reason,
        },
      });

      return newFollowUp;
    });
  }

  /**
   * Soft-deletes a follow-up (AGENTS.md Rule 16 — no hard deletion).
   */
  static async deleteFollowUp(
    followUpId: string,
    actorUserId: string,
    actorRole: UserRole
  ) {
    const followUp = await prisma.leadFollowUp.findFirst({
      where: { id: followUpId, isDeleted: false },
      include: {
        lead: { select: { assignedToUserId: true } },
      },
    });

    if (!followUp) {
      throw new AppError('Follow-up not found', 404, 'FOLLOW_UP_NOT_FOUND');
    }

    if (
      actorRole === UserRole.SALES_EXECUTIVE &&
      followUp.assignedToUserId !== actorUserId &&
      followUp.lead.assignedToUserId !== actorUserId
    ) {
      throw new AppError(
        'You can only delete follow-ups assigned to you',
        403,
        'FORBIDDEN'
      );
    }

    await prisma.leadFollowUp.update({
      where: { id: followUpId },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    await AuditService.log({
      actorUserId,
      action: 'DELETE',
      entityType: 'LeadFollowUp',
      entityId: followUpId,
      oldValue: {
        isDeleted: false,
        leadId: followUp.leadId,
        type: followUp.type,
        scheduledAt: followUp.scheduledAt.toISOString(),
      },
      newValue: {
        isDeleted: true,
      },
    });

    return { success: true };
  }

  /**
   * Retrieves all follow-up records for a specific lead (timeline view).
   * RBAC scoped — sales executives can only view follow-ups for their own leads.
   */
  static async getFollowUpsForLead(
    leadId: string,
    actorUserId: string,
    actorRole: UserRole
  ) {
    // Verify lead exists and access is permitted
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, isDeleted: false },
      select: { id: true, assignedToUserId: true },
    });

    if (!lead) {
      throw new AppError('Lead not found', 404, 'LEAD_NOT_FOUND');
    }

    if (
      actorRole === UserRole.SALES_EXECUTIVE &&
      lead.assignedToUserId !== actorUserId
    ) {
      throw new AppError('Access denied to this lead', 403, 'FORBIDDEN');
    }

    return prisma.leadFollowUp.findMany({
      where: { leadId, isDeleted: false },
      orderBy: { scheduledAt: 'desc' },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  /**
   * Sweeps overdue pending follow-ups before the current business date and transitions them to MISSED.
   * Safe for recurring cron execution.
   */
  static async sweepOverdueFollowUps(timeZone: string = 'Asia/Kolkata') {
    const { startOfToday } = getBusinessDayRange(new Date(), timeZone);

    const result = await prisma.leadFollowUp.updateMany({
      where: {
        status: FollowUpStatus.PENDING,
        isDeleted: false,
        scheduledAt: { lt: startOfToday },
      },
      data: {
        status: FollowUpStatus.MISSED,
      },
    });

    return { sweptCount: result.count };
  }
}
