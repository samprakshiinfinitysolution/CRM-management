import { Router } from 'express';
import { exportLeads } from '../controllers/export.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const exportRouter = Router();

// Protect all export routes with JWT authentication
exportRouter.use(authenticateUser);

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

export default exportRouter;
