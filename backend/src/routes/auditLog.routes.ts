import { Router, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { authenticateUser, requireRole } from '../middleware/auth.middleware.js';
import { AuthRequest, UserRole } from '../types/index.js';

const auditLogRouter = Router();

auditLogRouter.use(authenticateUser);
auditLogRouter.use(requireRole(UserRole.TEAM_LEADER));

auditLogRouter.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 25));
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      }),
      prisma.auditLog.count(),
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
