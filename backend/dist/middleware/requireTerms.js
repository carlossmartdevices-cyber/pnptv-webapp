import { prisma } from '../db/prisma.js';
export const requireTerms = async (req, res, next) => {
    const userId = req.user?.sub;
    if (!userId) {
        return res.status(401).json({ error: 'unauthorized' });
    }
    const user = await prisma.user.findUnique({ where: { telegramUserId: userId } });
    if (!user?.acceptedTermsAt) {
        return res.status(403).json({ error: 'terms not accepted' });
    }
    return next();
};
