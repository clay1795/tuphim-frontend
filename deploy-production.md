# 🚀 TupPhim Production Deployment Guide

## 📋 Tổng quan Deployment

### Frontend: Vercel
- **URL**: https://www.tuphim.online
- **Repository**: https://github.com/clay1795/tuphim-frontend
- **Vercel Dashboard**: https://vercel.com/luong-chien-hieps-projects/tuphim-frontend

### Backend: Render
- **URL**: https://api.tuphim.online
- **Repository**: https://github.com/clay1795/tuphim-backend
- **Render Dashboard**: https://dashboard.render.com/web/srv-d3ju3rali9vc73bef9jg

## 🔧 Cấu hình Environment Variables

### Frontend (Vercel)
```bash
VITE_API_BASE_URL=https://api.tuphim.online
VITE_APP_TITLE=TupPhim - Website Xem Phim Trực Tuyến
VITE_APP_ENV=production
VITE_DEBUG=false
VITE_APP_URL=https://www.tuphim.online
VITE_BACKEND_URL=https://api.tuphim.online
```

### Backend (Render)
```bash
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tuphim_production
JWT_SECRET=tuphim-super-secret-jwt-key-production-2024
FRONTEND_URL=https://www.tuphim.online
ALLOWED_ORIGINS=https://www.tuphim.online,https://tuphim.online,https://tuphim-frontend.vercel.app
```

## 🗄️ Database Configuration

### MongoDB Atlas
1. Tạo cluster mới cho production
2. Cấu hình whitelist IP (0.0.0.0/0 cho Render)
3. Tạo user database với quyền read/write
4. Lấy connection string và cập nhật vào Render

## 🚀 Deployment Steps

### 1. Backend Deployment (Render)
```bash
# 1. Push code lên GitHub
git add .
git commit -m "Production deployment setup"
git push origin main

# 2. Cấu hình trên Render Dashboard
# - Connect GitHub repository
# - Set build command: npm install
# - Set start command: npm start
# - Add environment variables
# - Deploy
```

### 2. Frontend Deployment (Vercel)
```bash
# 1. Push code lên GitHub
git add .
git commit -m "Production frontend deployment"
git push origin main

# 2. Cấu hình trên Vercel Dashboard
# - Import project from GitHub
# - Set build command: npm run build
# - Set output directory: dist
# - Add environment variables
# - Deploy
```

## 🔍 Testing & Verification

### 1. Health Check
```bash
# Backend health
curl https://api.tuphim.online/api/health

# Frontend
curl https://www.tuphim.online
```

### 2. API Connection Test
```bash
# Test API endpoints
curl https://api.tuphim.online/api/movies
curl https://api.tuphim.online/api/auth/health
```

### 3. Database Connection
- Kiểm tra logs trên Render
- Verify MongoDB connection trong health check
- Test CRUD operations

## 🛡️ Security Checklist

- [x] HTTPS enabled
- [x] CORS configured
- [x] Rate limiting enabled
- [x] Helmet security headers
- [x] JWT secret secured
- [x] Environment variables protected
- [x] Database credentials secured

## 📊 Monitoring

### Vercel Analytics
- Page views
- Performance metrics
- Error tracking

### Render Monitoring
- Server uptime
- Response times
- Error logs
- Resource usage

## 🔄 CI/CD Pipeline

### Automatic Deployment
- **Frontend**: Auto-deploy khi push vào main branch
- **Backend**: Auto-deploy khi push vào main branch

### Manual Deployment
```bash
# Frontend
vercel --prod

# Backend
# Deploy through Render dashboard
```

## 🚨 Troubleshooting

### Common Issues
1. **CORS errors**: Check ALLOWED_ORIGINS
2. **API connection failed**: Verify VITE_API_BASE_URL
3. **Database connection**: Check MONGODB_URI
4. **Build failures**: Check logs và dependencies

### Debug Commands
```bash
# Check environment variables
echo $VITE_API_BASE_URL

# Test API locally
curl http://localhost:3001/api/health

# Check build
npm run build
npm run preview
```

## 📈 Performance Optimization

### Frontend
- Code splitting enabled
- Lazy loading enabled
- Asset optimization
- CDN caching

### Backend
- Compression enabled
- Rate limiting
- Caching layer
- Database indexing

## 🔐 Security Best Practices

1. **Environment Variables**: Never commit secrets
2. **HTTPS Only**: Force HTTPS redirects
3. **CORS**: Restrict origins
4. **Rate Limiting**: Prevent abuse
5. **Input Validation**: Sanitize all inputs
6. **Error Handling**: Don't expose sensitive info

## 📞 Support

Nếu gặp vấn đề:
1. Check logs trên Vercel/Render
2. Verify environment variables
3. Test API endpoints
4. Check database connection
5. Review security settings
