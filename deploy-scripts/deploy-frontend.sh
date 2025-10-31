#!/bin/bash

# TupPhim Frontend Deployment Script for Vercel
# https://vercel.com/luong-chien-hieps-projects/tuphim-frontend

echo "🚀 Starting TupPhim Frontend Deployment..."

# Check if we're in the project root
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "⚠️ Warning: .env.production not found. Creating from template..."
    cp env.production.example .env.production
    echo "📝 Please update .env.production with your production values"
fi

# Run linting
echo "🔍 Running linting..."
npm run lint || echo "⚠️ Linting failed, but continuing with deployment..."

# Build for production
echo "🔨 Building for production..."
npm run build

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist directory not found. Build failed."
    exit 1
fi

# Check build size
echo "📊 Build size:"
du -sh dist/

# Test build locally
echo "🧪 Testing build locally..."
npm run preview &
PREVIEW_PID=$!
sleep 5

# Test if preview is running
if curl -f http://localhost:4173 > /dev/null 2>&1; then
    echo "✅ Build test successful"
else
    echo "❌ Build test failed"
fi

# Kill preview process
kill $PREVIEW_PID 2>/dev/null

echo "✅ Frontend deployment preparation complete!"
echo "📋 Next steps:"
echo "1. Push code to GitHub: git add . && git commit -m 'Deploy frontend' && git push"
echo "2. Go to Vercel Dashboard: https://vercel.com/luong-chien-hieps-projects/tuphim-frontend"
echo "3. Trigger deployment or wait for auto-deploy"
echo "4. Check deployment logs"
echo "5. Test website: https://www.tuphim.online"
