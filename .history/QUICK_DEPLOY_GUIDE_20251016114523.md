# 🚀 TupPhim Quick Deploy Guide

## ⚡ Deploy trong 5 phút!

### 🎯 URLs sau khi deploy
- **Website**: https://www.tuphim.online
- **API**: https://api.tuphim.online
- **Vercel**: https://vercel.com/luong-chien-hieps-projects/tuphim-frontend
- **Render**: https://dashboard.render.com/web/srv-d3ju3rali9vc73bef9jg

## 🔥 Bước 1: Deploy Backend (Render)

### 1.1 Chuẩn bị Backend
```bash
cd backend
npm install
```

### 1.2 Cấu hình Environment Variables trên Render
Truy cập: https://dashboard.render.com/web/srv-d3ju3rali9vc73bef9jg

**Thêm các biến môi trường:**
```
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tuphim_production
JWT_SECRET=tuphim-super-secret-jwt-key-production-2024
FRONTEND_URL=https://www.tuphim.online
ALLOWED_ORIGINS=https://www.tuphim.online,https://tuphim.online,https://tuphim-frontend.vercel.app
```

### 1.3 Deploy Backend
```bash
git add .
git commit -m "Deploy backend to production"
git push origin main
```

## 🎨 Bước 2: Deploy Frontend (Vercel)

### 2.1 Chuẩn bị Frontend
```bash
cd ..
npm install
npm run build
```

### 2.2 Cấu hình Environment Variables trên Vercel
Truy cập: https://vercel.com/luong-chien-hieps-projects/tuphim-frontend

**Thêm các biến môi trường:**
```
VITE_API_BASE_URL=https://api.tuphim.online
VITE_APP_TITLE=TupPhim - Website Xem Phim Trực Tuyến
VITE_APP_ENV=production
VITE_DEBUG=false
VITE_APP_URL=https://www.tuphim.online
```

### 2.3 Deploy Frontend
```bash
git add .
git commit -m "Deploy frontend to production"
git push origin main
```

## ✅ Bước 3: Kiểm tra

### 3.1 Test Backend
```bash
curl https://api.tuphim.online/api/health
```

### 3.2 Test Frontend
Mở trình duyệt: https://www.tuphim.online

### 3.3 Test Kết nối
```bash
node test-production-connection.js
```

## 🛠️ Troubleshooting

### Lỗi CORS
- Kiểm tra `ALLOWED_ORIGINS` trong Render
- Đảm bảo frontend URL được thêm vào

### Lỗi API
- Kiểm tra `VITE_API_BASE_URL` trong Vercel
- Đảm bảo backend đã deploy thành công

### Lỗi Database
- Kiểm tra `MONGODB_URI` trong Render
- Đảm bảo MongoDB Atlas cho phép kết nối từ Render

## 🎉 Hoàn thành!

Nếu tất cả test đều pass, website của bạn đã sẵn sàng tại:
**https://www.tuphim.online**

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra logs trên Vercel/Render
2. Verify environment variables
3. Test API endpoints
4. Check database connection
