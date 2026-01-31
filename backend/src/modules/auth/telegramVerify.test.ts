import { describe, expect, it } from 'vitest';
import { verifyTelegramHash } from './telegramVerify.js';

const BOT_TOKEN = 'test-token-1234567890';

describe('verifyTelegramHash', () => {
  it('rejects invalid hash', () => {
    const payload = {
      id: '123',
      username: 'user',
      first_name: 'Test',
      photo_url: 'http://example.com/photo.jpg',
      auth_date: '1710000000',
      hash: 'invalid',
    };
    expect(verifyTelegramHash(payload, BOT_TOKEN)).toBe(false);
  });
});
