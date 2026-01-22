import { verifyAccessToken } from '../modules/auth/jwt';
export const authRequired = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'missing token' });
    }
    try {
        const token = header.replace('Bearer ', '');
        req.user = verifyAccessToken(token);
        return next();
    }
    catch {
        return res.status(401).json({ error: 'invalid token' });
    }
};
