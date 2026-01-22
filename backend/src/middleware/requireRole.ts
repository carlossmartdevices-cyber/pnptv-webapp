import type { Request, Response, NextFunction } from 'express';
import type { Role } from '@prisma/client';

export const requireRole = (roles: Role[]) => (req: Request, res: Response, next: NextFunction) => {
  if (!req.auth || !roles.includes(req.auth.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  return next();
};
