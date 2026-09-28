import { Router } from 'express';
import { register, login, refresh_token, logout } from '@controllers/auth.controller.js';

const apiRouter = Router();

apiRouter.post('/register', register);
apiRouter.post('/login', login);
apiRouter.post('/refresh-token', refresh_token);
apiRouter.post('/logout', logout);

//apiRouter.post('/forgot-password',(req:Request,res:Response) => {
    
//});

//apiRouter.post('/reset-password',(req:Request,res:Response) => {
    
//});

//apiRouter.post('/change-password',(req:Request,res:Response) => {
    
//});

export default apiRouter;