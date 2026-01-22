import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../db/client';
import { env } from '../../env';
import { signAccessToken } from './jwt';
import { isAuthDateFresh, verifyTelegramAuth } from './telegramVerify';

const telegramSchema = z.object({
  id: z.number(),
  username: z.string().optional(),
  first_name: z.string().optional(),
  photo_url: z.string().optional(),
  auth_date: z.number(),
  hash: z.string()
});

export const telegramLogin = async (req: Request, res: Response) => {
  const payload = telegramSchema.safeParse(req.body);
  if (!payload.success) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  if (!isAuthDateFresh(payload.data.auth_date)) {
    return res.status(401).json({ error: 'Auth date expired' });
  }

  const valid = verifyTelegramAuth(payload.data, env.TELEGRAM_BOT_TOKEN);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid telegram hash' });
  }

  const telegramUserId = String(payload.data.id);

  const user = await prisma.user.upsert({
    where: { telegramUserId },
    create: {
      telegramUserId,
      username: payload.data.username,
      firstName: payload.data.first_name,
      photoUrl: payload.data.photo_url
    },
    update: {
      username: payload.data.username,
      firstName: payload.data.first_name,
      photoUrl: payload.data.photo_url
    }
  });

  const termsAccepted = Boolean(user.acceptedTermsAt);
  const { token, expiresAt } = signAccessToken({
    telegramUserId: user.telegramUserId,
    role: user.role,
    termsAccepted
  });

  return res.json({
    accessToken: token,
    expiresAt,
    role: user.role,
    telegramUser: {
      id: Number(user.telegramUserId),
      username: user.username,
      first_name: user.firstName,
      photo_url: user.photoUrl
    },
    termsAccepted
  });
};

export const authMe = async (req: Request, res: Response) => {
  if (!req.auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { token, expiresAt } = signAccessToken({
    telegramUserId: req.auth.telegramUserId,
    role: req.auth.role,
    termsAccepted: Boolean(req.auth.acceptedTermsAt)
  });

  return res.json({
    accessToken: token,
    expiresAt,
    role: req.auth.role,
    telegramUser: {
      id: Number(req.auth.telegramUserId)
    },
    termsAccepted: Boolean(req.auth.acceptedTermsAt)
  });
};

export const acceptTerms = async (req: Request, res: Response) => {
  if (!req.auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await prisma.user.update({
    where: { id: req.auth.id },
    data: { acceptedTermsAt: new Date() }
  });

  return res.json({ accepted: true });
};

export const logout = (_req: Request, res: Response) => {
  return res.json({ ok: true });
};
