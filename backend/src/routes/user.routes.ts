import { Router } from 'express';
import {
  getSalesExecutives,
  getSalesExecutiveById,
  toggleExecutiveStatus,
  createUser,
} from '../controllers/user.controller.js';
import { authenticateUser, requireRole } from '../middleware/auth.middleware.js';
import { UserRole } from '../types/index.js';

const userRouter = Router();

// Require authenticated user and Team Leader authority for all user management queries
userRouter.use(authenticateUser);
userRouter.use(requireRole(UserRole.TEAM_LEADER));

userRouter.get('/', getSalesExecutives);
userRouter.post('/', createUser);
userRouter.get('/sales-executives', getSalesExecutives);
userRouter.get('/sales-executives/:id', getSalesExecutiveById);
userRouter.patch('/sales-executives/:id/status', toggleExecutiveStatus);
userRouter.get('/:id', getSalesExecutiveById);

export default userRouter;

