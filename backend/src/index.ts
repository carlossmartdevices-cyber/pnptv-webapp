import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './env.js';
import { apiRateLimit } from './middleware/rateLimit.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { hangoutsRouter } from './modules/hangouts/hangouts.routes.js';
import { videoramaRouter } from './modules/videorama/videorama.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { securityHeaders } from './middleware/securityHeaders.js';
import { connectDatabase, getDatabaseStats } from './utils/database.js';
import { securityConfig } from './config/security.js';
import { logger } from './config/logging.js';
import { Monitoring } from './utils/monitoring.js';
import { prisma } from './db/prisma.js';

const formatUnknownError = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error === undefined) return 'Unknown error';
  return JSON.stringify(error);
};

const app = express();
const monitoring = Monitoring.getInstance();

// Trust proxy settings for rate limiting and security headers
app.set('trust proxy', true);

// Initialize monitoring
if (env.NODE_ENV === 'production') {
  monitoring.startMemoryMonitoring();
  monitoring.logSystemInfo();
}

// Security Middleware
app.use(helmet());
app.use(securityHeaders);

// CORS Configuration
app.use(cors({
  origin: env.CORS_ORIGIN.split(','),
  methods: env.CORS_METHODS.split(','),
  credentials: env.CORS_CREDENTIALS === 'true',
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'X-Total-Count']
}));

// Request Parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rate Limiting
app.use(apiRateLimit);

// Request Logging
app.use(requestLogger);

// Performance monitoring middleware
app.use((req, res, next) => {
  const start = performance.now();
  const route = `${req.method} ${req.path}`;
  
  res.on('finish', () => {
    monitoring.trackRequest([start, performance.now()], route);
  });
  
  next();
});

// Health Check Endpoint
app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/hangouts', hangoutsRouter);
app.use('/api/v1/videorama', videoramaRouter);

// Error Handling
app.use(errorHandler);

// Database Connection
connectDatabase().catch(error => {
  const message = formatUnknownError(error);
  console.error('❌ Failed to connect to database:', message);
  process.exit(1);
});

// Add database health check endpoint
app.get('/health/db', async (req, res) => {
  try {
    const health = await getDatabaseStats();
    if (health.healthy) {
      res.json({
        ok: true,
        database: 'healthy',
        stats: health.stats,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        ok: false,
        database: 'unhealthy',
        error: health.error,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(503).json({
      ok: false,
      database: 'unhealthy',
      error: formatUnknownError(error),
      timestamp: new Date().toISOString()
    });
  }
});

// Graceful Shutdown
const server = app.listen(Number(env.PORT), () => {
  logger.info(`🚀 API Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  logger.info(`📡 CORS enabled for: ${env.CORS_ORIGIN}`);
  logger.info(`🔒 Security: JWT expires in ${securityConfig.jwt.expiresIn}, Rate limiting: ${securityConfig.rateLimiting.max} requests per ${securityConfig.rateLimiting.windowMs / 60000} minutes`);
  logger.info(`📊 Monitoring: Performance tracking and memory monitoring enabled`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('👋 Server and database connections closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('👋 Server and database connections closed');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  // Consider sending to error tracking service here
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  // Consider sending to error tracking service here
  process.exit(1);
});
