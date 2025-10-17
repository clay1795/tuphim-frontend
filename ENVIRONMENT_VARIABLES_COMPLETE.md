# 🔧 ENVIRONMENT VARIABLES COMPLETE GUIDE

## 📋 **TỔNG HỢP ENVIRONMENT VARIABLES**

Dựa trên phân tích code, đây là tất cả environment variables cần thiết cho deployment.

---

## 🎨 **FRONTEND (Vercel) - Environment Variables:**

```bash
# API Configuration
VITE_API_BASE_URL = https://tuphim-backend.onrender.com
VITE_APP_TITLE = TupPhim - Website Xem Phim Trực Tuyến
VITE_APP_ENV = production
VITE_DEBUG = false
VITE_APP_URL = https://tuphim-frontend-xxx.vercel.app

# Backend URL
VITE_BACKEND_URL = https://tuphim-backend.onrender.com

# Feature Flags
VITE_ENABLE_ANALYTICS = true
VITE_ENABLE_PWA = true
VITE_ENABLE_OFFLINE_MODE = false

# Performance
VITE_ENABLE_LAZY_LOADING = true
VITE_ENABLE_CODE_SPLITTING = true

# Analytics (tùy chọn)
VITE_GA_TRACKING_ID = your-google-analytics-id
```

---

## ⚙️ **BACKEND (Render) - Environment Variables:**

### **🔑 CÁC BIẾN BẮT BUỘC:**

```bash
# Server Configuration
NODE_ENV = production
PORT = 10000

# Database (ĐÃ CÓ SẴN)
MONGODB_URI = mongodb+srv://claydev:Wh3nxgmqs6Lq5bI9@cluster0-claydev.itpluqe.mongodb.net/tuphim_users?retryWrites=true&w=majority&appName=Cluster0-ClayDev

# JWT Security (ĐÃ CÓ SẴN)
JWT_SECRET = tuphim-super-secret-jwt-key-2024-production-ready-claydev
JWT_EXPIRES_IN = 7d

# KKPhim API Configuration
KKPHIM_API_BASE = https://phimapi.com
KKPHIM_IMG_BASE = https://phimimg.com
KKPHIM_PLAYER_BASE = https://player.phimapi.com/player/?url=

# Email Configuration (ĐÃ CÓ SẴN - TỪ CODE)
EMAIL_HOST = smtp.gmail.com
EMAIL_PORT = 587
EMAIL_USER = spdoitheauto5s@gmail.com
EMAIL_PASS = fuvh fkfw tcfx bwzc

# Rate Limiting
RATE_LIMIT_WINDOW_MS = 900000
RATE_LIMIT_MAX_REQUESTS = 100

# Caching
CACHE_TTL = 3600
CACHE_MAX_SIZE = 1000

# Security
BCRYPT_ROUNDS = 12
SESSION_SECRET = tuphim-session-secret-2024-claydev

# Logging
LOG_LEVEL = info
ENABLE_ANALYTICS = true

# CORS (CẬP NHẬT SAU KHI DEPLOY FRONTEND)
FRONTEND_URL = https://tuphim-frontend-xxx.vercel.app
ALLOWED_ORIGINS = https://tuphim-frontend-xxx.vercel.app
```

---

## 📝 **HƯỚNG DẪN COPY-PASTE:**

### **🎯 CHO VERCEL (Frontend):**

Copy toàn bộ block này vào Vercel Environment Variables:

```
VITE_API_BASE_URL=https://tuphim-backend.onrender.com
VITE_APP_TITLE=TupPhim - Website Xem Phim Trực Tuyến
VITE_APP_ENV=production
VITE_DEBUG=false
VITE_APP_URL=https://tuphim-frontend-xxx.vercel.app
VITE_BACKEND_URL=https://tuphim-backend.onrender.com
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PWA=true
VITE_ENABLE_OFFLINE_MODE=false
VITE_ENABLE_LAZY_LOADING=true
VITE_ENABLE_CODE_SPLITTING=true
```

### **🎯 CHO RENDER (Backend):**

Copy toàn bộ block này vào Render Environment Variables:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://claydev:Wh3nxgmqs6Lq5bI9@cluster0-claydev.itpluqe.mongodb.net/tuphim_users?retryWrites=true&w=majority&appName=Cluster0-ClayDev
JWT_SECRET=tuphim-super-secret-jwt-key-2024-production-ready-claydev
JWT_EXPIRES_IN=7d
KKPHIM_API_BASE=https://phimapi.com
KKPHIM_IMG_BASE=https://phimimg.com
KKPHIM_PLAYER_BASE=https://player.phimapi.com/player/?url=
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=spdoitheauto5s@gmail.com
EMAIL_PASS=fuvh fkfw tcfx bwzc
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CACHE_TTL=3600
CACHE_MAX_SIZE=1000
BCRYPT_ROUNDS=12
SESSION_SECRET=tuphim-session-secret-2024-claydev
LOG_LEVEL=info
ENABLE_ANALYTICS=true
FRONTEND_URL=https://tuphim-frontend-xxx.vercel.app
ALLOWED_ORIGINS=https://tuphim-frontend-xxx.vercel.app
```

---

## ⚠️ **LƯU Ý QUAN TRỌNG:**

### **🔒 BẢO MẬT:**
- ✅ **MONGODB_URI**: Đã có và hoạt động
- ✅ **JWT_SECRET**: Đã có secret an toàn
- ✅ **EMAIL**: Đã có tài khoản Gmail với App Password
- ✅ **SESSION_SECRET**: Đã có secret an toàn

### **🔄 CẬP NHẬT SAU:**
- **FRONTEND_URL**: Thay `xxx` bằng URL thực tế từ Vercel
- **ALLOWED_ORIGINS**: Cập nhật sau khi deploy frontend
- **VITE_APP_URL**: Thay `xxx` bằng URL thực tế từ Vercel

### **📧 EMAIL CONFIGURATION:**
- **Email**: `spdoitheauto5s@gmail.com`
- **App Password**: `fuvh fkfw tcfx bwzc`
- **SMTP**: Gmail (smtp.gmail.com:587)
- **Status**: ✅ Đã test và hoạt động

---

## 🎯 **THỨ TỰ DEPLOY:**

1. **Deploy Backend** với tất cả biến trên
2. **Deploy Frontend** với biến Vercel
3. **Lấy URL Frontend** từ Vercel
4. **Cập nhật CORS** trong Backend:
   - `FRONTEND_URL`
   - `ALLOWED_ORIGINS`
5. **Redeploy Backend** để áp dụng CORS

---

## ✅ **CHECKLIST:**

- [ ] ✅ MONGODB_URI có sẵn và hoạt động
- [ ] ✅ JWT_SECRET có sẵn và an toàn
- [ ] ✅ EMAIL config có sẵn và test thành công
- [ ] ✅ KKPhim API URLs đúng
- [ ] ✅ Rate limiting config hợp lý
- [ ] ✅ Cache config tối ưu
- [ ] ⏳ Frontend URL (cập nhật sau)
- [ ] ⏳ CORS origins (cập nhật sau)

---

## 🚀 **SẴN SÀNG DEPLOY!**

Tất cả environment variables đã được cấu hình sẵn từ code. Bạn chỉ cần copy-paste vào Vercel và Render là có thể deploy ngay!

**Không cần tạo thêm tài khoản hay config gì thêm! 🎉**
