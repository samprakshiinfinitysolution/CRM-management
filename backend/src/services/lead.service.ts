import prisma from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { UserRole, type LeadAssignmentPair } from '../types/index.js';

export interface LeadFilterParams {
  userId: string;
  status?: string;
  source?: string;
  city?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
  assignedToUserId?: string;
  search?: string;
}

export class LeadService {
  /**
   * Retrieves leads with filters, pagination, and role-based data isolation.
   * - Sales Executives: Restricted strictly to leads assigned to their userId.
   * - Team Leaders: Able to query all leads or filter by specific executive.
   */
  static async getLeadWithFilter(
    userId: string,
    status?: string,
    source?: string,
    city?: string,
    sortBy?: string,
    page: number = 1,
    limit: number = 25,
    assignedToUserId?: string,
    search?: string
  ) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      const where: any = {
        isDeleted: false,
        deletedAt: null,
      };

      if (status && status !== 'ALL') {
        where.status = status;
      }
      if (source && source !== 'ALL') {
        where.leadSource = source; // Schema field is leadSource
      }
      if (city) {
        where.city = { contains: city, mode: 'insensitive' };
      }
      if (search && search.trim()) {
        const term = search.trim();
        where.OR = [
          { leadCode: { contains: term, mode: 'insensitive' } },
          { customerName: { contains: term, mode: 'insensitive' } },
          { mobile: { contains: term } },
          { email: { contains: term, mode: 'insensitive' } },
          { city: { contains: term, mode: 'insensitive' } },
          { requirement: { contains: term, mode: 'insensitive' } },
          { companyName: { contains: term, mode: 'insensitive' } },
        ];
      }

      // Role-based data isolation (Regulation 6 in AGENTS.md)
      if (user.role === UserRole.SALES_EXECUTIVE) {
        // Sales Executives can only view their own assigned leads
        where.assignedToUserId = user.id;
      } else if (user.role === UserRole.TEAM_LEADER) {
        // Team Leaders can view all leads, or filter by a specific executive
        if (assignedToUserId) {
          where.assignedToUserId = assignedToUserId;
        }
      }

      const safePage = Math.max(1, page || 1);
      const safeLimit = Math.max(1, Math.min(100, limit || 25));
      const skip = (safePage - 1) * safeLimit;

      // Handle sorting
      let orderBy: any = { createdAt: 'desc' };
      if (sortBy) {
        const [field, direction] = sortBy.split(':');
        if (field) {
          orderBy = { [field]: direction === 'asc' ? 'asc' : 'desc' };
        }
      }

