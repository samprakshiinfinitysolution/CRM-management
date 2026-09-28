import { Router, Request, Response } from 'express';
import healthRouter from './health.routes.js';

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

export default apiRouter;
