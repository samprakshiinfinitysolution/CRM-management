import { prisma } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import {
  UserRole,
  SalesExecutiveSummary,
  SalesExecutiveDetail,
  LeadStatus,
  FollowUpStatus,
  ExecutiveMetrics,
} from '../types/index.js';
import { calculateExecutiveMetrics } from '../utils/executiveMetrics.js';

export interface GetExecutivesFilter {
  search?: string;
  status?: 'all' | 'active' | 'inactive';
}

export class UserService {
  static calculateMetrics = calculateExecutiveMetrics;

  /**
   * Retrieves summary list of all Sales Executives with aggregated performance and workload KPIs.
   */
  static async getSalesExecutives(
    filter?: GetExecutivesFilter
  ): Promise<SalesExecutiveSummary[]> {
    const whereClause: any = {
      role: UserRole.SALES_EXECUTIVE,
      isDeleted: false,
    };

    if (filter?.status === 'active') {
      whereClause.isActive = true;
    } else if (filter?.status === 'inactive') {
      whereClause.isActive = false;
    }

    if (filter?.search?.trim()) {
      const search = filter.search.trim();
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const executives = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        assignedLeads: {
          where: { isDeleted: false },
          select: {
            id: true,
            status: true,
            budget: true,
          },
        },
        followUps: {
          select: {
            id: true,
            status: true,
            scheduledAt: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const now = new Date();

    return executives.map((exec) => {
      const { statusBreakdown: _, ...metrics } = calculateExecutiveMetrics(
        exec.assignedLeads,
        exec.followUps,
        now
      );

      return {
        id: exec.id,
        name: exec.name,
        email: exec.email,
        role: exec.role as UserRole,
        isActive: exec.isActive,
        createdAt: exec.createdAt,
        ...metrics,
      };
    });
  }

  /**
   * Retrieves comprehensive details, pipeline breakdown, leads list, and follow-ups for a single Sales Executive.
   */
  static async getSalesExecutiveById(id: string): Promise<SalesExecutiveDetail> {
    const executive = await prisma.user.findFirst({
      where: {
        id,
        role: UserRole.SALES_EXECUTIVE,
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        assignedLeads: {
          where: { isDeleted: false },
          select: {
            id: true,
            leadCode: true,
            customerName: true,
            mobile: true,
            alternateMobile: true,
            email: true,
            companyName: true,
            city: true,
            state: true,
            requirement: true,
            productService: true,
            budget: true,
            leadSource: true,
            priority: true,
            status: true,
            assignedAt: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { updatedAt: 'desc' },
        },
        followUps: {
          select: {
            id: true,
            leadId: true,
            scheduledAt: true,
            type: true,
            status: true,
            notes: true,
            lead: {
              select: {
                id: true,
                leadCode: true,
                customerName: true,
                mobile: true,
                status: true,
              },
            },
          },
          orderBy: { scheduledAt: 'asc' },
        },
        activities: {
          select: {
            id: true,
            actionType: true,
            description: true,
            createdAt: true,
            lead: {
              select: {
                id: true,
                leadCode: true,
                customerName: true,
              },
            },
          },
          take: 15,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!executive) {
      throw new AppError('Sales Executive not found', 404, 'EXECUTIVE_NOT_FOUND');
    }

    const metrics = calculateExecutiveMetrics(
      executive.assignedLeads,
      executive.followUps
    );

    return {
      id: executive.id,
      name: executive.name,
      email: executive.email,
      role: executive.role as UserRole,
      isActive: executive.isActive,
      createdAt: executive.createdAt,
      ...metrics,
      leads: (executive.assignedLeads || []).map((l) => ({
        ...l,
        budget: l.budget ? Number(l.budget) : null,
      })),
      upcomingFollowUps: executive.followUps || [],
      recentActivities: executive.activities || [],
    };
  }

  /**
   * Toggles active / inactive operational status of a Sales Executive.
   */
  static async toggleExecutiveStatus(
    id: string,
    isActive: boolean,
    actorId?: string
  ): Promise<{ id: string; isActive: boolean }> {
    const executive = await prisma.user.findFirst({
      where: { id, role: UserRole.SALES_EXECUTIVE, isDeleted: false },
    });

    if (!executive) {
      throw new AppError('Sales Executive not found', 404, 'EXECUTIVE_NOT_FOUND');
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, isActive: true },
    });

    if (actorId) {
      await prisma.auditLog.create({
        data: {
          actorUserId: actorId,
          action: 'STATUS_UPDATE',
          entityType: 'User',
          entityId: id,
          oldValue: { isActive: executive.isActive },
          newValue: { isActive },
        },
      }).catch(() => {
        // Non-blocking audit log failover
      });
    }

    return updated;
  }
}
