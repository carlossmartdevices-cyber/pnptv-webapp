import type { Request, Response } from 'express';
import { z } from 'zod';
import { env } from '../../env';
import { can } from '@shared/rbac';
import { createRoom, joinRoom, listPublicRooms } from './hangouts.service';
import { generateRtcToken } from './agoraToken.service';

const createSchema = z.object({
  title: z.string().min(3),
  visibility: z.enum(['PUBLIC', 'PRIVATE'])
});

export const getPublicRooms = async (_req: Request, res: Response) => {
  const rooms = await listPublicRooms();
  return res.json({ rooms });
};

export const createHangout = async (req: Request, res: Response) => {
  if (!req.auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!can(req.auth.role, 'hangouts.create')) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const body = createSchema.safeParse(req.body);
  if (!body.success) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const { room, joinToken } = await createRoom({
    title: body.data.title,
    visibility: body.data.visibility,
    hostId: req.auth.id
  });

  return res.json({
    room,
    joinLink: joinToken ? `/hangouts/room/${room.id}?joinToken=${joinToken}` : null
  });
};

export const joinHangout = async (req: Request, res: Response) => {
  if (!req.auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { roomId } = req.params;
  const joinToken = typeof req.body?.joinToken === 'string' ? req.body.joinToken : null;
  const room = await joinRoom({ roomId, joinToken });

  if (!room) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const action = room.visibility === 'PUBLIC' ? 'hangouts.joinPublic' : 'hangouts.joinPrivate';
  if (!can(req.auth.role, action)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const uid = Number(req.auth.telegramUserId);
  const { token, expiresAt } = generateRtcToken({
    channelName: room.channelName,
    uid
  });

  return res.json({
    room,
    agora: {
      appId: env.AGORA_APP_ID,
      channelName: room.channelName,
      uid,
      rtcToken: token,
      expiresAt
    }
  });
};
