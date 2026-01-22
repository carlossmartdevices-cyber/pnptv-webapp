import { z } from 'zod';
import { can } from '../shared/rbac';
import { createCollection, deleteCollection, getCollection, listCollections, updateCollection } from './videorama.service';
const createSchema = z.object({
    type: z.enum(['PLAYLIST', 'PODCAST']),
    title: z.string().min(2),
    description: z.string().min(1),
    visibility: z.enum(['PUBLIC', 'PRIME']),
    items: z.array(z.object({
        title: z.string(),
        url: z.string().url(),
        duration: z.number().optional(),
    })),
});
const updateSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    visibility: z.enum(['PUBLIC', 'PRIME']).optional(),
});
export const getCollections = async (req, res) => {
    const role = req.user?.role ?? 'FREE';
    const collections = await listCollections(role);
    res.json({ collections });
};
export const getCollectionById = async (req, res) => {
    const collection = await getCollection(req.params.id);
    if (!collection)
        return res.status(404).json({ error: 'not found' });
    res.json({ collection });
};
export const postCollection = async (req, res) => {
    const role = req.user?.role ?? 'FREE';
    if (!can(role, 'videorama.create')) {
        return res.status(403).json({ error: 'forbidden' });
    }
    const data = createSchema.parse(req.body);
    const ownerId = req.user?.sub;
    if (!ownerId)
        return res.status(401).json({ error: 'unauthorized' });
    const collection = await createCollection(ownerId, data);
    res.status(201).json({ collection });
};
export const putCollection = async (req, res) => {
    const role = req.user?.role ?? 'FREE';
    const collection = await getCollection(req.params.id);
    if (!collection)
        return res.status(404).json({ error: 'not found' });
    const canEditAny = can(role, 'videorama.editAny');
    const canEditOwn = can(role, 'videorama.editOwn', {
        ownerId: collection.ownerId,
        requesterId: req.user?.sub,
    });
    if (!canEditAny && !canEditOwn) {
        return res.status(403).json({ error: 'forbidden' });
    }
    const data = updateSchema.parse(req.body);
    const updated = await updateCollection(req.params.id, data);
    res.json({ collection: updated });
};
export const deleteCollectionById = async (req, res) => {
    const role = req.user?.role ?? 'FREE';
    const collection = await getCollection(req.params.id);
    if (!collection)
        return res.status(404).json({ error: 'not found' });
    const canDeleteAny = can(role, 'videorama.deleteAny');
    const canDeleteOwn = can(role, 'videorama.deleteOwn', {
        ownerId: collection.ownerId,
        requesterId: req.user?.sub,
    });
    if (!canDeleteAny && !canDeleteOwn) {
        return res.status(403).json({ error: 'forbidden' });
    }
    await deleteCollection(req.params.id);
    res.status(204).send();
};
