# 🚀 HƯỚNG DẪN DEPLOY THỦ CÔNG TU PHIM WEBSITE

## 📋 **TỔNG QUAN**

Hướng dẫn này sẽ giúp bạn deploy website TupPhim lên production mà không cần cài đặt Git hay CLI tools.

**Thời gian**: 15-20 phút  
**Độ khó**: Dễ  
**Yêu cầu**: Tài khoản GitHub, Vercel, Render

---

## 🎯 **BƯỚC 1: CHUẨN BỊ REPOSITORY**

### **1.1 Tạo Repository trên GitHub**

1. **Truy cập**: https://github.com/new
2. **Tạo repository mới**:
   - Repository name: `tuphim-frontend`
   - Description: `TupPhim Frontend - React Movie Website`
   - Public: ✅ (để Vercel có thể truy cập)
   - Add README: ❌
   - Add .gitignore: ❌
3. **Click "Create repository"**

### **1.2 Upload Frontend Code**

1. **Trên trang repository mới**, click **"uploading an existing file"**
2. **Drag & drop** toàn bộ thư mục `tuphim2` (trừ folder `backend`)
3. **Commit message**: `Initial frontend upload`
4. **Click "Commit changes"**

### **1.3 Tạo Repository Backend**

1. **Tạo repository mới**: `tuphim-backend`
2. **Upload** chỉ thư mục `backend`
3. **Commit**: `Initial backend upload`

---

## 🎨 **BƯỚC 2: DEPLOY FRONTEND LÊN VERCEL**

### **2.1 Đăng nhập Vercel**

1. **Truy cập**: https://vercel.com/dashboard
2. **Sign in with GitHub** (sử dụng tài khoản GitHub đã tạo repository)
3. **Authorize Vercel** khi được yêu cầu

### **2.2 Import Project**

1. **Click "New Project"** (nút lớn màu đen)
2. **Import Git Repository**:
   - Chọn `tuphim-frontend` từ danh sách
   - Click **"Import"**

### **2.3 Cấu hình Build Settings**

1. **Project Name**: `tuphim-frontend` (hoặc tên bạn muốn)
2. **Framework Preset**: `Vite` (tự động detect)
3. **Root Directory**: `./` (để trống)
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. **Install Command**: `npm install`

### **2.4 Environment Variables**

1. **Click "Environment Variables"**
2. **Add các biến**:
   ```
   VITE_API_BASE_URL = https://tuphim-backend.onrender.com
   VITE_APP_TITLE = TupPhim - Website Xem Phim Trực Tuyến
   VITE_APP_ENV = production
   VITE_DEBUG = false
   VITE_APP_URL = https://tuphim.vercel.app
   ```

### **2.5 Deploy**

1. **Click "Deploy"**
2. **Chờ build** (2-3 phút)
3. **Lưu lại URL**: `https://tuphim-frontend-xxx.vercel.app`

---

## ⚙️ **BƯỚC 3: DEPLOY BACKEND LÊN RENDER**

### **3.1 Đăng nhập Render**

1. **Truy cập**: https://render.com/dashboard
2. **Sign up/Sign in** với GitHub
3. **Authorize Render** khi được yêu cầu

### **3.2 Tạo Web Service**

1. **Click "New +"** → **"Web Service"**
2. **Connect Repository**: Chọn `tuphim-backend`
3. **Click "Connect"**

### **3.3 Cấu hình Backend**

1. **Name**: `tuphim-backend`
2. **Runtime**: `Node`
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. **Instance Type**: `Free` (hoặc Starter nếu có)

### **3.4 Environment Variables**

1. **Click "Environment"**
2. **Add các biến**:
   ```
   # Server Configuration
   NODE_ENV = production
   PORT = 10000
   
   # Database
   MONGODB_URI = mongodb+srv://claydev:Wh3nxgmqs6Lq5bI9@cluster0-claydev.itpluqe.mongodb.net/tuphim_users?retryWrites=true&w=majority&appName=Cluster0-ClayDev
   
   # JWT Security
   JWT_SECRET = tuphim-super-secret-jwt-key-2024-production-ready-claydev
   JWT_EXPIRES_IN = 7d
   
   # KKPhim API
   KKPHIM_API_BASE = https://phimapi.com
   KKPHIM_IMG_BASE = https://phimimg.com
   KKPHIM_PLAYER_BASE = https://player.phimapi.com/player/?url=
   
   # Email Configuration (ĐÃ CÓ SẴN)
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

### **3.5 Deploy Backend**

1. **Click "Create Web Service"**
2. **Chờ deploy** (5-10 phút)
3. **Lưu lại URL**: `https://tuphim-backend.onrender.com`

