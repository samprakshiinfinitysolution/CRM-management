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
    search?: string,
    priority?: string
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
      if (priority && priority !== 'ALL') {
        if (priority === 'URGENT_HIGH') {
          where.priority = { in: ['URGENT', 'HIGH'] };
        } else if (['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority.toUpperCase())) {
          where.priority = priority.toUpperCase() as any;
        }
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
    assignedToUserId?: string,
    search?: string,
    priority?: string
  ) {
    return LeadService.getLeadWithFilter(
      userId,
      status,
      source,
      city,
      sortBy,
      page,
      limit,
      assignedToUserId,
      search,
      priority
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
   * creates immutable historical records in LeadAssignment, LeadStatusHistory, and LeadActivity
   * using batch queries to completely eliminate N+1 database roundtrips.
   */
  static async persistAssignments(
    tx: any,
    assignments: LeadAssignmentPair[],
    assignedByUserId: string,
    reason: string = 'Lead Distribution Engine'
  ): Promise<void> {
    const now = new Date();
    const nowIso = now.toISOString();

    // 1. Group leads by sales executive to batch update in O(K) queries instead of O(N)
    const execLeadMap = new Map<string, string[]>();
    for (const assignment of assignments) {
      const existing = execLeadMap.get(assignment.salesExecutiveId) || [];
      existing.push(assignment.leadId);
      execLeadMap.set(assignment.salesExecutiveId, existing);
    }

    // Execute batch lead updates per executive
    await Promise.all(
      Array.from(execLeadMap.entries()).map(([executiveId, leadIds]) =>
        tx.lead.updateMany({
          where: { id: { in: leadIds } },
          data: {
            assignedToUserId: executiveId,
            assignedByUserId: assignedByUserId,
            assignedAt: now,
            status: 'ASSIGNED',
          },
        })
      )
    );

    // 2. Batch insert into LeadAssignment historical ledger in 1 query
    await tx.leadAssignment.createMany({
      data: assignments.map((a) => ({
        leadId: a.leadId,
        assignedToUserId: a.salesExecutiveId,
        assignedByUserId: assignedByUserId,
        assignedAt: now,
        reason,
      })),
    });

    // 3. Batch insert status changes into LeadStatusHistory in 1 query
    await tx.leadStatusHistory.createMany({
      data: assignments.map((a) => ({
        leadId: a.leadId,
        oldStatus: 'NEW',
        newStatus: 'ASSIGNED',
        changedByUserId: assignedByUserId,
        notes: reason,
        createdAt: now,
      })),
    });

    // 4. Batch insert chronological activity logs into LeadActivity in 1 query
    await tx.leadActivity.createMany({
      data: assignments.map((a) => ({
        leadId: a.leadId,
        actorUserId: assignedByUserId,
        actionType: 'LEAD_ASSIGNED',
        description: 'Lead assigned to executive',
        metadata: {
          assignedToUserId: a.salesExecutiveId,
          assignedAt: nowIso,
        },
        createdAt: now,
      })),
    });
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

  /**
   * Retrieves single lead by ID with complete history, timeline, and security checks.
   */
  static async getLeadById(id: string, user: { id: string; role: string }) {
    const lead = await prisma.lead.findFirst({
      where: {
        OR: [{ id }, { leadCode: id }],
        isDeleted: false,
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        assignedBy: {
          select: { id: true, name: true, email: true },
        },
        followUps: {
          where: { isDeleted: false },
          orderBy: { scheduledAt: 'desc' },
          take: 20,
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 30,
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        notes: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!lead) {
      throw new AppError('Lead not found', 404, 'LEAD_NOT_FOUND');
    }

    if (user.role === UserRole.SALES_EXECUTIVE && lead.assignedToUserId !== user.id) {
      throw new AppError('You do not have permission to view this lead', 403, 'FORBIDDEN');
    }

    return lead;
  }

  /**
   * Manually creates a new lead (Team Leader only).
   */
  static async createLead(data: any, createdByUserId: string) {
    if (!data.customerName || !data.mobile || !data.requirement) {
      throw new AppError('Customer Name, Mobile, and Requirement are required', 400, 'VALIDATION_ERROR');
    }

    // Check duplicate mobile
    const existing = await prisma.lead.findFirst({
      where: {
        mobile: data.mobile.trim(),
        isDeleted: false,
      },
    });

    if (existing) {
      throw new AppError(`Lead with mobile ${data.mobile} already exists (${existing.leadCode})`, 409, 'DUPLICATE_LEAD');
    }

    // Generate unique Lead Code
    const count = await prisma.lead.count();
    const leadCode = `CRM-${String(count + 1).padStart(6, '0')}`;

    const newLead = await prisma.lead.create({
      data: {
        leadCode,
        customerName: data.customerName.trim(),
        mobile: data.mobile.trim(),
        alternateMobile: data.alternateMobile?.trim() || null,
        email: data.email?.trim() || null,
        companyName: data.companyName?.trim() || null,
        city: data.city?.trim() || null,
        state: data.state?.trim() || null,
        requirement: data.requirement.trim(),
        productService: data.productService?.trim() || null,
        budget: data.budget ? Number(data.budget) : null,
        leadSource: data.leadSource || 'Direct',
        priority: data.priority || 'MEDIUM',
        status: 'NEW',
        assignedByUserId: createdByUserId,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    await prisma.leadActivity.create({
      data: {
        leadId: newLead.id,
        actorUserId: createdByUserId,
        actionType: 'LEAD_CREATED',
        description: `Lead manually registered (${newLead.leadCode})`,
        metadata: { leadCode: newLead.leadCode },
      },
    });

    return newLead;
  }

  /**
   * Updates lead status with lifecycle rules, status history, and activity logging.
   */
  static async updateLeadStatus(id: string, newStatus: string, note: string | undefined, userId: string, userRole: string) {
    const TERMINAL_SET = new Set(['WON_SOLD', 'LOST', 'NOT_INTERESTED', 'INVALID', 'DUPLICATE']);

    return prisma.$transaction(async (tx) => {
      const lead = await tx.lead.findUnique({
        where: { id },
      });

      if (!lead) {
        throw new AppError('Lead not found', 404, 'LEAD_NOT_FOUND');
      }

      if (userRole === UserRole.SALES_EXECUTIVE && lead.assignedToUserId !== userId) {
        throw new AppError('You do not have permission to update this lead', 403, 'FORBIDDEN');
      }

      // Protected deals check
      const isClosed = lead.status === 'WON_SOLD' || lead.status === 'LOST';
      if (isClosed && userRole !== UserRole.TEAM_LEADER) {
        throw new AppError('Cannot modify protected deal without Team Leader authorization', 403, 'PROTECTED_DEAL');
      }

      const updated = await tx.lead.update({
        where: { id },
        data: { status: newStatus as any },
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
        },
      });

      // Auto-cancel active pending follow-ups if transitioning to a terminal/closed status
      if (TERMINAL_SET.has(newStatus)) {
        await tx.leadFollowUp.updateMany({
          where: { leadId: id, status: 'PENDING', isDeleted: false },
          data: { isDeleted: true, deletedAt: new Date() },
        });
      }

      await tx.leadStatusHistory.create({
        data: {
          leadId: id,
          oldStatus: lead.status,
          newStatus: newStatus as any,
          changedByUserId: userId,
          notes: note || null,
        },
      });

      await tx.leadActivity.create({
        data: {
          leadId: id,
          actorUserId: userId,
          actionType: 'STATUS_CHANGE',
          description: `Status changed from ${lead.status} to ${newStatus}`,
          metadata: { oldStatus: lead.status, newStatus, note },
        },
      });

      return updated;
    });
  }

  /**
   * Reusable helper to aggregate lead count per previous assignee.
   */
  static buildAssigneeCountMap(
    leads: Array<{ assignedToUserId: string | null }>,
    excludeAssigneeId?: string
  ): Record<string, number> {
    const map: Record<string, number> = {};
    for (const lead of leads) {
      if (lead.assignedToUserId && (!excludeAssigneeId || lead.assignedToUserId !== excludeAssigneeId)) {
        map[lead.assignedToUserId] = (map[lead.assignedToUserId] || 0) + 1;
      }
    }
    return map;
  }

  /**
   * Recalls assigned leads back to the unassigned pool.
   * Completely batched to eliminate N+1 database roundtrips.
   */
  static async recallLeads(leadIds: string[], userId: string, reason?: string) {
    if (!leadIds || leadIds.length === 0) {
      throw new AppError('No lead IDs provided for recall', 400, 'NO_LEADS_PROVIDED');
    }

    return prisma.$transaction(async (tx) => {
      // Single batch fetch for all target leads
      const leads = await tx.lead.findMany({
        where: { id: { in: leadIds }, isDeleted: false },
        select: { id: true, assignedToUserId: true },
      });

      if (leads.length === 0) {
        return { recalledCount: 0, previousAssigneeMap: {} };
      }

      const validLeadIds = leads.map((l: any) => l.id);
      const previousAssigneeMap = this.buildAssigneeCountMap(leads);
      const now = new Date();

      // 1. Single batch update for all recalled leads
      await tx.lead.updateMany({
        where: { id: { in: validLeadIds } },
        data: {
          assignedToUserId: null,
          assignedAt: null,
          status: 'NEW',
        },
      });

      // 2. Single batch update to soft-delete pending follow-ups
      await tx.leadFollowUp.updateMany({
        where: { leadId: { in: validLeadIds }, status: 'PENDING', isDeleted: false },
        data: { isDeleted: true, deletedAt: now },
      });

      // 3. Single batch insert for LeadAssignment records for leads that had assignees
      const unassignmentRecords = leads
        .filter((l: any) => l.assignedToUserId)
        .map((l: any) => ({
          leadId: l.id,
          assignedToUserId: l.assignedToUserId!,
          assignedByUserId: userId,
          unassignedAt: now,
          reason: reason || 'Recalled to unassigned pool',
        }));

      if (unassignmentRecords.length > 0) {
        await tx.leadAssignment.createMany({
          data: unassignmentRecords,
        });
      }

      // 4. Single batch insert for LeadActivity records
      await tx.leadActivity.createMany({
        data: leads.map((lead: any) => ({
          leadId: lead.id,
          actorUserId: userId,
          actionType: 'LEAD_RECALLED',
          description: 'Lead recalled to unassigned pool',
          metadata: { previousAssignee: lead.assignedToUserId, reason },
          createdAt: now,
        })),
      });

      return { recalledCount: leads.length, previousAssigneeMap };
    });
  }

  /**
   * Reassigns leads from one executive to another.
   * Completely batched to eliminate N+1 database roundtrips.
   */
  static async reassignLeads(leadIds: string[], targetExecutiveId: string, userId: string, reason?: string) {
    if (!leadIds || leadIds.length === 0) {
      throw new AppError('No lead IDs provided for reassignment', 400, 'NO_LEADS_PROVIDED');
    }

    const executive = await prisma.user.findFirst({
      where: { id: targetExecutiveId, role: UserRole.SALES_EXECUTIVE, isActive: true },
    });
    if (!executive) {
      throw new AppError('Target sales executive is invalid or inactive', 400, 'INVALID_EXECUTIVE');
    }

    return prisma.$transaction(async (tx) => {
      const leads = await tx.lead.findMany({
        where: { id: { in: leadIds }, isDeleted: false },
        select: { id: true, assignedToUserId: true },
      });

      if (leads.length === 0) {
        return {
          reassignedCount: 0,
          targetExecutive: executive.name,
          targetExecutiveId,
          previousAssigneeMap: {},
        };
      }

      const validLeadIds = leads.map((l: any) => l.id);
      const previousAssigneeMap = this.buildAssigneeCountMap(leads, targetExecutiveId);
      const now = new Date();

      // 1. Single batch update for all reassigned leads
      await tx.lead.updateMany({
        where: { id: { in: validLeadIds } },
        data: {
          assignedToUserId: targetExecutiveId,
          assignedByUserId: userId,
          assignedAt: now,
          status: 'ASSIGNED',
        },
      });

      // 2. Single batch update for pending follow-ups transfer
      await tx.leadFollowUp.updateMany({
        where: { leadId: { in: validLeadIds }, status: 'PENDING', isDeleted: false },
        data: { assignedToUserId: targetExecutiveId },
      });

      // 3. Single batch insert for LeadAssignment records
      await tx.leadAssignment.createMany({
        data: leads.map((lead: any) => ({
          leadId: lead.id,
          assignedToUserId: targetExecutiveId,
          assignedByUserId: userId,
          assignedAt: now,
          reason: reason || 'Reassigned to executive',
        })),
      });

      // 4. Single batch insert for LeadActivity records
      await tx.leadActivity.createMany({
        data: leads.map((lead: any) => ({
          leadId: lead.id,
          actorUserId: userId,
          actionType: 'LEAD_REASSIGNED',
          description: `Lead reassigned to ${executive.name}`,
          metadata: { previousAssignee: lead.assignedToUserId, newAssignee: targetExecutiveId, reason },
          createdAt: now,
        })),
      });

      return {
        reassignedCount: leads.length,
        targetExecutive: executive.name,
        targetExecutiveId,
        previousAssigneeMap,
      };
    });
  }
}