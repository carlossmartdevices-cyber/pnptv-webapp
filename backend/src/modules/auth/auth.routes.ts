import { Router } from 'express';
import { authMe, acceptTerms, logout, telegramLogin } from './auth.controller';
import { authRequired } from '../../middleware/authRequired';

const router = Router();

router.post('/telegram', telegramLogin);
router.get('/me', authRequired, authMe);
router.post('/accept-terms', authRequired, acceptTerms);
router.post('/logout', authRequired, logout);

export default router;
