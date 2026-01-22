import { describe, expect, it, vi } from 'vitest';
import { requireTerms } from './requireTerms';

const createRes = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('requireTerms', () => {
  it('retorna 403 si no acepta términos', () => {
    const req: any = { auth: { acceptedTermsAt: null } };
    const res = createRes();
    const next = vi.fn();

    requireTerms(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});
