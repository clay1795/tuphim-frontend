#!/bin/bash

echo "🚀 Starting Production Deployment..."

# 1. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 2. Build frontend
echo "🏗️ Building frontend..."
npm run build

# 3. Migrate to MongoDB
echo "🗄️ Migrating to MongoDB..."
cd backend
node scripts/migrateToMongoDB.js
cd ..

# 4. Test build
echo "🧪 Testing build..."
npm run test:build

# 5. Deploy to Vercel (Frontend)
echo "🌐 Deploying frontend to Vercel..."
npx vercel --prod

# 6. Deploy to Railway (Backend)
echo "🚂 Deploying backend to Railway..."
railway deploy

echo "✅ Production deployment completed!"

# 7. Health check
echo "🏥 Running health checks..."
curl -f https://your-app.vercel.app/api/health || exit 1
curl -f https://your-backend.railway.app/api/health || exit 1

echo "🎉 All systems are healthy!"
