import crypto from 'node:crypto';

export const verifyTelegramHash = (payload: Record<string, string>, botToken: string) => {
  const { hash, ...data } = payload;
  const sorted = Object.keys(data)
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join('\n');
  const secret = crypto.createHash('sha256').update(botToken).digest();
  const computed = crypto.createHmac('sha256', secret).update(sorted).digest('hex');
  return computed === hash;
};
