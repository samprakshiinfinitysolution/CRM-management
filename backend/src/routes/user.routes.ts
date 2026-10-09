import { Router } from 'express';
import {
  getUsers,
  getUserById,
  getSalesExecutives,
  getSalesExecutiveById,
  toggleExecutiveStatus,
  toggleUserStatus,
  createUser,
} from '../controllers/user.controller.js';
import { authenticateUser, requireRole } from '../middleware/auth.middleware.js';
import { UserRole } from '../types/index.js';

const userRouter = Router();

// Require authenticated user and Team Leader authority for all user management queries
userRouter.use(authenticateUser);
userRouter.use(requireRole(UserRole.TEAM_LEADER, UserRole.ADMIN));

userRouter.post('/', createUser);
userRouter.get('/', getUsers);
userRouter.get('/sales-executives', getSalesExecutives);
userRouter.get('/sales-executives/:id', getSalesExecutiveById);
userRouter.patch('/sales-executives/:id/status', toggleExecutiveStatus);
userRouter.patch('/:id/status', toggleUserStatus);
userRouter.get('/:id', getUserById);

export default userRouter;

