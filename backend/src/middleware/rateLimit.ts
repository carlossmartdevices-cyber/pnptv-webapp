import rateLimit from 'express-rate-limit';
import { env } from '../env';
import { securityConfig } from '../config/security';

export const apiRateLimit = rateLimit({
  windowMs: securityConfig.rateLimiting.windowMs,
  max: securityConfig.rateLimiting.max,
  standardHeaders: securityConfig.rateLimiting.standardHeaders,
  legacyHeaders: securityConfig.rateLimiting.legacyHeaders,
  message: securityConfig.rateLimiting.message,
  skip: (req) => {
    // Skip rate limiting for health check and local development
    return req.path === '/health' || env.NODE_ENV === 'development';
  },
  keyGenerator: (req) => {
    // Use IP address for rate limiting
    return req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too Many Requests',
      message: securityConfig.rateLimiting.message,
      retryAfter: req.rateLimit.resetTime,
      timestamp: new Date().toISOString()
    });
  }
});

// More restrictive rate limiting for auth routes
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login attempts per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts, please try again later.',
  skip: (req) => env.NODE_ENV === 'development',
  keyGenerator: (req) => req.ip,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Too many login attempts, please try again later.',
      retryAfter: req.rateLimit.resetTime,
      timestamp: new Date().toISOString()
    });
  }
});
