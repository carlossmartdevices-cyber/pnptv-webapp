import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../env';
import { prisma } from '../db/client';

export const authRequired = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { sub: string; role: string };
    const user = await prisma.user.findUnique({ where: { telegramUserId: decoded.sub } });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.auth = {
      id: user.id,
      telegramUserId: user.telegramUserId,
      role: user.role,
      acceptedTermsAt: user.acceptedTermsAt
    };

    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};
