import { Router } from 'express';
import { authRequired } from '../../middleware/authRequired.js';
import { requireRole } from '../../middleware/requireRole.js';
import { requireTerms } from '../../middleware/requireTerms.js';
import { getPublicRooms, postJoin, postRoom } from './hangouts.controller.js';
export const hangoutsRouter = Router();
hangoutsRouter.get('/public', authRequired, requireTerms, getPublicRooms);
hangoutsRouter.post('/', authRequired, requireTerms, requireRole(['PRIME', 'ADMIN']), postRoom);
hangoutsRouter.post('/:roomId/join', authRequired, requireTerms, postJoin);
