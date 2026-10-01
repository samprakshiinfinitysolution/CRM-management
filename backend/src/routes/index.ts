import { Router, Request, Response } from 'express';
import healthRouter from './health.routes.js';
import authRouter from './auth.routes.js';
import userRouter from './user.routes.js';
import importRouter from './import.routes.js';
import leadRouter from './leads.routes.js';
import followUpRouter from './followUp.routes.js';
import reportRouter from './report.routes.js';
import notificationRouter from './notification.routes.js';
import auditLogRouter from './auditLog.routes.js';

const apiRouter = Router();

// Health Check
apiRouter.use('/health', healthRouter);

// Root API Welcome / Status
apiRouter.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Welcome to CRM Lead Management & Sales Distribution REST API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      leads: '/api/leads',
      distribution: '/api/leads/distribute',
      followups: '/api/followups',
      imports: '/api/imports',
      reports: '/api/reports',
      exports: '/api/exports',
      notifications: '/api/notifications',
      audit: '/api/audit-logs',
    },
  });
});

// Auth & User routes
apiRouter.use('/auth', authRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/leads', leadRouter);
apiRouter.use('/followups', followUpRouter);
apiRouter.use('/imports', importRouter);
apiRouter.use('/notifications', notificationRouter);
apiRouter.use('/reports', reportRouter);
apiRouter.use('/audit-logs', auditLogRouter);

export default apiRouter;
