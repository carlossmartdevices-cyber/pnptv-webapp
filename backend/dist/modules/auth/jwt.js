import jwt from 'jsonwebtoken';
import { env } from '../../env.js';
export const signAccessToken = (payload, expiresIn = '1h') => {
    const options = { expiresIn };
    return jwt.sign(payload, env.JWT_SECRET, options);
};
export const verifyAccessToken = (token) => {
    return jwt.verify(token, env.JWT_SECRET);
};