---

## 🔗 **BƯỚC 4: CẬP NHẬT CẤU HÌNH**

### **4.1 Cập nhật Frontend URL trong Backend**

1. **Quay lại GitHub repository** `tuphim-backend`
2. **Edit file** `backend/server.js` hoặc config file
3. **Thêm CORS** cho domain Vercel:
   ```javascript
   app.use(cors({
     origin: ['https://tuphim-frontend-xxx.vercel.app'],
     credentials: true
   }));
   ```
4. **Commit changes**

### **4.2 Redeploy Backend**

1. **Quay lại Render Dashboard**
2. **Click "Manual Deploy"** → **"Deploy latest commit"**
3. **Chờ deploy hoàn thành**

---

## 🧪 **BƯỚC 5: TEST PRODUCTION**

### **5.1 Test Backend**

1. **Mở browser**: `https://tuphim-backend.onrender.com/api/health`
2. **Kiểm tra response**:
   ```json
   {
     "status": "healthy",
     "message": "TupPhim Backend API is running",
     "timestamp": "2025-10-17T...",
     "environment": "production"
   }
   ```

### **5.2 Test Frontend**

1. **Mở browser**: `https://tuphim-frontend-xxx.vercel.app`
2. **Kiểm tra**:
   - ✅ Website load được
   - ✅ Không có lỗi console
   - ✅ API calls hoạt động
   - ✅ Movie data hiển thị

### **5.3 Test Full Integration**

1. **Thử các chức năng**:
   - Xem danh sách phim
   - Tìm kiếm phim
   - Xem chi tiết phim
   - Đăng nhập/đăng ký (nếu có)

---

## 🔧 **BƯỚC 6: CUSTOM DOMAIN (TÙY CHỌN)**

### **6.1 Mua Domain**

1. **Mua domain** từ nhà cung cấp (Namecheap, GoDaddy, etc.)
2. **Lấy thông tin DNS**

### **6.2 Cấu hình Vercel**

1. **Vercel Dashboard** → **Project** → **Settings** → **Domains**
2. **Add domain**: `tuphim.online`
3. **Configure DNS** theo hướng dẫn Vercel
4. **Chờ propagation** (24-48h)

### **6.3 Cấu hình Render**

1. **Render Dashboard** → **Web Service** → **Settings**
2. **Custom Domain**: `api.tuphim.online`
3. **Configure DNS** theo hướng dẫn Render

---

## 📊 **BƯỚC 7: MONITORING & MAINTENANCE**

### **7.1 Vercel Monitoring**

1. **Analytics**: Xem traffic, performance
2. **Functions**: Monitor serverless functions
3. **Deployments**: Lịch sử deploy

### **7.2 Render Monitoring**

1. **Metrics**: CPU, Memory, Response time
2. **Logs**: Xem logs realtime
3. **Health**: Status checks

### **7.3 Backup Strategy**

1. **Database**: MongoDB Atlas auto backup
2. **Code**: GitHub repository
3. **Environment**: Lưu env variables

---

## 🚨 **TROUBLESHOOTING**

### **Lỗi Build Frontend**

```bash
# Kiểm tra package.json
npm run build

# Lỗi thường gặp:
- Missing dependencies
- Environment variables
- Build command sai
```

### **Lỗi Backend**

```bash
# Kiểm tra logs Render
- Port configuration
- Environment variables
- Database connection
```

### **Lỗi CORS**

```javascript
// Thêm vào backend
app.use(cors({
  origin: ['https://tuphim-frontend-xxx.vercel.app'],
  credentials: true
}));
```

---

## ✅ **CHECKLIST HOÀN THÀNH**

- [ ] ✅ GitHub repositories created
- [ ] ✅ Frontend deployed on Vercel
- [ ] ✅ Backend deployed on Render
- [ ] ✅ Environment variables configured
- [ ] ✅ CORS settings updated
- [ ] ✅ Health checks passed
- [ ] ✅ Full integration tested
- [ ] ✅ Custom domain configured (optional)
- [ ] ✅ Monitoring setup

---

## 🎉 **KẾT QUẢ CUỐI CÙNG**

**Frontend**: `https://tuphim-frontend-xxx.vercel.app`  
**Backend**: `https://tuphim-backend.onrender.com`  
**Custom Domain**: `https://tuphim.online` (nếu có)

**Website đã sẵn sàng phục vụ người dùng! 🚀**

---

## 📞 **HỖ TRỢ**

Nếu gặp vấn đề:
1. **Kiểm tra logs** trên Vercel/Render
2. **Test local** trước khi deploy
3. **Check environment variables**
4. **Verify database connection**

**Chúc bạn deploy thành công! 🎊**
