import type { Request, Response, NextFunction } from 'express';

export const requireTerms = (req: Request, res: Response, next: NextFunction) => {
  if (!req.auth?.acceptedTermsAt) {
    return res.status(403).json({ error: 'Terms not accepted' });
  }

  return next();
};
