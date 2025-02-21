import express from 'express';
import {getMe, login} from '../controllers/auth-controller.js';
import {authenticateToken} from '../middlewares/authentication.js';

const authRouter = express.Router();

authRouter.post('/login', login);
authRouter.get('/me', authenticateToken, getMe);

export default authRouter;
