import bcrypt from 'bcryptjs';
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
  page?: number;
  limit?: number;
}

export interface GetExecutivesResult {
  executives: SalesExecutiveSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class UserService {
  static calculateMetrics = calculateExecutiveMetrics;

  /**
   * Retrieves summary list of all Sales Executives with aggregated performance and workload KPIs.
   */
  static async getSalesExecutives(
    filter?: GetExecutivesFilter
  ): Promise<GetExecutivesResult> {
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

    const total = await prisma.user.count({ where: whereClause });
    const isPaginated = Boolean(filter?.page || filter?.limit);
    const safePage = Math.max(1, filter?.page || 1);
    const safeLimit = filter?.limit
      ? Math.max(1, Math.min(100, filter.limit))
      : isPaginated
      ? 25
      : undefined;
    const skip = safeLimit ? (safePage - 1) * safeLimit : undefined;

    const executives = await prisma.user.findMany({
      where: whereClause,
      skip,
      take: safeLimit,
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
          where: { isDeleted: false },
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

    const formatted = executives.map((exec) => {
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

    const effectiveLimit = safeLimit || total || 1;
    return {
      executives: formatted,
      pagination: {
        page: safePage,
        limit: effectiveLimit,
        total,
        totalPages: Math.max(1, Math.ceil(total / effectiveLimit)),
      },
    };
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

  /**
   * Creates a new user (Sales Executive or Team Leader).
   */
  static async createUser(
    data: { name: string; email: string; password?: string; role?: UserRole },
    actorId?: string
  ) {
    if (!data.name || !data.email) {
      throw new AppError('Name and email are required', 400, 'VALIDATION_ERROR');
    }

    const normalizedEmail = data.email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      throw new AppError('A user with this email already exists', 409, 'DUPLICATE_USER');
    }

    const passwordToHash = data.password || 'LeadFlow#2026';
    const passwordHash = await bcrypt.hash(passwordToHash, 10);

    const newUser = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: data.role || UserRole.SALES_EXECUTIVE,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (actorId) {
      await prisma.auditLog.create({
        data: {
          actorUserId: actorId,
          action: 'CREATE',
          entityType: 'User',
          entityId: newUser.id,
          newValue: { name: newUser.name, email: newUser.email, role: newUser.role },
        },
      }).catch(() => {});
    }

    return newUser;
  }
}

