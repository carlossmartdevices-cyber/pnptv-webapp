import { Router } from 'express';
import { authRequired } from '../../middleware/authRequired.js';
import { requireTerms } from '../../middleware/requireTerms.js';
import {
  deleteCollectionById,
  getCollectionById,
  getCollections,
  postCollection,
  putCollection,
} from './videorama.controller.js';

export const videoramaRouter = Router();

videoramaRouter.get('/collections', authRequired, requireTerms, getCollections);
videoramaRouter.get('/collections/:id', authRequired, requireTerms, getCollectionById);
videoramaRouter.post('/collections', authRequired, requireTerms, postCollection);
videoramaRouter.put('/collections/:id', authRequired, requireTerms, putCollection);
videoramaRouter.delete('/collections/:id', authRequired, requireTerms, deleteCollectionById);
