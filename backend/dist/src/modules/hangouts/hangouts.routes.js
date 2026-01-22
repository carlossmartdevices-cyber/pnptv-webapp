import { Router } from 'express';
import { authRequired } from '../../middleware/authRequired';
import { requireRole } from '../../middleware/requireRole';
import { requireTerms } from '../../middleware/requireTerms';
import { getPublicRooms, postJoin, postRoom } from './hangouts.controller';
export const hangoutsRouter = Router();
hangoutsRouter.get('/public', authRequired, requireTerms, getPublicRooms);
hangoutsRouter.post('/', authRequired, requireTerms, requireRole(['PRIME', 'ADMIN']), postRoom);
hangoutsRouter.post('/:roomId/join', authRequired, requireTerms, postJoin);
