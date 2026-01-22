import crypto from 'crypto';

export type TelegramAuthPayload = {
  id: number;
  username?: string;
  first_name?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

export const verifyTelegramAuth = (payload: TelegramAuthPayload, botToken: string) => {
  const { hash, ...data } = payload;
  const dataCheckString = Object.keys(data)
    .sort()
    .map((key) => `${key}=${(data as Record<string, string | number>)[key]}`)
    .join('\n');

  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  return hmac === hash;
};

export const isAuthDateFresh = (authDate: number, maxAgeSeconds = 300) => {
  const now = Math.floor(Date.now() / 1000);
  return now - authDate <= maxAgeSeconds;
};
