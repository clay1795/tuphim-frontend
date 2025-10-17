# 🌐 VS Code Port Forwarding - Full-Stack TupPhim

## 🎯 Mục tiêu: Share cả Frontend và Backend qua VS Code

### **Ưu điểm VS Code Port Forwarding:**
- ✅ **Tích hợp sẵn** - Không cần cài thêm gì
- ✅ **Share nhiều ports** - Cả frontend và backend
- ✅ **Dashboard tích hợp** - Quản lý dễ dàng
- ✅ **URL cố định** - Không thay đổi khi restart
- ✅ **HTTPS tự động** - Bảo mật

## 🚀 Cách thực hiện:

### **Bước 1: Mở VS Code Port Forwarding**

1. **Click vào tab "Ports"** ở bottom panel của VS Code
2. **Hoặc nhấn `Ctrl + Shift + P`** và gõ: `Ports: Focus on Ports View`

### **Bước 2: Forward Frontend Port (5173)**

1. **Click "Forward a Port"** button
2. **Nhập port:** `5173`
3. **Nhấn Enter**
4. **Chọn "Public"** để share với internet
5. **Copy public URL** được tạo (dạng: `https://xxx-5173.app.github.dev`)

### **Bước 3: Forward Backend Port (3001)**

1. **Click "Forward a Port"** button lần nữa
2. **Nhập port:** `3001`
3. **Nhấn Enter**
4. **Chọn "Public"** để share với internet
5. **Copy public URL** được tạo (dạng: `https://yyy-3001.app.github.dev`)

### **Bước 4: Cấu hình Frontend sử dụng Backend URL**

#### **Option A: Sửa trực tiếp trong code**

1. **Mở file:** `src/services/movieApi.js`
2. **Tìm dòng:** `const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';`
3. **Thay thành:** `const BASE_URL = 'https://yyy-3001.app.github.dev';` (Backend URL)

#### **Option B: Sử dụng Environment Variable**

1. **Tạo file:** `.env.local`
2. **Thêm dòng:**
   ```
   VITE_API_BASE_URL=https://yyy-3001.app.github.dev
   ```

#### **Option C: Dynamic API URL (Khuyến nghị)**

1. **Mở file:** `src/services/dynamicApi.js`
2. **Cập nhật hàm `getApiBaseUrl()`:**
   ```javascript
   const getApiBaseUrl = () => {
     // Nếu đang chạy trên VS Code Port Forwarding domain
     if (window.location.hostname.includes('app.github.dev') || 
         window.location.hostname.includes('githubpreview.dev') ||
         window.location.hostname.includes('github.dev')) {
       
       // Sử dụng Backend URL từ VS Code Port Forwarding
       // TODO: Thay YOUR_BACKEND_VSCODE_URL bằng URL thực tế
       return 'https://YOUR_BACKEND_VSCODE_URL.app.github.dev';
     }
     
     // Nếu chạy local, sử dụng proxy
     return '/api';
   };
   ```

### **Bước 5: Restart Frontend**
```bash
# Dừng frontend hiện tại (Ctrl+C)
npm run dev
```

## 📱 Test Full-Stack:

### **Bước 1: Test Frontend**
1. **Mở Frontend URL** trên điện thoại: `https://xxx-5173.app.github.dev`
2. **Kiểm tra** trang web load bình thường

### **Bước 2: Test Backend API**
1. **Mở Backend URL** trong trình duyệt: `https://yyy-3001.app.github.dev`
2. **Kiểm tra** API response (sẽ hiển thị JSON)

### **Bước 3: Test Kết nối**
1. **Mở Frontend URL** trên điện thoại
2. **Thử các tính năng:**
   - ✅ Đăng nhập/Đăng ký
   - ✅ Tìm kiếm phim
   - ✅ Xem chi tiết phim
   - ✅ User profile

## 🔧 Troubleshooting

### **Lỗi "code-tunnel.exe ENOENT":**

#### **Giải pháp 1: Restart VS Code**
1. **Đóng VS Code hoàn toàn**
2. **Mở lại VS Code**
3. **Thử forward port lại**

#### **Giải pháp 2: Cài đặt lại VS Code**
1. **Uninstall VS Code**
2. **Download và cài đặt lại** từ https://code.visualstudio.com/
3. **Restore settings và extensions**

#### **Giải pháp 3: Sử dụng Live Share**
1. **Cài extension "Live Share"**
2. **Click "Start Collaboration Session"**
3. **Share link với bạn bè**

### **Lỗi CORS:**
- ✅ **Đã sửa** - Backend đã cấu hình chấp nhận VS Code domains
- ✅ **Restart backend** nếu cần: `cd backend && npm start`

### **API không hoạt động:**
- ✅ **Kiểm tra Backend URL** - Đảm bảo đúng URL
- ✅ **Kiểm tra network** - Mở DevTools trên điện thoại
- ✅ **Test API trực tiếp** - Mở Backend URL trong trình duyệt

## 🎯 Cấu hình nâng cao

### **Port Forwarding Settings:**

1. **Nhấn `Ctrl + Shift + P`**
2. **Gõ:** `Preferences: Open Settings (JSON)`
3. **Thêm cấu hình:**

```json
{
  "remote.autoForwardPorts": true,
  "remote.autoForwardPortsSource": "hybrid",
  "remote.restoreForwardedPorts": true,
  "remote.portForwardingOnConnect": true
}
```

### **Custom Domain (Pro):**
- VS Code Port Forwarding hỗ trợ custom domain
- Cần GitHub Pro hoặc tài khoản trả phí

## 📊 So sánh VS Code vs ngrok

| Tính năng | VS Code Port Forwarding | ngrok |
|-----------|------------------------|-------|
| **Cài đặt** | ✅ Tích hợp sẵn | ❌ Cần cài riêng |
| **Đăng ký** | ✅ Không cần | ❌ Cần tài khoản |
| **Nhiều ports** | ✅ Dễ dàng | ❌ Phức tạp |
| **Dashboard** | ✅ Tích hợp | ✅ Riêng biệt |
| **URL cố định** | ✅ Không đổi | ❌ Thay đổi |
| **HTTPS** | ✅ Tự động | ✅ Tự động |

## 🎉 Kết quả mong đợi

Sau khi setup:
- ✅ **Frontend URL** - Người dùng truy cập ứng dụng
- ✅ **Backend URL** - API hoạt động đầy đủ
- ✅ **Kết nối đầy đủ** - Frontend gọi API từ Backend URL
- ✅ **Share với bạn bè** - Họ có thể sử dụng đầy đủ

## 💡 Tips

1. **Bookmark URLs** - Lưu lại để sử dụng sau
2. **Monitor Ports panel** - Theo dõi qua Ports panel
3. **Stop khi không dùng** - Tiết kiệm tài nguyên
4. **Backup cấu hình** - Export settings

**🎯 Bây giờ hãy thử VS Code Port Forwarding nhé!** 🚀
