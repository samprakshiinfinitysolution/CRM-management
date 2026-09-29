import { Router } from 'express';
import { getLeadsWithFilter, assignLeads } from '../controllers/leads.controller.js';
import { authenticateUser, requireRole } from '../middleware/auth.middleware.js';
import { UserRole } from '../types/index.js';

const leadRouter = Router();

// All lead endpoints require authentication
leadRouter.use(authenticateUser);

leadRouter.get('/', requireRole(UserRole.TEAM_LEADER), getLeadsWithFilter);
leadRouter.post('/assign', requireRole(UserRole.TEAM_LEADER), assignLeads);
leadRouter.post('/distribute', requireRole(UserRole.TEAM_LEADER), assignLeads);

export default leadRouter;