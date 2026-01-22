import { describe, expect, it, vi, beforeEach } from 'vitest';
import { prisma } from '../../db/client';

const createRes = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('telegramVerify', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'a'.repeat(32);
    process.env.TELEGRAM_BOT_TOKEN = 'token';
    process.env.DATABASE_URL = 'https://example.com';
    process.env.AGORA_APP_ID = 'test';
    process.env.AGORA_APP_CERTIFICATE = 'test';
    vi.spyOn(prisma.user, 'upsert').mockResolvedValue({
      id: '1',
      telegramUserId: '1',
      username: null,
      firstName: null,
      photoUrl: null,
      role: 'FREE',
      acceptedTermsAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    } as any);
  });

  it('retorna 401 cuando hash es inválido', async () => {
    const { telegramLogin } = await import('./auth.controller');
    const req: any = {
      body: {
        id: 1,
        username: 'test',
        first_name: 'Test',
        auth_date: Math.floor(Date.now() / 1000),
        hash: 'invalid'
      }
    };
    const res = createRes();

    await telegramLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});
