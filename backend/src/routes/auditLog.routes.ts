import { Router, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { authenticateUser, requireRole } from '../middleware/auth.middleware.js';
import { AuthRequest, UserRole } from '../types/index.js';
import type { Prisma } from '@prisma/client';

const auditLogRouter = Router();

auditLogRouter.use(authenticateUser);
auditLogRouter.use(requireRole(UserRole.TEAM_LEADER, UserRole.ADMIN));

auditLogRouter.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 25));
    const skip = (page - 1) * limit;

    const { action, entityType, search, startDate, endDate } = req.query;
    const userRole = req.user?.role;

    const where: Prisma.AuditLogWhereInput = {};

    // Exclude LOGIN and LOGOUT for non-admin users (e.g. TEAM_LEADER), include for ADMIN
    if (userRole !== UserRole.ADMIN) {
      where.action = {
        notIn: ['LOGIN', 'LOGOUT'],
      };
    }

    if (typeof action === 'string' && action.trim() && action !== 'ALL') {
      where.action = action.trim();
    }

    if (typeof entityType === 'string' && entityType.trim() && entityType !== 'ALL') {
      where.entityType = entityType.trim();
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate && typeof startDate === 'string') {
        const start = new Date(startDate);
        if (!isNaN(start.getTime())) {
          where.createdAt.gte = start;
        }
      }
      if (endDate && typeof endDate === 'string') {
        const end = new Date(endDate);
        if (!isNaN(end.getTime())) {
          where.createdAt.lte = end;
        }
      }
    }

    if (typeof search === 'string' && search.trim()) {
      const term = search.trim();
      where.OR = [
        { entityId: { contains: term, mode: 'insensitive' } },
        { actor: { name: { contains: term, mode: 'insensitive' } } },
        { actor: { email: { contains: term, mode: 'insensitive' } } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Audit logs retrieved successfully',
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

export default auditLogRouter;
