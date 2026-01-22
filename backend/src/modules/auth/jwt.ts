import jwt from 'jsonwebtoken';
import { env } from '../../env';
import type { Role } from '../../shared/rbac';

export type JwtPayload = {
  sub: string;
  role: Role;
  termsAccepted: boolean;
};

export const signAccessToken = (payload: JwtPayload, expiresIn: string = '1h') => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload & { exp: number };
};
