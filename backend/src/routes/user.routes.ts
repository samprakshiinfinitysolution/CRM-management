import { Router } from 'express';
import {
  getSalesExecutives,
  getSalesExecutiveById,
  toggleExecutiveStatus,
} from '../controllers/user.controller.js';
import { authenticateUser, requireRole } from '../middleware/auth.middleware.js';
import { UserRole } from '../types/index.js';

const userRouter = Router();

// Require authenticated user and Team Leader authority for all executive queries
userRouter.use(authenticateUser);
userRouter.use(requireRole(UserRole.TEAM_LEADER));

userRouter.get('/sales-executives', getSalesExecutives);
userRouter.get('/sales-executives/:id', getSalesExecutiveById);
userRouter.patch('/sales-executives/:id/status', toggleExecutiveStatus);

userRouter.use(requireRole(UserRole.TEAM_LEADER));
userRouter.get("/users", getSalesExecutives);

export default userRouter;
