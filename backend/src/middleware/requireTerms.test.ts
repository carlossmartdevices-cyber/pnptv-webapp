import { describe, expect, it, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
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
    (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      acceptedTermsAt: null,
    });

    const req = { user: { sub: '123' } } as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const next = vi.fn() as NextFunction;

    await requireTerms(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
