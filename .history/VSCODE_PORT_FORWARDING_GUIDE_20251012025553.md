# 🌐 Hướng dẫn VS Code Port Forwarding cho TupPhim

## 🎯 Mục tiêu: Share cả Frontend và Backend qua VS Code

### **Ưu điểm VS Code Port Forwarding:**
- ✅ **Tích hợp sẵn** - Không cần cài thêm gì
- ✅ **Share nhiều ports** - Cả frontend và backend
- ✅ **Dashboard tích hợp** - Quản lý dễ dàng
- ✅ **URL cố định** - Không thay đổi khi restart

## 🚀 Cách sử dụng VS Code Port Forwarding

### **Bước 1: Mở Port Forwarding Panel**

1. **Click vào tab "Ports"** ở bottom panel của VS Code
2. **Hoặc nhấn `Ctrl + Shift + P`** và gõ: `Ports: Focus on Ports View`

### **Bước 2: Forward Frontend Port (5173)**

1. **Click "Forward a Port"** button
2. **Nhập port:** `5173`
3. **Nhấn Enter**
4. **Chọn "Public"** để share với internet
5. **Copy public URL** được tạo

### **Bước 3: Forward Backend Port (3001)**

1. **Click "Forward a Port"** button lần nữa
2. **Nhập port:** `3001`
3. **Nhấn Enter**
4. **Chọn "Public"** để share với internet
5. **Copy public URL** được tạo

### **Bước 4: Share URLs**

Bây giờ bạn có 2 public URLs:
- **Frontend:** `https://abc123-5173.preview.app.github.dev`
- **Backend:** `https://def456-3001.preview.app.github.dev`

## 📱 Sử dụng trên điện thoại

### **Option 1: Chỉ Frontend**
- Mở URL frontend trên điện thoại
- TupPhim sẽ hiển thị như app thực sự

### **Option 2: Frontend + Backend API**
- Mở URL frontend trên điện thoại
- Backend API sẽ hoạt động qua URL backend

## 🔧 Troubleshooting

### **Lỗi "code-tunnel.exe ENOENT":**

#### **Giải pháp 1: Restart VS Code**
1. **Đóng VS Code hoàn toàn**
2. **Mở lại VS Code**
3. **Thử forward port lại**

#### **Giải pháp 2: Cài đặt lại VS Code**
1. **Uninstall VS Code**
2. **Download và cài đặt lại**
3. **Restore settings và extensions**

#### **Giải pháp 3: Sử dụng Live Share**
1. **Cài extension "Live Share"**
2. **Click "Start Collaboration Session"**
3. **Share link với bạn bè**

### **Lỗi "Port already in use":**
```bash
# Kiểm tra port đang sử dụng
netstat -an | findstr :5173
netstat -an | findstr :3001

# Dừng process nếu cần
taskkill /f /im node.exe
```

## 🎯 Cấu hình nâng cao

### **Port Forwarding Settings:**

1. **Nhấn `Ctrl + Shift + P`**
2. **Gõ:** `Preferences: Open Settings (JSON)`
3. **Thêm cấu hình:**

```json
{
  "remote.autoForwardPorts": true,
  "remote.autoForwardPortsSource": "hybrid",
  "remote.restoreForwardedPorts": true
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

## 🎉 Kết quả mong đợi

Sau khi setup:
- ✅ **Có 2 public URLs** - Frontend và Backend
- ✅ **Share với bạn bè** qua VS Code
- ✅ **Truy cập từ điện thoại** dễ dàng
- ✅ **Quản lý tập trung** trong VS Code

## 💡 Tips

1. **Bookmark URLs** - Lưu lại để sử dụng sau
2. **Monitor usage** - Theo dõi qua Ports panel
3. **Stop khi không dùng** - Tiết kiệm tài nguyên
4. **Backup cấu hình** - Export settings

**🎯 Bây giờ hãy thử VS Code Port Forwarding nhé!** 🚀
