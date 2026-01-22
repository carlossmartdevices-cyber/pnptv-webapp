import type { Request, Response } from 'express';
import { z } from 'zod';
import { can } from '@shared/rbac';
import { prisma } from '../../db/client';
import { createCollection, deleteCollection, listCollections, updateCollection } from './videorama.service';

const createSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(1),
  type: z.enum(['PLAYLIST', 'PODCAST']),
  visibility: z.enum(['PUBLIC', 'PRIME']),
  items: z.array(
    z.object({
      title: z.string(),
      url: z.string().url(),
      duration: z.number().optional(),
      meta: z.record(z.any()).optional()
    })
  )
});

export const getCollections = async (req: Request, res: Response) => {
  if (!req.auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const visibility = req.auth.role === 'FREE' ? ['PUBLIC'] : ['PUBLIC', 'PRIME'];
  const collections = await listCollections(visibility);
  return res.json({ collections });
};

export const createCollectionHandler = async (req: Request, res: Response) => {
  if (!req.auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!can(req.auth.role, 'videorama.create')) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const body = createSchema.safeParse(req.body);
  if (!body.success) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const collection = await createCollection({
    title: body.data.title,
    description: body.data.description,
    type: body.data.type,
    visibility: body.data.visibility,
    ownerId: req.auth.id
  });

  return res.status(201).json({ collection });
};

export const updateCollectionHandler = async (req: Request, res: Response) => {
  if (!req.auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const collection = await prisma.collection.findUnique({ where: { id: req.params.id } });
  if (!collection) {
    return res.status(404).json({ error: 'Not found' });
  }

  const isOwner = collection.ownerId === req.auth.id;
  if (can(req.auth.role, 'videorama.editAny') || (isOwner && can(req.auth.role, 'videorama.editOwn', { ownerId: collection.ownerId, actorId: req.auth.id }))) {
    const updated = await updateCollection({
      id: collection.id,
      data: {
        title: req.body.title,
        description: req.body.description
      }
    });
    return res.json({ collection: updated });
  }

  return res.status(403).json({ error: 'Forbidden' });
};

export const deleteCollectionHandler = async (req: Request, res: Response) => {
  if (!req.auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const collection = await prisma.collection.findUnique({ where: { id: req.params.id } });
  if (!collection) {
    return res.status(404).json({ error: 'Not found' });
  }

  const isOwner = collection.ownerId === req.auth.id;
  if (can(req.auth.role, 'videorama.deleteAny') || (isOwner && can(req.auth.role, 'videorama.deleteOwn', { ownerId: collection.ownerId, actorId: req.auth.id }))) {
    await deleteCollection(collection.id);
    return res.json({ deleted: true });
  }

  return res.status(403).json({ error: 'Forbidden' });
};
