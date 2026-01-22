import { Router } from 'express';
import { authRequired } from '../../middleware/authRequired';
import { acceptTerms, me, telegramAuth } from './auth.controller';

export const authRouter = Router();

authRouter.post('/telegram', telegramAuth);
authRouter.get('/me', authRequired, me);
authRouter.post('/accept-terms', authRequired, acceptTerms);
