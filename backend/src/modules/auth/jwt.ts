import jwt from 'jsonwebtoken';
import { env } from '../../env';
import type { Role } from '@prisma/client';

export const signAccessToken = (payload: { telegramUserId: string; role: Role; termsAccepted: boolean }) => {
  const expiresIn = '1h';
  const token = jwt.sign(
    { role: payload.role, termsAccepted: payload.termsAccepted },
    env.JWT_SECRET,
    { subject: payload.telegramUserId, expiresIn }
  );
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  return { token, expiresAt };
};
