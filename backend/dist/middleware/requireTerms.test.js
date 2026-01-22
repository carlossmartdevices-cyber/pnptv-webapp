import { describe, expect, it, vi } from 'vitest';
import { requireTerms } from './requireTerms';
vi.mock('../db/prisma', () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
        },
    },
}));
const { prisma } = await import('../db/prisma');
describe('requireTerms middleware', () => {
    it('returns 403 when terms not accepted', async () => {
        prisma.user.findUnique.mockResolvedValue({
            acceptedTermsAt: null,
        });
        const req = { user: { sub: '123' } };
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
        const next = vi.fn();
        await requireTerms(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });
});
