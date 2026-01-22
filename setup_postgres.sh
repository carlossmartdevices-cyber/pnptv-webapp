#!/bin/bash

# PNP TV PostgreSQL Setup Script
# This script helps you set up PostgreSQL for the PNP TV application

echo "=== PNP TV PostgreSQL Setup ==="
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ]; then
    echo "Error: Please run this script from the project root directory"
    exit 1
fi

# Step 1: Check for PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL is not installed. Please install it first."
    echo ""
    echo "On Ubuntu/Debian:"
    echo "  sudo apt update"
    echo "  sudo apt install postgresql postgresql-contrib"
    echo ""
    echo "Or use Docker:"
    echo "  docker run --name pnptv-postgres -e POSTGRES_USER=pnptv -e POSTGRES_PASSWORD=your_password -e POSTGRES_DB=pnptv -p 5432:5432 -d postgres:latest"
    echo ""
    exit 1
fi

# Step 2: Create .env file
if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env file..."
    cat > backend/.env << EOF
PORT=4000
DATABASE_URL="postgresql://pnptv:your_secure_password@localhost:5432/pnptv?schema=public"
JWT_SECRET="your_very_secure_jwt_secret_at_least_32_characters_long"
TELEGRAM_BOT_TOKEN="your_telegram_bot_token"
AGORA_APP_ID="your_agora_app_id"
AGORA_APP_CERTIFICATE="your_agora_certificate"
CORS_ORIGIN="http://localhost:5173"
EOF
    echo "Created backend/.env - please edit this file with your actual credentials"
else
    echo "backend/.env already exists"
fi

# Step 3: Install backend dependencies
echo ""
echo "Installing backend dependencies..."
cd backend
npm install

# Step 4: Run Prisma migrations
echo ""
echo "Running Prisma migrations..."
npx prisma migrate dev --name init

# Step 5: Start the backend
echo ""
echo "Starting the backend..."
echo "The backend will be available at http://localhost:4000"
echo ""
echo "To start the backend manually later, run:"
echo "  cd backend && npm run dev"

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your actual credentials"
echo "2. Start the frontend: cd frontend && npm install && npm run dev"
echo "3. The application should now be using PostgreSQL!"
