import { Router, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { AuthRequest } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';

const notificationRouter = Router();

notificationRouter.use(authenticateUser);

notificationRouter.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const notifications = await prisma.notification.findMany({
      where: { recipientUserId: userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
});

notificationRouter.patch('/:id/read', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: { id, recipientUserId: userId },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404, 'NOT_FOUND');
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});

notificationRouter.patch('/read-all', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    await prisma.notification.updateMany({
      where: { recipientUserId: userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: { success: true },
    });
  } catch (error) {
    next(error);
  }
});

export default notificationRouter;
