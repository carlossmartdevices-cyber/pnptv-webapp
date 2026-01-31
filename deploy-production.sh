#!/bin/bash

# PNP TV Production Deployment Script
# Deploys to pnptv.app with SSL and domain routing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$(id -u)" -ne 0 ]; then
    print_error "This script must be run as root. Please use sudo."
    exit 1
fi

# Check if we're in the correct directory
if [ ! -f "docker-compose.production.yml" ]; then
    print_error "docker-compose.production.yml not found. Please run this script from the project root directory."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_info "Docker not found. Installing Docker..."
    
    # Install Docker
    apt-get update
    apt-get install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg \
        lsb-release
    
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io
    
    print_success "Docker installed successfully"
else
    print_info "Docker is already installed"
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_info "Docker Compose not found. Installing Docker Compose..."
    
    # Install Docker Compose
    COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep '"tag_name"' | cut -d'"' -f4)
    curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    print_success "Docker Compose installed successfully"
else
    print_info "Docker Compose is already installed"
fi

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    print_info "Creating .env file from .env.docker"
    cp .env.docker .env
    print_warning "Please edit the .env file to set secure passwords and secrets before proceeding."
    print_warning "At minimum, change JWT_SECRET, POSTGRES_PASSWORD, and set your email for SSL."
    exit 0
fi

# Check if .env file has secure values
if grep -q "your_very_secure_jwt_secret" .env; then
    print_warning "Using default JWT_SECRET. This is insecure for production!"
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Please edit the .env file and set a secure JWT_SECRET (at least 32 characters)"
        exit 1
    fi
fi

if grep -q "pnptv_password" .env; then
    print_warning "Using default POSTGRES_PASSWORD. This is insecure for production!"
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Please edit the .env file and set a secure POSTGRES_PASSWORD"
        exit 1
    fi
fi

# Check if email is set for SSL
if ! grep -q "support@pnptv.app" .env; then
    print_warning "Please set your email in the .env file for SSL certificate registration"
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Please edit the .env file and set your email for SSL certificates"
        exit 1
    fi
fi

# Build Docker images
print_info "Building Docker images..."
docker-compose -f docker-compose.production.yml build
print_success "Docker images built successfully"

# Start containers (without nginx-proxy and certbot initially)
print_info "Starting database and application containers..."
docker-compose -f docker-compose.production.yml up -d postgres backend frontend
print_success "Application containers started successfully"

# Wait for services to be ready
print_info "Waiting for services to initialize..."
sleep 15

# Start temporary nginx for certbot challenge
print_info "Starting temporary nginx for SSL certificate challenge..."
docker run --rm -d \
  --name temp-nginx \
  -p 80:80 \
  -v /var/www/certbot:/var/www/certbot \
  -v ./temp-nginx.conf:/etc/nginx/conf.d/default.conf \
  nginx:alpine

# Create temporary nginx config for certbot
cat > temp-nginx.conf << EOF
server {
    listen 80;
    server_name pnptv.app www.pnptv.app;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://\$host\$request_uri;
    }
}
EOF

# Wait for temporary nginx to be ready
sleep 5

# Run certbot to get SSL certificates
print_info "Requesting SSL certificates from Let's Encrypt..."
docker run --rm \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v /var/www/certbot:/var/www/certbot \
  certbot/certbot certonly --webroot --webroot-path=/var/www/certbot \
  --email support@pnptv.app --agree-tos --no-eff-email \
  -d pnptv.app -d www.pnptv.app

print_success "SSL certificates obtained successfully"

# Stop temporary nginx
print_info "Stopping temporary nginx..."
docker stop temp-nginx
rm temp-nginx.conf

# Start full production stack
print_info "Starting full production stack with SSL..."
docker-compose -f docker-compose.production.yml up -d
print_success "Production stack started successfully"

# Wait for all services to be ready
print_info "Waiting for all services to initialize..."
sleep 10

# Check container status
print_info "Checking container status..."
docker-compose -f docker-compose.production.yml ps

# Show access information
print_success "\n🎉 Production deployment complete!"
print_success "\nYour application is now accessible at:"
echo -e "${BLUE}🌐 Main Site:${NC} https://pnptv.app"
echo -e "${BLUE}🎭 Hangouts:${NC} https://pnptv.app/hangouts"
echo -e "${BLUE}🎥 Videorama:${NC} https://pnptv.app/videorama"
echo -e "${BLUE}🔌 API:${NC} https://pnptv.app/api"

print_info "\nTo view logs: docker-compose -f docker-compose.production.yml logs -f"
print_info "To stop services: docker-compose -f docker-compose.production.yml down"
print_info "To restart: docker-compose -f docker-compose.production.yml restart"

# Check if we need to run database migrations
read -p "\nDo you want to run database migrations? (y/n) " -n 1 -r
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "\nRunning database migrations..."
    docker-compose -f docker-compose.production.yml exec backend npx prisma migrate dev --name init
    print_success "Database migrations completed"
fi

print_success "\n🚀 Deployment complete! Your PNP TV application is now live at https://pnptv.app"
