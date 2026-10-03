import { Router } from 'express';
import { register, login, refresh_token, logout, changePassword } from '../controllers/auth.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimiter.middleware.js';

const apiRouter = Router();

apiRouter.post('/register', authLimiter, register);
apiRouter.post('/login', authLimiter, login);
apiRouter.post('/refresh-token', authenticateUser, refresh_token);
apiRouter.post('/logout', logout);
apiRouter.post('/change-password', authenticateUser, authLimiter, changePassword);

export default apiRouter;