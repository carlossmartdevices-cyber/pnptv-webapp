import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load environment variables with proper validation
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: path.resolve(__dirname, '..', envFile) });
const envSchema = z.object({
    // Application Configuration
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('4000'),
    // Database Configuration
    DATABASE_URL: z.string().url(),
    DATABASE_MAX_CONNECTIONS: z.string().default('10'),
    DATABASE_IDLE_TIMEOUT: z.string().default('30000'),
    DATABASE_CONNECTION_TIMEOUT: z.string().default('5000'),
    // Security Configuration
    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.string().default('1h'),
    ENCRYPTION_KEY: z.string().min(32),
    // CORS Configuration
    CORS_ORIGIN: z.string().default('http://localhost:5173'),
    CORS_METHODS: z.string().default('GET,POST,PUT,PATCH,DELETE'),
    CORS_CREDENTIALS: z.string().default('true'),
    // Rate Limiting
    RATE_LIMIT_WINDOW: z.string().default('15'),
    RATE_LIMIT_MAX: z.string().default('100'),
    // Telegram Configuration
    TELEGRAM_BOT_TOKEN: z.string().min(10),
    TERMS_URL: z.string().url().default('https://pnptv.app/terms'),
    // Agora Configuration
    AGORA_APP_ID: z.string().min(5),
    AGORA_APP_CERTIFICATE: z.string().min(10),
    AGORA_TOKEN_TTL_SECONDS: z.string().default('1800'),
    // Logging Configuration
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    LOG_FORMAT: z.enum(['json', 'text']).default('json'),
    // Redis Configuration (optional)
    REDIS_URL: z.string().optional(),
    REDIS_PASSWORD: z.string().optional(),
    // Email Configuration (optional)
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    // Monitoring Configuration (optional)
    SENTRY_DSN: z.string().optional(),
    NEW_RELIC_LICENSE_KEY: z.string().optional(),
    // Analytics Configuration (optional)
    GOOGLE_ANALYTICS_ID: z.string().optional()
});
export const env = envSchema.parse(process.env);
