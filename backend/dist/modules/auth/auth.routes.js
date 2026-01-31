import { Router } from 'express';
import { authRequired } from '../../middleware/authRequired.js';
import { acceptTerms, me, telegramAuth } from './auth.controller.js';
export const authRouter = Router();
authRouter.post('/telegram', telegramAuth);
authRouter.get('/me', authRequired, me);
authRouter.post('/accept-terms', authRequired, acceptTerms);
