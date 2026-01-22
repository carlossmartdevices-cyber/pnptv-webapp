# 🚀 PNP TV Production Deployment Guide

## 🎯 Current Status

✅ **Frontend**: Deployed and accessible at `http://localhost/`
✅ **Nginx**: Properly configured as reverse proxy
✅ **PM2**: Services running and managed
⚠️ **Backend**: Running but needs database configuration

## 📋 Production Deployment Checklist

### Phase 1: Current Deployment (Complete)
- [x] Frontend built and deployed
- [x] Nginx configured as reverse proxy
- [x] PM2 process management set up
- [x] Auto-restart and monitoring configured
- [x] Security headers implemented

### Phase 2: Production Preparation
- [ ] Set up production domain and SSL
- [ ] Configure proper environment variables
- [ ] Set up PostgreSQL database
- [ ] Run database migrations
- [ ] Test backend API endpoints
- [ ] Configure proper logging
- [ ] Set up monitoring and alerts
- [ ] Implement backup strategy
- [ ] Configure firewall rules
- [ ] Set up CI/CD pipeline

### Phase 3: Production Launch
- [ ] Final testing in staging
- [ ] DNS configuration
- [ ] SSL certificate setup
- [ ] Load testing
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Go-live checklist
- [ ] Monitoring setup
- [ ] Backup verification

## 🎯 Production Deployment Steps

### Step 1: Set Up Production Domain

```bash
# Example for domain setup (use your actual domain)
server {
    listen 80;
    listen [::]:80;
    server_name pnptv.app www.pnptv.app;

    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name pnptv.app www.pnptv.app;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/pnptv.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pnptv.app/privkey.pem;

    # Proxy to frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Proxy to backend API
    location /api/ {
        proxy_pass http://localhost:4000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Step 2: Set Up SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d pnptv.app -d www.pnptv.app

# Set up automatic renewal
sudo certbot renew --dry-run
```

### Step 3: Configure Production Environment

Create `backend/.env.production`:

```
# Production environment variables
NODE_ENV=production
PORT=4000
DATABASE_URL="postgresql://pnptv:your_production_password@localhost:5432/pnptv_production?schema=public"
JWT_SECRET="your_very_secure_production_jwt_secret_at_least_32_characters"
TELEGRAM_BOT_TOKEN="your_telegram_bot_token"
AGORA_APP_ID="your_agora_app_id"
AGORA_APP_CERTIFICATE="your_agora_certificate"
CORS_ORIGIN="https://pnptv.app"
SESSION_SECRET="your_session_secret"
REDIS_URL="redis://localhost:6379"
```

### Step 4: Set Up PostgreSQL for Production

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create production database
sudo -u postgres createdb pnptv_production
sudo -u postgres createuser pnptv
sudo -u postgres psql -c "ALTER USER pnptv WITH PASSWORD 'your_production_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE pnptv_production TO pnptv;"

# Run migrations
cd backend
npx prisma migrate deploy
```

### Step 5: Optimize PM2 for Production

Update `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'pnptv-frontend-production',
      script: 'serve',
      args: '-s frontend/dist -l 3000',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'pnptv-backend-production',
      script: 'dist/index.js',  # Use built files
      cwd: './backend',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000
      }
    }
  ]
};
```

### Step 6: Build Backend for Production

```bash
cd backend
npm run build
```

### Step 7: Set Up Monitoring

```bash
# Install PM2 monitoring
pm2 install pm2-logrotate
pm2 install pm2-server-monit

# Set up monitoring dashboard
pm2 plus
```

### Step 8: Configure Firewall

```bash
# Allow HTTP, HTTPS, and SSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### Step 9: Set Up Backups

```bash
# Install backup tools
sudo apt install rsync

# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
# Backup script for PNP TV

# Database backup
pg_dump -U pnptv -d pnptv_production > /backups/pnptv_db_$(date +%Y%m%d).sql

# Application backup
rsync -a /root/pnptv-webapp/ /backups/pnptv_app_$(date +%Y%m%d)/

# Clean up old backups (keep last 7 days)
find /backups -type f -name "*.sql" -mtime +7 -delete
find /backups -type d -name "pnptv_app_*" -mtime +7 -exec rm -rf {} \;
EOF

# Make executable
chmod +x backup.sh

# Set up cron job
crontab -e
# Add this line:
0 2 * * * /root/pnptv-webapp/backup.sh
```

### Step 10: Set Up Logging

```bash
# Configure Nginx logging
sudo mkdir -p /var/log/nginx/pnptv
sudo touch /var/log/nginx/pnptv/access.log
sudo touch /var/log/nginx/pnptv/error.log

# Update Nginx configuration
sudo nano /etc/nginx/sites-available/pnptv-pm2
# Add:
access_log /var/log/nginx/pnptv/access.log;
error_log /var/log/nginx/pnptv/error.log;

# Set up log rotation
sudo nano /etc/logrotate.d/nginx-pnptv
# Add:
/var/log/nginx/pnptv/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        systemctl reload nginx
    endscript
}
```

### Step 11: Performance Optimization

