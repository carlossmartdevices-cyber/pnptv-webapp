import { Router } from 'express';
import { authRequired } from '../../middleware/authRequired';
import { requireTerms } from '../../middleware/requireTerms';
import {
  createCollectionHandler,
  deleteCollectionHandler,
  getCollections,
  updateCollectionHandler
} from './videorama.controller';

const router = Router();

router.get('/collections', authRequired, requireTerms, getCollections);
router.post('/collections', authRequired, requireTerms, createCollectionHandler);
router.put('/collections/:id', authRequired, requireTerms, updateCollectionHandler);
router.delete('/collections/:id', authRequired, requireTerms, deleteCollectionHandler);

export default router;
