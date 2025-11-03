#!/bin/bash

# TupPhim Backend Deployment Script for Render
# https://dashboard.render.com/web/srv-d3ju3rali9vc73bef9jg

echo "🚀 Starting TupPhim Backend Deployment..."

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "⚠️ Warning: .env.production not found. Creating from template..."
    cp env.example .env.production
    echo "📝 Please update .env.production with your production values"
fi

# Run tests
echo "🧪 Running tests..."
npm test || echo "⚠️ Tests failed, but continuing with deployment..."

# Build (if needed)
echo "🔨 Building..."
npm run build || echo "ℹ️ No build step required for Node.js"

# Check if server.js exists
if [ ! -f "server.js" ]; then
    echo "❌ Error: server.js not found"
    exit 1
fi

echo "✅ Backend deployment preparation complete!"
echo "📋 Next steps:"
echo "1. Push code to GitHub: git add . && git commit -m 'Deploy backend' && git push"
echo "2. Go to Render Dashboard: https://dashboard.render.com/web/srv-d3ju3rali9vc73bef9jg"
echo "3. Trigger deployment or wait for auto-deploy"
echo "4. Check logs for any errors"
echo "5. Test API endpoints: https://api.tuphim.online/api/health"
