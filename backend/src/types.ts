import type { Role } from '@prisma/client';

export type AuthUser = {
  id: string;
  telegramUserId: string;
  role: Role;
  acceptedTermsAt: Date | null;
};

declare global {
  namespace Express {
    interface Request {
      auth?: AuthUser;
    }
  }
}
