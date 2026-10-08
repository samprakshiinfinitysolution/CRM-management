import { Router } from 'express';
import { exportLeads, exportReports } from '../controllers/export.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { exportLimiter } from '../middleware/rateLimiter.middleware.js';

const exportRouter = Router();

// Protect all export routes with JWT authentication and export rate limiter
exportRouter.use(authenticateUser);
exportRouter.use(exportLimiter);

/**
 * @route   POST /api/exports/leads
 * @desc    Export leads to Excel (.xlsx) based on filter/selection payload
 * @access  Private (Authenticated users; Sales Executives isolated to assigned leads)
 */
exportRouter.post('/leads', exportLeads);

/**
 * @route   GET /api/exports/leads
 * @desc    Alternative GET endpoint mapping query params to export filter
 * @access  Private
 */
exportRouter.get('/leads', (req, res, next) => {
  // Map query parameters into body for unified export processing
  req.body = {
    ...req.body,
    ...req.query,
    leadIds: req.query.leadIds
      ? (Array.isArray(req.query.leadIds)
          ? req.query.leadIds
          : (req.query.leadIds as string).split(',').map((id) => id.trim()))
      : undefined,
  };
  return exportLeads(req, res, next);
});

exportRouter.get("/reports", exportReports);
exportRouter.post("/reports", exportReports);

export default exportRouter;
