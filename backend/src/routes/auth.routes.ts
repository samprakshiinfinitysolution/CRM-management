import { Router } from 'express';
import { register, login, refresh_token, logout, changePassword } from '../controllers/auth.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const apiRouter = Router();

apiRouter.post('/register', register);
apiRouter.post('/login', login);
apiRouter.post('/refresh-token', refresh_token);
apiRouter.post('/logout', logout);
apiRouter.post('/change-password', authenticateUser, changePassword);

export default apiRouter;