import { Request, Response } from 'express';
import { z } from 'zod';
import { env } from '../../env.js';
import { prisma } from '../../db/prisma.js';
import { signAccessToken } from './jwt.js';
import { verifyTelegramHash } from './telegramVerify.js';
import type { Role } from '../../shared/rbac.js';

const telegramSchema = z.object({
  id: z.string(),
  username: z.string().optional(),
  first_name: z.string().optional(),
  photo_url: z.string().optional(),
  auth_date: z.number(),
  hash: z.string(),
});

const MAX_AUTH_AGE_SECONDS = 300;

const resolveRole = async (telegramUserId: string, baseRole: Role) => {
  const membership = await prisma.membership.findFirst({
    where: {
      telegramUserId,
      status: 'ACTIVE',
      expiresAt: { gt: new Date() },
    },
  });
  if (baseRole === 'ADMIN') return 'ADMIN' as Role;
  if (membership && membership.plan === 'PRIME') return 'PRIME' as Role;
  return 'FREE' as Role;
};

export const telegramAuth = async (req: Request, res: Response) => {
  const payload = telegramSchema.parse(req.body);
  const authAge = Math.abs(Date.now() / 1000 - payload.auth_date);
  if (authAge > MAX_AUTH_AGE_SECONDS) {
    return res.status(401).json({ error: 'auth_date too old' });
  }

  const isValid = verifyTelegramHash(
    {
      id: payload.id,
      username: payload.username ?? '',
      first_name: payload.first_name ?? '',
      photo_url: payload.photo_url ?? '',
      auth_date: String(payload.auth_date),
    },
    env.TELEGRAM_BOT_TOKEN
  );

  if (!isValid || payload.hash.length === 0) {
    return res.status(401).json({ error: 'invalid hash' });
  }

  const user = await prisma.user.upsert({
    where: { telegramUserId: payload.id },
    update: {
      username: payload.username,
      firstName: payload.first_name,
      photoUrl: payload.photo_url,
    },
    create: {
      telegramUserId: payload.id,
      username: payload.username,
      firstName: payload.first_name,
      photoUrl: payload.photo_url,
    },
  });

  const role = await resolveRole(user.telegramUserId, user.role as Role);
  const termsAccepted = Boolean(user.acceptedTermsAt);
  const accessToken = signAccessToken({
    sub: user.telegramUserId,
    role,
    termsAccepted,
  });
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  return res.json({
    accessToken,
    expiresAt,
    role,
    telegramUser: {
      id: user.telegramUserId,
      username: user.username,
      first_name: user.firstName,
      photo_url: user.photoUrl,
      auth_date: payload.auth_date,
      hash: payload.hash,
    },
    termsAccepted,
  });
};

export const me = async (req: Request, res: Response) => {
  const userId = req.user?.sub;
  if (!userId) return res.status(401).json({ error: 'unauthorized' });

  const user = await prisma.user.findUnique({ where: { telegramUserId: userId } });
  if (!user) return res.status(404).json({ error: 'not found' });

  const role = await resolveRole(user.telegramUserId, user.role as Role);
  return res.json({
    role,
    telegramUser: {
      id: user.telegramUserId,
      username: user.username,
      first_name: user.firstName,
      photo_url: user.photoUrl,
    },
    termsAccepted: Boolean(user.acceptedTermsAt),
  });
};

export const acceptTerms = async (req: Request, res: Response) => {
  const userId = req.user?.sub;
  if (!userId) return res.status(401).json({ error: 'unauthorized' });

  await prisma.user.update({
    where: { telegramUserId: userId },
    data: { acceptedTermsAt: new Date() },
  });

  return res.status(204).send();
};
