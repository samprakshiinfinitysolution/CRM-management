import { Router } from 'express';
import {
  getLeadsWithFilter,
  assignLeads,
  getLeadById,
  createLead,
  updateLeadStatus,
  updateBulkLeadStatus,
  recallLeads,
  addLeadNote,
  reassignLeads,
} from '../controllers/leads.controller.js';
import { getFollowUpsForLead } from '../controllers/followUp.controller.js';
import { authenticateUser, requireRole } from '../middleware/auth.middleware.js';
import { distributionLimiter } from '../middleware/rateLimiter.middleware.js';
import { UserRole } from '../types/index.js';

const leadRouter = Router();

// All lead endpoints require authentication
leadRouter.use(authenticateUser);

leadRouter.get(
  '/',
  requireRole(UserRole.TEAM_LEADER, UserRole.SALES_EXECUTIVE),
  getLeadsWithFilter
);
leadRouter.post('/', requireRole(UserRole.TEAM_LEADER), createLead);
leadRouter.post('/assign', requireRole(UserRole.TEAM_LEADER), distributionLimiter, assignLeads);
leadRouter.post('/distribute', requireRole(UserRole.TEAM_LEADER), distributionLimiter, assignLeads);
leadRouter.post('/recall', requireRole(UserRole.TEAM_LEADER), distributionLimiter, recallLeads);
leadRouter.post('/reassign', requireRole(UserRole.TEAM_LEADER), distributionLimiter, reassignLeads);

// GET /api/leads/:leadId/followups — Timeline of follow-ups for a specific lead (role-scoped)
leadRouter.get('/:leadId/followups', getFollowUpsForLead);

// Bulk status update must come before /:id routes
leadRouter.patch('/bulk/status', updateBulkLeadStatus);
leadRouter.patch('/status', updateBulkLeadStatus);

// Lead detail and status update
leadRouter.get('/:id', getLeadById);
leadRouter.post('/:id/notes', addLeadNote);
leadRouter.patch('/:id/status', updateLeadStatus);

export default leadRouter;