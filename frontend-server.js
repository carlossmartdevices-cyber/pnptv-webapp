const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;
const DIST_PATH = path.join(__dirname, 'frontend', 'dist');
const PUBLIC_PATH = path.join(__dirname, 'public');
const isProduction = process.env.NODE_ENV === 'production';

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.pnptv.app"],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Compression for production
if (isProduction) {
  app.use(compression());
}

// Logging
app.use(morgan(isProduction ? 'combined' : 'dev'));

// Security Headers
app.use((req, res, next) => {
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()');
  next();
});

// Cache Control for Static Assets
app.use((req, res, next) => {
  if (req.path.startsWith('/static/')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  next();
});

// Serve static files from public directory first (landing pages)
app.use(express.static(PUBLIC_PATH, {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

// Landing page routes (without .html extension)
app.get('/lifetime100', (req, res) => {
  res.sendFile(path.join(PUBLIC_PATH, 'lifetime100.html'));
});

app.get('/how-to-use', (req, res) => {
  res.sendFile(path.join(PUBLIC_PATH, 'how-to-use.html'));
});

// Serve static files from dist
app.use(express.static(DIST_PATH, {
  maxAge: '1h',
  etag: true,
  lastModified: true
}));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    environment: isProduction ? 'production' : 'development'
  });
});

// Handle SPA routing - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_PATH, 'index.html'));
});

// Error Handling
app.use((err, req, res, next) => {
  console.error('❌ Frontend Server Error:', err);
  res.status(500).send('Internal Server Error');
});

// Graceful Shutdown
const server = app.listen(PORT, () => {
  console.log(`🚀 Frontend server running in ${isProduction ? 'production' : 'development'} mode on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('👋 Frontend server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('👋 Frontend server closed');
    process.exit(0);
  });
});