```bash
# Enable Gzip compression
sudo nano /etc/nginx/nginx.conf
# Ensure gzip is enabled:
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss;

# Enable caching
sudo nano /etc/nginx/sites-available/pnptv-pm2
# Add caching headers:
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 30d;
    add_header Cache-Control "public, no-transform";
}

# Optimize PM2
pm2 scale pnptv-frontend-production +2
pm2 scale pnptv-backend-production +2
```

### Step 12: Security Hardening

```bash
# Install security tools
sudo apt install fail2ban

# Configure fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local
# Add:
[nginx-badbots]
enabled = true
filter = nginx-badbots
logpath = /var/log/nginx/pnptv/error.log
maxretry = 2

# Restart fail2ban
sudo systemctl restart fail2ban

# Set up SSH security
sudo nano /etc/ssh/sshd_config
# Update:
PermitRootLogin no
PasswordAuthentication no
UsePAM yes

# Restart SSH
sudo systemctl restart sshd
```

### Step 13: Set Up CI/CD Pipeline

```bash
# Example GitHub Actions workflow (.github/workflows/deploy.yml)
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm install
    
    - name: Build frontend
      run: cd frontend && npm install && npm run build
    
    - name: Build backend
      run: cd backend && npm install && npm run build
    
    - name: Deploy to server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.SERVER_IP }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SSH_PRIVATE_KEY }}
        script: |
          cd /root/pnptv-webapp
          git pull origin main
          cd frontend && npm install && npm run build
          cd ../backend && npm install && npm run build
          pm2 restart all
          sudo systemctl reload nginx
```

### Step 14: Final Testing

```bash
# Test frontend
curl -I https://pnptv.app/

# Test API
curl -I https://pnptv.app/api/

# Load testing
npm install -g artillery
artillery quick --count 50 -n 20 https://pnptv.app/

# Security testing
npm install -g nmap
nmap -sV pnptv.app
```

### Step 15: Go Live Checklist

```bash
# Before launch
- [ ] Domain DNS properly configured
- [ ] SSL certificates installed and working
- [ ] Database backups verified
- [ ] Monitoring alerts configured
- [ ] Error tracking set up
- [ ] Performance benchmarks established
- [ ] Security audit completed
- [ ] Rollback plan documented

# During launch
- [ ] Announce maintenance window
- [ ] Disable caching temporarily
- [ ] Monitor server resources
- [ ] Watch error logs
- [ ] Test critical paths
- [ ] Verify database connections

# After launch
- [ ] Monitor performance
- [ ] Check error rates
- [ ] Verify analytics
- [ ] Test backup restoration
- [ ] Document any issues
- [ ] Update monitoring thresholds
```

## 🎯 Production Environment Variables

### Frontend (.env.production)
```
VITE_API_URL=https://pnptv.app/api
VITE_APP_ENV=production
VITE_SENTRY_DSN=your_sentry_dsn
VITE_GOOGLE_ANALYTICS=your_ga_id
```

### Backend (.env.production)
```
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://pnptv:secure_password@localhost:5432/pnptv_production
JWT_SECRET=your_very_secure_32+_character_secret
TELEGRAM_BOT_TOKEN=your_bot_token
AGORA_APP_ID=your_agora_id
AGORA_APP_CERTIFICATE=your_agora_cert
CORS_ORIGIN=https://pnptv.app
SESSION_SECRET=your_session_secret
REDIS_URL=redis://localhost:6379
LOG_LEVEL=info
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

## 🚀 Deployment Commands Summary

```bash
# Build and deploy
cd frontend && npm install && npm run build
cd backend && npm install && npm run build
pm2 restart all
sudo systemctl reload nginx

# Monitor
pm2 monit
pm2 logs

# Check status
sudo systemctl status nginx
pm2 list

# Update
cd /root/pnptv-webapp
git pull origin main
pm2 restart all
```

## 📚 Production Best Practices

### Performance
- Use PM2 cluster mode for Node.js
- Enable Gzip compression
- Implement proper caching headers
- Optimize database queries
- Use connection pooling
- Monitor memory usage

### Security
- Keep dependencies updated
- Use HTTPS everywhere
- Implement proper CORS
- Sanitize all inputs
- Use prepared statements for SQL
- Implement rate limiting
- Set secure HTTP headers
- Regular security audits

### Reliability
- Set up proper monitoring
- Configure health checks
- Implement circuit breakers
- Use proper error handling
- Set up alerting
- Regular backups
- Test restore procedures

### Scalability
- Use load balancing
- Implement auto-scaling
- Database read replicas
- CDN for static assets
- Queue-based processing
- Microservices architecture

## 🎉 Production Launch Complete!

Once you've completed all the steps in this guide, your PNP TV application will be:
- ✅ Running in production mode
- ✅ Secure with HTTPS
- ✅ Optimized for performance
- ✅ Monitored and alerted
- ✅ Backed up regularly
- ✅ Scalable for growth
- ✅ Maintainable and documented

**Congratulations on your production deployment!** 🚀

The application is now ready for real users with proper monitoring, security, and performance optimizations in place.