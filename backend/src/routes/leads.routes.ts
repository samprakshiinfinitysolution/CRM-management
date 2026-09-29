import { Router } from 'express';
import { getLeadsWithFilter } from '../controllers/leads.controller.js';
import { authenticateUser, requireRole } from '../middleware/auth.middleware.js';
import { UserRole } from '../types/index.js';

const leadRouter = Router();

// All lead endpoints require authentication
leadRouter.use(authenticateUser);

leadRouter.get('/', requireRole(UserRole.TEAM_LEADER), getLeadsWithFilter);

export default leadRouter;