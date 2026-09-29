import prisma from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { UserRole } from '../types/index.js';

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

  async assignLeadToUser(leadId: string) {
    // Placeholder for Phase 3 manual assignment
  }
}