import crypto from 'node:crypto';
import { prisma } from '../../db/prisma';
import { buildAgoraToken } from './agoraToken.service';
import { env } from '../../env';

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

export const listPublicRooms = async (status: 'OPEN' | 'CLOSED') => {
  return prisma.room.findMany({
    where: { visibility: 'PUBLIC', status },
    orderBy: { createdAt: 'desc' },
  });
};

export const createRoom = async (hostId: string, title: string, visibility: 'PUBLIC' | 'PRIVATE') => {
  const channelName = `room_${crypto.randomUUID()}`;
  let joinToken: string | null = null;
  let joinTokenHash: string | null = null;

  if (visibility === 'PRIVATE') {
    joinToken = crypto.randomBytes(16).toString('hex');
    joinTokenHash = hashToken(joinToken);
  }

  const room = await prisma.room.create({
    data: {
      title,
      visibility,
      hostId,
      channelName,
      joinTokenHash,
    },
  });

  return { room, joinToken };
};

export const joinRoom = async (roomId: string, userId: string, joinToken?: string) => {
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) {
    throw new Error('Room not found');
  }
  if (room.status !== 'OPEN') {
    throw new Error('Room closed');
  }
  if (room.visibility === 'PRIVATE') {
    if (!joinToken || !room.joinTokenHash) {
      throw new Error('Missing join token');
    }
    const incomingHash = hashToken(joinToken);
    if (incomingHash !== room.joinTokenHash) {
      throw new Error('Invalid join token');
    }
  }

  const uid = Number(userId.slice(-6));
  const { token, expiresAt } = buildAgoraToken(room.channelName, String(uid));

  return {
    room,
    agora: {
      appId: env.AGORA_APP_ID,
      channelName: room.channelName,
      uid: String(uid),
      rtcToken: token,
      expiresAt,
    },
  };
};
