# PM2 Deployment Summary for PNP TV

## ✅ What's Ready

1. **PM2**: Installed globally
2. **serve**: Installed globally for serving frontend files
3. **Frontend**: Built successfully (`frontend/dist/`)
4. **Backend**: Dependencies installed, ready to run in development mode
5. **PM2 Configuration**: `ecosystem.config.js` created and ready

## 📋 Deployment Steps

### Quick Start

```bash
# 1. Set up PostgreSQL (choose one method)
# Option A: Local installation
sudo apt update && sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Option B: Docker
docker run --name pnptv-postgres \
  -e POSTGRES_USER=pnptv \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=pnptv \
  -p 5432:5432 \
  -d postgres:latest

# 2. Configure backend
cd backend
cp .env.example .env  # if .env.example exists
# Edit .env with your actual credentials

# 3. Run database migrations
npx prisma migrate dev --name init

# 4. Deploy with PM2
cd ..
pm2 start ecosystem.config.js
pm2 save
pm2 startup
pm2 save
```

## 🎯 PM2 Configuration

The `ecosystem.config.js` file is set up with:

### Frontend Service
- **Name**: `pnptv-frontend`
- **Port**: 3000
- **Command**: `serve -s frontend/dist -l 3000`
- **Auto-restart**: Enabled
- **Memory limit**: 1GB

### Backend Service  
- **Name**: `pnptv-backend`
- **Port**: 4000
- **Command**: `npm run dev` (development mode)
- **Auto-restart**: Enabled
- **Memory limit**: 1GB
- **Environment**: Configured with PostgreSQL and other settings

## 🔧 Environment Variables

Edit `backend/.env` with your actual credentials:

```
PORT=4000
DATABASE_URL="postgresql://pnptv:your_password@localhost:5432/pnptv?schema=public"
JWT_SECRET="your_very_secure_jwt_secret_at_least_32_characters"
TELEGRAM_BOT_TOKEN="your_telegram_bot_token"
AGORA_APP_ID="your_agora_app_id"
AGORA_APP_CERTIFICATE="your_agora_certificate"
CORS_ORIGIN="http://localhost:3000"
```

## 🚀 Deployment Commands

```bash
# Start all services
pm2 start ecosystem.config.js

# Save the process list
pm2 save

# Set up startup script (run this to make PM2 start on boot)
pm2 startup
pm2 save

# Monitor all processes
pm2 monit

# View logs
pm2 logs
pm2 logs pnptv-frontend
pm2 logs pnptv-backend

# Restart services
pm2 restart all

# Stop services
pm2 stop all

# Delete services
pm2 delete all
```

## 🌐 Access Your Application

After deployment:
- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:4000`
- **PM2 Dashboard**: `pm2 monit`

## ⚠️ Important Notes

### Backend Mode
The backend is currently configured to run in **development mode** (`npm run dev`) because:
- There are TypeScript compilation issues preventing a production build
- This is fine for development and testing
- For production, you should fix the TypeScript errors and build with `npm run build`

### Database Requirements
- PostgreSQL must be running and accessible
- Database migrations must be run (`npx prisma migrate dev --name init`)
- Connection string must be correct in `.env`

### Production Recommendations
1. **Fix TypeScript errors** and build backend for production
2. **Set up a reverse proxy** (Nginx/Apache) for SSL and routing
3. **Configure proper logging** and monitoring
4. **Set up backups** for your PostgreSQL database
5. **Secure your server** with firewall rules

## 📚 Documentation

- **Full PM2 Guide**: See `PM2_DEPLOYMENT_GUIDE.md`
- **Deployment Options**: See `DEPLOYMENT_GUIDE.md`
- **PostgreSQL Setup**: See `POSTGRES_MIGRATION_GUIDE.md`

## 🎉 Next Steps

1. **Set up PostgreSQL** (if not already done)
2. **Configure environment variables** in `backend/.env`
3. **Run database migrations**
4. **Deploy with PM2**: `pm2 start ecosystem.config.js`
5. **Test your deployment**
6. **Monitor with PM2**: `pm2 monit`

The application is ready for PM2 deployment! Just follow the steps above to get it running.