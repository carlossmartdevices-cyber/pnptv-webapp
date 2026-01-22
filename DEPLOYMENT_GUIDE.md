# PNP TV Deployment Guide

## Current Status

✅ **Frontend**: Built successfully (`frontend/dist/`)
⚠️ **Backend**: Needs PostgreSQL setup and configuration
❌ **Firebase Hosting**: Requires authentication (can't deploy from this environment)

## Deployment Options

### Option 1: Deploy to Firebase Hosting (Recommended)

#### Step 1: Install Firebase CLI on your local machine
```bash
npm install -g firebase-tools
```

#### Step 2: Authenticate with Firebase
```bash
firebase login
```

#### Step 3: Deploy the frontend
```bash
cd /path/to/pnptv-webapp
firebase deploy --only hosting
```

### Option 2: Deploy to Vercel (Alternative)

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Deploy frontend
```bash
cd frontend
vercel
```

### Option 3: Self-Host with Docker

#### Step 1: Create a Dockerfile for the frontend
```dockerfile
# Dockerfile.frontend
FROM nginx:alpine

COPY frontend/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Step 2: Create nginx configuration
```nginx
# nginx.conf
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

#### Step 3: Build and run
```bash
docker build -t pnptv-frontend -f Dockerfile.frontend .
docker run -p 80:80 pnptv-frontend
```

## Backend Deployment

### Step 1: Set up PostgreSQL

#### Option A: Local Installation
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Option B: Docker
```bash
docker run --name pnptv-postgres \
  -e POSTGRES_USER=pnptv \
  -e POSTGRES_PASSWORD=your_secure_password \
  -e POSTGRES_DB=pnptv \
  -p 5432:5432 \
  -d postgres:latest
```

### Step 2: Configure backend

Create `backend/.env`:
```
PORT=4000
DATABASE_URL="postgresql://pnptv:your_secure_password@localhost:5432/pnptv?schema=public"
JWT_SECRET="your_very_secure_jwt_secret_at_least_32_characters"
TELEGRAM_BOT_TOKEN="your_telegram_bot_token"
AGORA_APP_ID="your_agora_app_id"
AGORA_APP_CERTIFICATE="your_agora_certificate"
CORS_ORIGIN="http://localhost:5173"
```

### Step 3: Run database migrations
```bash
cd backend
npx prisma migrate dev --name init
```

### Step 4: Start the backend
```bash
cd backend
npm run dev
```

### Step 5: Deploy backend (Docker example)

```dockerfile
# Dockerfile.backend
FROM node:18

WORKDIR /app
COPY backend/package*.json ./
RUN npm install

COPY backend/ ./
COPY prisma ./prisma/

RUN npx prisma generate

EXPOSE 4000
CMD ["npm", "run", "start"]
```

Build and run:
```bash
docker build -t pnptv-backend -f Dockerfile.backend .
docker run -p 4000:4000 --env-file backend/.env pnptv-backend
```

## Complete Deployment with Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:latest
    environment:
      POSTGRES_USER: pnptv
      POSTGRES_PASSWORD: your_secure_password
      POSTGRES_DB: pnptv
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "4000:4000"
    environment:
      DATABASE_URL: "postgresql://pnptv:your_secure_password@postgres:5432/pnptv?schema=public"
      JWT_SECRET: "your_very_secure_jwt_secret_at_least_32_characters"
      # ... other env vars
    depends_on:
      - postgres

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

Start with:
```bash
docker-compose up --build
```

## Environment Variables Guide

### Required Variables

```
# Backend
PORT=4000
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
JWT_SECRET="your_very_secure_jwt_secret_at_least_32_characters"
TELEGRAM_BOT_TOKEN="your_telegram_bot_token"
AGORA_APP_ID="your_agora_app_id"
AGORA_APP_CERTIFICATE="your_agora_certificate"
CORS_ORIGIN="http://localhost:5173"

# Frontend (if needed)
VITE_API_URL="http://localhost:4000"
```

## Troubleshooting

### Firebase Deployment Issues
- **Error: Failed to authenticate**: Run `firebase login` on your local machine
- **Permission denied**: Make sure you have access to the Firebase project
- **Quota exceeded**: Check your Firebase plan limits

### PostgreSQL Issues
- **Connection refused**: Check if PostgreSQL is running and accessible
- **Authentication failed**: Verify your DATABASE_URL credentials
- **Schema errors**: Run `npx prisma migrate dev` to fix schema issues

### Backend Issues
- **Missing dependencies**: Run `npm install` in the backend directory
- **TypeScript errors**: Install missing type definitions with `npm install --save-dev @types/package-name`
- **Port conflicts**: Change the PORT in .env if 4000 is in use

## Next Steps

1. **Choose a deployment option** (Firebase, Vercel, or self-hosted)
2. **Set up PostgreSQL** (local, Docker, or cloud)
3. **Configure environment variables**
4. **Deploy frontend and backend**
5. **Test thoroughly**

The application is ready to deploy - you just need to choose your hosting platform and set up the database!