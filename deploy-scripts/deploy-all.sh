#!/bin/bash

# TupPhim Complete Deployment Script
# This script deploys both frontend and backend

echo "🚀 Starting Complete TupPhim Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
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

# Check if we're in the project root
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Starting deployment process..."

# Step 1: Deploy Backend
print_status "Step 1: Deploying Backend to Render..."
cd backend
if [ -f "deploy-backend.sh" ]; then
    chmod +x deploy-backend.sh
    ./deploy-backend.sh
else
    print_warning "Backend deployment script not found, using manual steps"
    npm install
    npm run build || echo "No build step required"
fi
cd ..

# Step 2: Deploy Frontend
print_status "Step 2: Deploying Frontend to Vercel..."
if [ -f "deploy-scripts/deploy-frontend.sh" ]; then
    chmod +x deploy-scripts/deploy-frontend.sh
    ./deploy-scripts/deploy-frontend.sh
else
    print_warning "Frontend deployment script not found, using manual steps"
    npm install
    npm run build
fi

# Step 3: Test Connections
print_status "Step 3: Testing Production Connections..."
if [ -f "test-production-connection.js" ]; then
    node test-production-connection.js
else
    print_warning "Connection test script not found"
fi

# Step 4: Final Verification
print_status "Step 4: Final Verification..."

# Check if all required files exist
required_files=(
    "vercel.json"
    "backend/render.yaml"
    "env.production"
    "backend/env.production"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "✓ $file exists"
    else
        print_error "✗ $file missing"
    fi
done

print_success "Deployment process complete!"
print_status "Next steps:"
echo "1. Push all changes to GitHub"
echo "2. Monitor deployment on Vercel and Render dashboards"
echo "3. Test the live website: https://www.tuphim.online"
echo "4. Test the API: https://api.tuphim.online/api/health"
echo "5. Check logs for any errors"

print_status "Deployment URLs:"
echo "Frontend: https://www.tuphim.online"
echo "Backend: https://api.tuphim.online"
echo "Vercel Dashboard: https://vercel.com/luong-chien-hieps-projects/tuphim-frontend"
echo "Render Dashboard: https://dashboard.render.com/web/srv-d3ju3rali9vc73bef9jg"
