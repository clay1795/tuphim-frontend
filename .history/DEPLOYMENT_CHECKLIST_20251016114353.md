# ✅ TupPhim Production Deployment Checklist

## 🎯 Mục tiêu
Deploy hoàn hảo dự án TupPhim lên production với:
- Frontend: https://www.tuphim.online (Vercel)
- Backend: https://api.tuphim.online (Render)
- Database: MongoDB Atlas
- Đảm bảo tất cả chức năng hoạt động

## 📋 Pre-Deployment Checklist

### ✅ 1. Code Preparation
- [x] Environment variables configured
- [x] API URLs updated for production
- [x] CORS settings configured
- [x] Security headers enabled
- [x] Error handling implemented
- [x] Build scripts optimized

### ✅ 2. Backend Configuration (Render)
- [x] `backend/env.production` created
- [x] `backend/render.yaml` configured
- [x] `backend/package.json` updated
- [x] MongoDB connection string ready
- [x] JWT secret configured
- [x] CORS origins set

### ✅ 3. Frontend Configuration (Vercel)
- [x] `vercel.json` configured
- [x] `env.production` updated
- [x] Build optimization enabled
- [x] Asset caching configured
- [x] Security headers set

## 🚀 Deployment Steps

### Step 1: Backend Deployment (Render)
```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Test locally
npm start

# 4. Push to GitHub
git add .
git commit -m "Deploy backend to production"
git push origin main

# 5. Deploy on Render
# - Go to: https://dashboard.render.com/web/srv-d3ju3rali9vc73bef9jg
# - Connect GitHub repository
# - Set environment variables
# - Deploy
```

### Step 2: Frontend Deployment (Vercel)
```bash
# 1. Navigate to project root
cd ..

# 2. Install dependencies
npm install

# 3. Build for production
npm run build

# 4. Test build locally
npm run preview

# 5. Push to GitHub
git add .
git commit -m "Deploy frontend to production"
git push origin main

# 6. Deploy on Vercel
# - Go to: https://vercel.com/luong-chien-hieps-projects/tuphim-frontend
# - Import project
# - Set environment variables
# - Deploy
```

## 🔍 Post-Deployment Testing

### ✅ 1. Backend Tests
- [ ] Health check: `https://api.tuphim.online/api/health`
- [ ] Movies API: `https://api.tuphim.online/api/movies`
- [ ] Auth API: `https://api.tuphim.online/api/auth/health`
- [ ] Database connection verified
- [ ] CORS headers present

### ✅ 2. Frontend Tests
- [ ] Website loads: `https://www.tuphim.online`
- [ ] API calls working
- [ ] Search functionality
- [ ] Movie details page
- [ ] User authentication
- [ ] Responsive design

### ✅ 3. Integration Tests
- [ ] Frontend can connect to backend
- [ ] API responses are correct
- [ ] Error handling works
- [ ] Loading states work
- [ ] All features functional

## 🛡️ Security Verification

### ✅ 1. HTTPS
- [ ] Frontend uses HTTPS
- [ ] Backend uses HTTPS
- [ ] No mixed content warnings

### ✅ 2. CORS
- [ ] Only allowed origins can access API
- [ ] Preflight requests handled
- [ ] Credentials properly configured

### ✅ 3. Headers
- [ ] Security headers present
- [ ] XSS protection enabled
- [ ] Content type sniffing disabled
- [ ] Frame options set

## 📊 Performance Verification

### ✅ 1. Frontend Performance
- [ ] Page load time < 3 seconds
- [ ] First contentful paint < 1.5 seconds
- [ ] Images optimized
- [ ] Code splitting working
- [ ] Caching headers set

### ✅ 2. Backend Performance
- [ ] API response time < 500ms
- [ ] Database queries optimized
- [ ] Caching enabled
- [ ] Rate limiting working

## 🗄️ Database Verification

### ✅ 1. MongoDB Atlas
- [ ] Connection string correct
- [ ] Database accessible
- [ ] Collections created
- [ ] Indexes optimized
- [ ] Backup enabled

### ✅ 2. Data Integrity
- [ ] User data synced
- [ ] Movie data synced
- [ ] Comments working
- [ ] Favorites working

## 🚨 Troubleshooting

### Common Issues & Solutions

#### Backend Issues
- **CORS Error**: Check ALLOWED_ORIGINS in environment
- **Database Error**: Verify MONGODB_URI
- **Port Error**: Check PORT environment variable
- **Build Error**: Check package.json scripts

#### Frontend Issues
- **API Error**: Check VITE_API_BASE_URL
- **Build Error**: Check dependencies and scripts
- **Deploy Error**: Check vercel.json configuration
- **CORS Error**: Check backend CORS settings

#### Database Issues
- **Connection Error**: Check MongoDB Atlas whitelist
- **Auth Error**: Check database credentials
- **Timeout Error**: Check connection string

## 📞 Support Contacts

- **Vercel Support**: https://vercel.com/support
- **Render Support**: https://render.com/support
- **MongoDB Support**: https://support.mongodb.com

## 🎉 Success Criteria

Deployment is successful when:
- [ ] Website loads at https://www.tuphim.online
- [ ] API responds at https://api.tuphim.online
- [ ] All features work as expected
- [ ] No console errors
- [ ] Performance is acceptable
- [ ] Security is properly configured

## 📝 Notes

- Keep environment variables secure
- Monitor logs regularly
- Set up alerts for errors
- Plan for scaling if needed
- Document any custom configurations
