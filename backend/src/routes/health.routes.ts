import { Router, Request, Response } from 'express';
import { ApiResponse } from '../types/index.js';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    message: 'CRM API Server is healthy and running',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'crm-backend',
      version: '1.0.0',
    },
  };
  res.status(200).json(response);
});

export default router;
