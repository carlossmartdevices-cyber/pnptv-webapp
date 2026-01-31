import { Request, Response } from 'express';
import { z } from 'zod';
import { createRoom, joinRoom, listPublicRooms } from './hangouts.service.js';

const createSchema = z.object({
  title: z.string().min(3),
  visibility: z.enum(['PUBLIC', 'PRIVATE']),
});

const joinSchema = z.object({
  joinToken: z.string().optional(),
});

export const getPublicRooms = async (req: Request, res: Response) => {
  const status = (req.query.status as 'OPEN' | 'CLOSED') ?? 'OPEN';
  const rooms = await listPublicRooms(status);
  res.json({ rooms });
};

export const postRoom = async (req: Request, res: Response) => {
  const { title, visibility } = createSchema.parse(req.body);
  const hostId = req.user?.sub;
  if (!hostId) return res.status(401).json({ error: 'unauthorized' });
  const { room, joinToken } = await createRoom(hostId, title, visibility);
  const joinLink = joinToken ? `${req.protocol}://${req.get('host')}/hangouts/join/${room.id}?token=${joinToken}` : null;
  res.status(201).json({ room, joinLink });
};

export const postJoin = async (req: Request, res: Response) => {
  const { joinToken } = joinSchema.parse(req.body);
  const userId = req.user?.sub;
  if (!userId) return res.status(401).json({ error: 'unauthorized' });
  try {
    const payload = await joinRoom(req.params.roomId, userId, joinToken);
    res.json(payload);
  } catch (error) {
    res.status(403).json({ error: (error as Error).message });
  }
};
