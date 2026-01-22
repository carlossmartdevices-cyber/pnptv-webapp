import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('4000'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  TELEGRAM_BOT_TOKEN: z.string().min(10),
  TERMS_URL: z.string().url().default('https://pnptv.app/terms'),
  AGORA_APP_ID: z.string().min(5),
  AGORA_APP_CERTIFICATE: z.string().min(10),
  AGORA_TOKEN_TTL_SECONDS: z.string().default('1800'),
  CORS_ORIGIN: z.string().default('http://localhost:5173')
});

export const env = envSchema.parse(process.env);
