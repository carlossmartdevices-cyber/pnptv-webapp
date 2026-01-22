import jwt from 'jsonwebtoken';
import { env } from '../../env';
export const signAccessToken = (payload, expiresIn = '1h') => {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
};
export const verifyAccessToken = (token) => {
    return jwt.verify(token, env.JWT_SECRET);
};
