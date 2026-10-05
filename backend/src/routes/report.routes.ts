import { Router } from 'express';
import { authenticateUser, requireRole } from '../middleware/auth.middleware.js';
import { UserRole } from '../types/index.js';
import {
  getSEDashboardMetrics,
  getTLDashboardMetrics,
  getLeadsReport,
  getPerformanceReport,
} from "../controllers/report.controller.js";

const reportRouter = Router();

// Middleware for all reports routes
reportRouter.use(authenticateUser);

// Team Leader Dashboard Metrics
reportRouter.get(
  '/dashboard-metrics/team-lead',
  requireRole(UserRole.TEAM_LEADER),
  getTLDashboardMetrics
);

// Alias endpoint matching REST standard
reportRouter.get(
  '/dashboard-metrics',
  requireRole(UserRole.TEAM_LEADER),
  getTLDashboardMetrics
);

// Sales Executive Dashboard Metrics
reportRouter.get(
  '/dashboard-metrics/sales-executive',
  requireRole(UserRole.SALES_EXECUTIVE),
  getSEDashboardMetrics
);

reportRouter.get("/performance", requireRole(UserRole.TEAM_LEADER), getPerformanceReport);

reportRouter.get("/leads", requireRole(UserRole.TEAM_LEADER), getLeadsReport);

export default reportRouter;