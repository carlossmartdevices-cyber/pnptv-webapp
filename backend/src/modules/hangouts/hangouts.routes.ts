import { Router } from 'express';
import { authRequired } from '../../middleware/authRequired';
import { requireTerms } from '../../middleware/requireTerms';
import { createHangout, getPublicRooms, joinHangout } from './hangouts.controller';

const router = Router();

router.get('/public', authRequired, requireTerms, getPublicRooms);
router.post('/', authRequired, requireTerms, createHangout);
router.post('/:roomId/join', authRequired, requireTerms, joinHangout);

export default router;