      const [leads, total] = await Promise.all([
        prisma.lead.findMany({
          where,
          skip,
          take: safeLimit,
          orderBy,
          include: {
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }),
        prisma.lead.count({ where }),
      ]);

      return {
        leads,
        pagination: {
          page: safePage,
          limit: safeLimit,
          total,
          totalPages: Math.ceil(total / safeLimit),
        },
      };
    } catch (error) {
      console.error('Error in getLeadWithFilter:', error);
      throw error;
    }
  }

  // Instance method for backwards compatibility
  async getLeadWithFilter(
    userId: string,
    status?: string,
    source?: string,
    city?: string,
    sortBy?: string,
    page?: number,
    limit?: number,
    assignedToUserId?: string
  ) {
    return LeadService.getLeadWithFilter(
      userId,
      status,
      source,
      city,
      sortBy,
      page,
      limit,
      assignedToUserId
    );
  }

  // =========================================================================
  // LEAD DISTRIBUTION & ASSIGNMENT TRANSACTION ENGINE (Phase 3 & ACID Engine)
  // =========================================================================

  /**
   * Distributes leads equally across selected sales executives.
   * Auto split with remainder distributed sequentially to the first remainder executives.
   * e.g., 100 leads across 3 executives -> 34, 33, 33
   */
  static distributeEqually(leadIds: string[], executiveIds: string[]): LeadAssignmentPair[] {
    if (leadIds.length === 0) {
      throw new AppError('No leads available for equal distribution', 400, 'NO_LEADS_AVAILABLE');
    }
    if (executiveIds.length === 0) {
      throw new AppError('No sales executives provided for equal distribution', 400, 'NO_EXECUTIVES_SELECTED');
    }

    const assignments: LeadAssignmentPair[] = [];
    const baseCount = Math.floor(leadIds.length / executiveIds.length);
    const remainder = leadIds.length % executiveIds.length;

    let index = 0;
    for (let i = 0; i < executiveIds.length; i++) {
      const count = baseCount + (i < remainder ? 1 : 0);
      for (let j = 0; j < count; j++) {
        if (index < leadIds.length) {
          assignments.push({
            leadId: leadIds[index],
            salesExecutiveId: executiveIds[i],
          });
          index++;
        }
      }
    }

    return assignments;
  }

  /**
   * Distributes leads based on explicit requested quota per executive.
   * e.g., Exec 1 -> 20, Exec 2 -> 10, Exec 3 -> 5
   */
  static distributeCustom(
    leadIds: string[],
    allocations: { salesExecutiveId: string; count: number }[]
  ): LeadAssignmentPair[] {
    if (!allocations || allocations.length === 0) {
      throw new AppError('No custom allocations provided', 400, 'NO_ALLOCATIONS_PROVIDED');
    }

    const totalRequested = allocations.reduce((sum, item) => sum + (Number(item.count) || 0), 0);
    if (totalRequested <= 0) {
      throw new AppError('Total allocated lead quota must be greater than zero', 400, 'INVALID_QUOTA_COUNT');
    }

    if (totalRequested > leadIds.length) {
      throw new AppError(
        `Requested ${totalRequested} leads but only ${leadIds.length} leads are available in pool`,
        400,
        'INSUFFICIENT_LEADS'
      );
    }

    const assignments: LeadAssignmentPair[] = [];
    let leadIndex = 0;

    for (const allocation of allocations) {
      const quota = Number(allocation.count) || 0;
      for (let i = 0; i < quota; i++) {
        if (leadIndex < leadIds.length) {
          assignments.push({
            leadId: leadIds[leadIndex],
            salesExecutiveId: allocation.salesExecutiveId,
          });
          leadIndex++;
        }
      }
    }

    return assignments;
  }

  /**
   * Validates explicit 1:1 lead-to-executive mappings.
   */
  static async validateExplicitAssignments(
    tx: any,
    assignments: { leadId: string; salesExecutiveId: string }[]
  ): Promise<LeadAssignmentPair[]> {
    if (!assignments || assignments.length === 0) {
      throw new AppError('No explicit assignments provided', 400, 'NO_ASSIGNMENTS_PROVIDED');
    }

    const leadIds = assignments.map((a) => a.leadId);
    const executiveIds = Array.from(new Set(assignments.map((a) => a.salesExecutiveId)));

    // Verify all requested leads exist and are eligible for assignment
    const leadRecords = await tx.lead.findMany({
      where: {
        id: { in: leadIds },
        isDeleted: false,
      },
      select: {
        id: true,
        status: true,
        assignedToUserId: true,
      },
    });

    if (leadRecords.length !== leadIds.length) {
      throw new AppError('One or more requested leads do not exist or have been removed', 400, 'LEAD_NOT_FOUND');
    }

    // Verify all assigned executives exist, are approved, active, and have the correct role
    const executiveRecords = await tx.user.findMany({
      where: {
        id: { in: executiveIds },
        role: UserRole.SALES_EXECUTIVE,
        isActive: true,
        isDeleted: false,
      },
      select: {
        id: true,
      },
    });

    if (executiveRecords.length !== executiveIds.length) {
      throw new AppError(
        'One or more assigned sales executives are not approved, inactive, or not found',
        400,
        'UNAPPROVED_OR_INACTIVE_EXECUTIVE'
      );
    }

    return assignments.map((a) => ({
      leadId: a.leadId,
      salesExecutiveId: a.salesExecutiveId,
    }));
  }

  /**
   * Retrieves available unassigned leads from the database inside transaction.
   * If specific leadIds are requested, validates them; otherwise fetches from unassigned pool.
   */
  static async getAvailableLeads(tx: any, requestedLeadIds?: string[], countNeeded?: number): Promise<string[]> {
    if (requestedLeadIds && requestedLeadIds.length > 0) {
      const records = await tx.lead.findMany({
        where: {
          id: { in: requestedLeadIds },
          isDeleted: false,
        },
        select: {
          id: true,
          status: true,
          assignedToUserId: true,
        },
      });

      if (records.length !== requestedLeadIds.length) {
        throw new AppError('One or more requested leads do not exist or are invalid', 400, 'LEADS_NOT_FOUND');
      }

      // Check if any lead is protected or already assigned
      const alreadyAssigned = records.filter(
        (l: any) => l.assignedToUserId !== null || l.status === 'WON_SOLD' || l.status === 'LOST'
      );
      if (alreadyAssigned.length > 0) {
        throw new AppError(
          `Cannot distribute: ${alreadyAssigned.length} lead(s) are already assigned or closed`,
          400,
          'LEADS_ALREADY_ASSIGNED'
        );
      }

      return requestedLeadIds;
    }

    // Otherwise, fetch from open unassigned pool (status: NEW & assignedToUserId: null)
    const unassignedLeads = await tx.lead.findMany({
      where: {
        isDeleted: false,
        assignedToUserId: null,
        status: 'NEW',
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: countNeeded,
      select: {
        id: true,
      },
    });

    if (unassignedLeads.length === 0) {
      throw new AppError('No unassigned leads available in the pool', 404, 'UNASSIGNED_POOL_EMPTY');
    }

    return unassignedLeads.map((l: any) => l.id);
  }

  /**
   * Validates that sales executives exist, are active, and have the correct role.
   */
  static async validateExecutives(
    tx: any,
    executiveIds: string[]
  ): Promise<Array<{ id: string; name: string; email: string }>> {
    const uniqueIds = Array.from(new Set(executiveIds.filter(Boolean)));
    if (uniqueIds.length === 0) {
      throw new AppError('No sales executives provided for assignment', 400, 'NO_EXECUTIVES_PROVIDED');
    }

    const executives = await tx.user.findMany({
      where: {
        id: { in: uniqueIds },
        role: UserRole.SALES_EXECUTIVE,
        isActive: true,
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (executives.length !== uniqueIds.length) {
      throw new AppError(
        'One or more sales executives are inactive, unapproved, or invalid',
        400,
        'INVALID_SALES_EXECUTIVES'
      );
    }

    return executives;
  }

  /**
   * Atomically persists lead assignments, updates lead statuses,
   * creates immutable historical records in LeadAssignment, LeadStatusHistory, and LeadActivity.
   */
  static async persistAssignments(
    tx: any,
    assignments: LeadAssignmentPair[],
    assignedByUserId: string,
    reason: string = 'Lead Distribution Engine'
  ): Promise<void> {
    const now = new Date();

    for (const assignment of assignments) {
      // 1. Update Lead with new assignee and status ASSIGNED
      await tx.lead.update({
        where: { id: assignment.leadId },
        data: {
          assignedToUserId: assignment.salesExecutiveId,
          assignedByUserId: assignedByUserId,
          assignedAt: now,
          status: 'ASSIGNED',
        },
      });

      // 2. Insert into LeadAssignment historical ledger (Regulation 3)
      await tx.leadAssignment.create({
        data: {
          leadId: assignment.leadId,
          assignedToUserId: assignment.salesExecutiveId,
          assignedByUserId: assignedByUserId,
          assignedAt: now,
          reason,
        },
      });

      // 3. Insert status change into LeadStatusHistory
      await tx.leadStatusHistory.create({
        data: {
          leadId: assignment.leadId,
          oldStatus: 'NEW',
          newStatus: 'ASSIGNED',
          changedByUserId: assignedByUserId,
          notes: reason,
          createdAt: now,
        },
      });

      // 4. Append chronological activity log to LeadActivity
      await tx.leadActivity.create({
        data: {
          leadId: assignment.leadId,
          actorUserId: assignedByUserId,
          actionType: 'LEAD_ASSIGNED',
          description: `Lead assigned to executive`,
          metadata: {
            assignedToUserId: assignment.salesExecutiveId,
            assignedAt: now.toISOString(),
          },
          createdAt: now,
        },
      });
    }
  }

  /**
   * Main ACID Transaction for Lead Assignment / Distribution Engine.
   * Supports EQUAL, CUSTOM, and EXPLICIT assignment modes.
   */
  static async assignLeads(
    input: {
      mode: 'EQUAL' | 'CUSTOM' | 'EXPLICIT';
      leadIds?: string[];
      executiveIds?: string[];
      allocations?: { salesExecutiveId: string; count: number }[];
      assignments?: { leadId: string; salesExecutiveId: string }[];
      reason?: string;
    },
    assignedByUserId: string
  ) {
    return prisma.$transaction(
      async (tx) => {
        let assignmentPairs: LeadAssignmentPair[] = [];
        let participatingExecutiveIds: string[] = [];

        switch (input.mode) {
          case 'EQUAL': {
            const execIds = input.executiveIds || [];
            if (execIds.length === 0) {
              throw new AppError('Please select at least one sales executive', 400, 'NO_EXECUTIVES_SELECTED');
            }

            // Validate participating executives
            const validatedExecs = await LeadService.validateExecutives(tx, execIds);
            participatingExecutiveIds = validatedExecs.map((e) => e.id);

            // Fetch available leads (either specific requested leadIds or all unassigned pool)
            const availableLeadIds = await LeadService.getAvailableLeads(tx, input.leadIds);

            // Compute equal split
            assignmentPairs = LeadService.distributeEqually(availableLeadIds, participatingExecutiveIds);
            break;
          }

          case 'CUSTOM': {
            const allocations = input.allocations || [];
            if (allocations.length === 0) {
              throw new AppError('Please provide custom executive allocations', 400, 'NO_ALLOCATIONS_PROVIDED');
            }

            // Validate allocated executives
            const customExecIds = allocations.map((a) => a.salesExecutiveId);
            const validatedExecs = await LeadService.validateExecutives(tx, customExecIds);
            participatingExecutiveIds = validatedExecs.map((e) => e.id);

            const totalRequested = allocations.reduce((sum, item) => sum + (Number(item.count) || 0), 0);
            const availableLeadIds = await LeadService.getAvailableLeads(tx, input.leadIds, totalRequested);

            // Compute custom distribution
            assignmentPairs = LeadService.distributeCustom(availableLeadIds, allocations);
            break;
          }

          case 'EXPLICIT': {
            const explicitAssignments = input.assignments || [];
            if (explicitAssignments.length === 0) {
              throw new AppError('Please provide explicit lead-to-executive mappings', 400, 'NO_ASSIGNMENTS_PROVIDED');
            }

            assignmentPairs = await LeadService.validateExplicitAssignments(tx, explicitAssignments);
            participatingExecutiveIds = Array.from(new Set(assignmentPairs.map((a) => a.salesExecutiveId)));
            break;
          }

          default:
            throw new AppError('Invalid assignment mode. Expected EQUAL, CUSTOM, or EXPLICIT', 400, 'INVALID_MODE');
        }

        if (assignmentPairs.length === 0) {
          throw new AppError('No assignments could be generated from the provided input', 400, 'EMPTY_ASSIGNMENTS');
        }

        // Atomically persist all assignments and immutable audit/history records
        await LeadService.persistAssignments(
          tx,
          assignmentPairs,
          assignedByUserId,
          input.reason || `Distribution Engine (${input.mode})`
        );

        // Compute summary breakdown
        const execMap = new Map<string, number>();
        for (const pair of assignmentPairs) {
          execMap.set(pair.salesExecutiveId, (execMap.get(pair.salesExecutiveId) || 0) + 1);
        }

        const executiveRecords = await tx.user.findMany({
          where: { id: { in: Array.from(execMap.keys()) } },
          select: { id: true, name: true },
        });

        const breakdown = executiveRecords.map((exec: any) => ({
          salesExecutiveId: exec.id,
          executiveName: exec.name,
          count: execMap.get(exec.id) || 0,
        }));

        return {
          assignedCount: assignmentPairs.length,
          mode: input.mode,
          allocations: breakdown,
          assignments: assignmentPairs,
        };
      },
      {
        maxWait: 5000,
        timeout: 15000,
      }
    );
  }
}