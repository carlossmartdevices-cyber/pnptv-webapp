import crypto from 'crypto';
import { prisma } from '../../db/client';
import type { RoomVisibility } from '@prisma/client';

export const listPublicRooms = async () => {
  return prisma.room.findMany({
    where: { visibility: 'PUBLIC', status: 'OPEN' },
    orderBy: { createdAt: 'desc' }
  });
};

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

export const createRoom = async ({
  title,
  visibility,
  hostId
}: {
  title: string;
  visibility: RoomVisibility;
  hostId: string;
}) => {
  const joinToken = visibility === 'PRIVATE' ? crypto.randomBytes(16).toString('hex') : null;
  const room = await prisma.room.create({
    data: {
      title,
      visibility,
      hostId,
      channelName: `room-${crypto.randomBytes(6).toString('hex')}`,
      joinTokenHash: joinToken ? hashToken(joinToken) : null
    }
  });
  return { room, joinToken };
};

export const joinRoom = async ({
  roomId,
  joinToken
}: {
  roomId: string;
  joinToken?: string | null;
}) => {
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room || room.status !== 'OPEN') {
    return null;
  }

  if (room.visibility === 'PRIVATE') {
    if (!joinToken) {
      return null;
    }
    const hash = hashToken(joinToken);
    if (hash !== room.joinTokenHash) {
      return null;
    }
  }

  return room;
};
