# PostgreSQL Migration Guide for PNP TV

## Current State
The application is already configured to use PostgreSQL via Prisma! The backend uses:
- Prisma ORM for database access
- PostgreSQL as the database
- Firebase is NOT used for the database

## What You Need to Do

### 1. Set Up PostgreSQL Database

#### Option A: Install PostgreSQL Locally
```bash
# On Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql
n```

#### Option B: Use Docker
```bash
docker run --name pnptv-postgres \
  -e POSTGRES_USER=pnptv \
  -e POSTGRES_PASSWORD=your_secure_password \
  -e POSTGRES_DB=pnptv \
  -p 5432:5432 \
  -d postgres:latest
```

### 2. Configure Database Connection

Create a `.env` file in the `backend` directory:
```bash
cd backend
cp .env.example .env  # if .env.example exists
```

Add your PostgreSQL connection string to `.env`:
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

Example:
```
DATABASE_URL="postgresql://pnptv:your_secure_password@localhost:5432/pnptv?schema=public"
```

### 3. Set Up Database Schema

Run Prisma migrations:
```bash
cd backend
npx prisma migrate dev --name init
```

This will:
1. Create the database tables based on the schema
2. Generate the Prisma Client
3. Apply any pending migrations

### 4. Start the Backend

```bash
cd backend
npm install
npm run dev
```

### 5. Configure Frontend

The frontend should already be configured to use the backend API. Make sure the frontend is pointing to your backend URL.

## Database Schema

The current schema includes:
- **User**: Telegram user information and roles
- **Membership**: User subscription information
- **Room**: Video chat rooms
- **Collection**: Media collections (playlists/podcasts)
- **Item**: Individual media items

## Environment Variables

Make sure to set all required environment variables in `backend/.env`:
```
PORT=4000
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
JWT_SECRET="your_very_secure_jwt_secret_at_least_32_chars"
TELEGRAM_BOT_TOKEN="your_telegram_bot_token"
AGORA_APP_ID="your_agora_app_id"
AGORA_APP_CERTIFICATE="your_agora_certificate"
CORS_ORIGIN="http://localhost:5173"  # or your frontend URL
```

## Deployment

Since you're hosting PostgreSQL yourself, you'll need to:
1. Ensure PostgreSQL is accessible from your backend
2. Configure proper security (firewall rules, SSL, etc.)
3. Set up regular backups
4. Monitor database performance

## Notes

- The application already uses Prisma for database access
- Firebase is NOT used for the database
- Authentication is handled separately (check the auth module)
- The frontend communicates with the backend API, not directly with the database
