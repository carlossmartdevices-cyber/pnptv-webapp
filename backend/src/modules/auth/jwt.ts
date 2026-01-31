import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { env } from '../../env.js';
import type { Role } from '../../shared/rbac.js';

export type JwtPayload = {
  sub: string;
  role: Role;
  termsAccepted: boolean;
};

export const signAccessToken = (
  payload: JwtPayload,
  expiresIn: SignOptions['expiresIn'] = '1h'
) => {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, env.JWT_SECRET as Secret, options);
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, env.JWT_SECRET as Secret) as JwtPayload & { exp: number };
};
