# PM2 Deployment Guide for PNP TV

## Overview

This guide shows you how to deploy PNP TV using PM2, a production process manager for Node.js applications.

## Current Status

✅ **Frontend**: Built and ready to serve
⚠️ **Backend**: Ready to run in development mode (TypeScript compilation issues prevent production build)
✅ **PM2**: Installed and configured

## Prerequisites

1. **Node.js** (v18+ recommended)
2. **PM2** (installed globally)
3. **PostgreSQL** (for the backend database)
4. **serve** (for serving frontend files)

## Step 1: Install Dependencies

```bash
# Install PM2 and serve globally
npm install -g pm2 serve

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies (if needed)
cd ../frontend
npm install
```

## Step 2: Build Frontend

```bash
cd frontend
npm run build
```

## Step 3: Configure Environment

Create a `.env` file in the `backend` directory:

```bash
cd backend
touch .env
```

Edit `backend/.env` with your configuration:

```
# Backend Configuration
PORT=4000
DATABASE_URL="postgresql://pnptv:your_password@localhost:5432/pnptv?schema=public"
JWT_SECRET="your_very_secure_jwt_secret_at_least_32_characters"
TELEGRAM_BOT_TOKEN="your_telegram_bot_token"
AGORA_APP_ID="your_agora_app_id"
AGORA_APP_CERTIFICATE="your_agora_certificate"
CORS_ORIGIN="http://localhost:3000"

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=pnptv
DB_PASSWORD=your_password
DB_NAME=pnptv
```

## Step 4: Set Up PostgreSQL

### Option A: Install Locally

```bash
# On Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Option B: Use Docker

```bash
docker run --name pnptv-postgres \
  -e POSTGRES_USER=pnptv \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=pnptv \
  -p 5432:5432 \
  -d postgres:latest
```

### Option C: Cloud Database

Use services like:
- AWS RDS
- Google Cloud SQL
- DigitalOcean Managed Databases
- Supabase

## Step 5: Run Database Migrations

```bash
cd backend
npx prisma migrate dev --name init
```

## Step 6: Deploy with PM2

### Option A: Use the provided ecosystem.config.js

```bash
# Start all applications
pm2 start ecosystem.config.js

# Save the process list
pm2 save

# Set up startup script
pm2 startup
pm2 save
```

### Option B: Manual PM2 Setup

```bash
# Start frontend
pm2 start "serve -s frontend/dist -l 3000" --name pnptv-frontend

# Start backend
pm2 start "npm run dev" --name pnptv-backend --cwd backend

# Save the process list
pm2 save

# Set up startup script
pm2 startup
pm2 save
```

## Step 7: Configure PM2 (Optional)

Create a custom ecosystem file:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'pnptv-frontend',
      script: 'serve',
      args: '-s frontend/dist -l 3000',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'pnptv-backend',
      script: 'npm',
      args: 'run dev',
      cwd: './backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 4000,
        DATABASE_URL: 'postgresql://pnptv:your_password@localhost:5432/pnptv?schema=public',
        JWT_SECRET: 'your_very_secure_jwt_secret_at_least_32_characters',
        TELEGRAM_BOT_TOKEN: 'your_telegram_bot_token',
        AGORA_APP_ID: 'your_agora_app_id',
        AGORA_APP_CERTIFICATE: 'your_agora_certificate',
        CORS_ORIGIN: 'http://localhost:3000'
      }
    }
  ]
};
```

## Step 8: Monitor and Manage

```bash
# List all running processes
pm2 list

# View logs
pm2 logs
pm2 logs pnptv-frontend
pm2 logs pnptv-backend

# Monitor dashboard
pm2 monit

# Restart applications
pm2 restart all
pm2 restart pnptv-frontend
pm2 restart pnptv-backend

# Stop applications
pm2 stop all
pm2 stop pnptv-frontend
pm2 stop pnptv-backend

# Delete applications
pm2 delete all
pm2 delete pnptv-frontend
pm2 delete pnptv-backend
```

## Step 9: Set Up Reverse Proxy (Optional)

For production, set up Nginx or Apache as a reverse proxy:

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/pnptv

server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:4000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Apache Configuration

```apache
<VirtualHost *:80>
    ServerName yourdomain.com

    ProxyPreserveHost On
    ProxyRequests Off

    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/

    ProxyPass /api/ http://localhost:4000/
    ProxyPassReverse /api/ http://localhost:4000/
</VirtualHost>
```

## Step 10: Secure Your Deployment

### SSL/TLS with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Firewall Configuration

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

## Troubleshooting

### Common Issues

1. **Port conflicts**:
   ```bash
   sudo lsof -i :3000
   sudo lsof -i :4000
   ```

2. **Database connection issues**:
   ```bash
   # Test PostgreSQL connection
   psql -h localhost -U pnptv -d pnptv
   ```

3. **PM2 not starting**:
   ```bash
   pm2 logs --err
   journalctl -u pm2-youruser -f
   ```

4. **Memory issues**:
   ```bash
   pm2 show pnptv-backend
   pm2 monit
   ```

## Deployment Checklist

- [ ] Install Node.js (v18+)
- [ ] Install PM2 and serve globally
- [ ] Install backend dependencies
- [ ] Build frontend
- [ ] Set up PostgreSQL
- [ ] Configure environment variables
- [ ] Run database migrations
- [ ] Start applications with PM2
- [ ] Save PM2 process list
- [ ] Set up PM2 startup script
- [ ] Configure reverse proxy (optional)
- [ ] Set up SSL/TLS (optional)
- [ ] Configure firewall
- [ ] Test deployment

## Production Notes

1. **Backend**: Currently running in development mode due to TypeScript build issues. For production, you should:
   - Fix the TypeScript compilation errors
   - Build the backend with `npm run build`
   - Update the PM2 config to use the built files

2. **Environment**: Use different `.env` files for development, staging, and production

3. **Monitoring**: Set up monitoring for:
   - Application logs
   - Database performance
   - Memory usage
   - Response times

4. **Backups**: Regularly backup:
   - PostgreSQL database
   - Application files
   - Configuration files

## Next Steps

1. **Deploy**: Run `pm2 start ecosystem.config.js`
2. **Test**: Verify both frontend and backend are working
3. **Monitor**: Use `pm2 monit` to check application health
4. **Scale**: Add more instances if needed
5. **Secure**: Set up SSL and firewall rules

The application is ready for PM2 deployment! 🎉