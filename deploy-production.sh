#!/bin/bash

# PNP TV Production Deployment Script
# This script helps deploy the application to production

echo "=== PNP TV Production Deployment ==="
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "Error: Please run this script from the project root directory"
    exit 1
fi

# Step 1: Install dependencies
echo "Step 1/6: Installing dependencies..."
cd frontend
npm install --production
cd ../backend
npm install --production

# Step 2: Build frontend
echo ""
echo "Step 2/6: Building frontend..."
cd ../frontend
npm run build

# Step 3: Set up production environment
echo ""
echo "Step 3/6: Setting up production environment..."
cd ../backend
if [ ! -f ".env.production" ]; then
    cp .env.production.example .env.production 2>/dev/null || cp .env .env.production
    echo "Created .env.production - please edit with your production credentials"
else
    echo ".env.production already exists"
fi

# Step 4: Set up PostgreSQL (if not already set up)
echo ""
echo "Step 4/6: Checking PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL is not installed. Please install it first."
    echo "On Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"
else
    echo "PostgreSQL is installed"
    # Check if database exists
    if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw pnptv_production; then
        echo "Production database already exists"
    else
        echo "Creating production database..."
        sudo -u postgres createdb pnptv_production
        sudo -u postgres createuser pnptv
        sudo -u postgres psql -c "ALTER USER pnptv WITH PASSWORD 'your_secure_password';"
        sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE pnptv_production TO pnptv;"
    fi
fi

# Step 5: Run database migrations
echo ""
echo "Step 5/6: Running database migrations..."
npx prisma migrate deploy

# Step 6: Update PM2 configuration for production
echo ""
echo "Step 6/6: Updating PM2 configuration..."
cd ..

# Create production ecosystem config
cat > ecosystem.production.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'pnptv-frontend-production',
      script: 'serve',
      args: '-s frontend/dist -l 3000',
      cwd: './',
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
      script: 'npm',
      args: 'run dev',
      cwd: './backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      }
    }
  ]
};
EOF

echo ""
echo "=== Deployment Preparation Complete! ==="
echo ""
echo "Next steps:"
echo "1. Edit backend/.env.production with your actual production credentials"
echo "2. Set up your production domain and SSL certificates"
echo "3. Configure Nginx for your production domain"
echo "4. Run: pm2 start ecosystem.production.config.js"
echo "5. Run: pm2 save && pm2 startup"
echo "6. Test your production deployment"
echo ""
echo "For complete production setup, see PRODUCTION_DEPLOYMENT.md"
