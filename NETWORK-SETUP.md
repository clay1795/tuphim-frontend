# 🌐 Hướng dẫn Share Port và Chạy Dự án TupPhim

## 📋 Tổng quan
Hướng dẫn này sẽ giúp bạn cấu hình và chạy dự án TupPhim để có thể truy cập từ cả PC và mobile qua VS Code Port Forwarding.

## 🚀 Cài đặt nhanh

### 1. Cài đặt dependencies
```bash
# Cài đặt tất cả dependencies
npm run install:all

# Hoặc cài đặt riêng lẻ
npm install
cd backend && npm install
```

### 2. Khởi động dự án
```bash
# Cách 1: Sử dụng script tự động (Khuyến nghị)
npm run start:dev

# Cách 2: Chạy đồng thời frontend và backend
npm run start:network

# Cách 3: Chạy riêng lẻ
npm run start:backend  # Terminal 1
npm run start:frontend # Terminal 2
```

## 🔧 Cấu hình VS Code Port Forwarding

### 1. Mở Command Palette
- Nhấn `Ctrl+Shift+P` (Windows/Linux) hoặc `Cmd+Shift+P` (Mac)
- Gõ "Ports: Forward a Port"

### 2. Forward các port cần thiết
- **Port 5173**: Frontend (Vite dev server)
- **Port 3001**: Backend (Node.js API server)

### 3. Cấu hình Port Forwarding
```json
// .vscode/settings.json đã được cấu hình sẵn
{
  "liveServer.settings.port": 5173,
  "liveServer.settings.host": "0.0.0.0",
  "liveServer.settings.useLocalIp": true
}
```

## 📱 Truy cập từ Mobile

### 1. Kết nối mạng
- Đảm bảo PC và mobile cùng kết nối WiFi
- Tìm IP address của PC:
  ```bash
  # Windows
  ipconfig
  
  # Mac/Linux
  ifconfig
  ```

### 2. Truy cập từ mobile
- Mở trình duyệt trên mobile
- Truy cập: `http://[IP_PC]:5173`
- Ví dụ: `http://192.168.1.100:5173`

### 3. VS Code Port Forwarding URL
- Khi forward port, VS Code sẽ tạo URL dạng:
  - `https://[random].preview.app.github.dev`
  - `https://[random].app.github.dev`
- Sử dụng URL này để truy cập từ bất kỳ đâu

## 🛠️ Cấu hình Network

### 1. Backend Server (port 3001)
```javascript
// backend/server.js
app.listen(PORT, '0.0.0.0', () => {
  // Server lắng nghe trên tất cả network interfaces
});
```

### 2. Frontend Server (port 5173)
```javascript
// vite.config.js
server: {
  host: '0.0.0.0', // Cho phép kết nối từ bên ngoài
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true
    }
  }
}
```

### 3. CORS Configuration
```javascript
// backend/server.js - Đã được cấu hình sẵn
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      // VS Code Port Forwarding domains
      origin?.includes('.ngrok.io') ||
      origin?.includes('.preview.app.github.dev') ||
      origin?.includes('.app.github.dev')
    ];
    // ...
  }
};
```

## 🔍 Troubleshooting

### 1. Không thể truy cập từ mobile
**Nguyên nhân**: Firewall chặn kết nối
**Giải pháp**:
```bash
# Windows - Mở port trong Windows Firewall
netsh advfirewall firewall add rule name="Node.js" dir=in action=allow protocol=TCP localport=3001
netsh advfirewall firewall add rule name="Vite" dir=in action=allow protocol=TCP localport=5173

# Mac - Tắt firewall tạm thời
sudo pfctl -d
```

### 2. CORS Error
**Nguyên nhân**: Backend không cho phép origin từ mobile
**Giải pháp**: Kiểm tra cấu hình CORS trong `backend/server.js`

### 3. API không hoạt động
**Nguyên nhân**: Proxy không hoạt động đúng
**Giải pháp**: Kiểm tra cấu hình proxy trong `vite.config.js`

### 4. Database connection error
**Nguyên nhân**: MongoDB URI không đúng
**Giải pháp**: Kiểm tra file `.env` trong thư mục `backend`

## 📊 Kiểm tra trạng thái

### 1. Health Check
```bash
# Kiểm tra backend
curl http://localhost:3001/api/health

# Kiểm tra frontend
curl http://localhost:5173
```

### 2. Network Test
```bash
# Test từ mobile browser
http://[PC_IP]:5173/api/health
```

## 🎯 Scripts hữu ích

```bash
# Khởi động full stack với network access
npm run start:dev

# Chỉ khởi động backend
npm run start:backend

# Chỉ khởi động frontend với network access
npm run start:frontend

# Build production
npm run build

# Test build
npm run test:build
```

## 📱 Mobile Optimization

### 1. Responsive Design
- Grid layout tự động điều chỉnh theo màn hình
- Touch-friendly buttons và navigation
- Optimized images cho mobile

### 2. Performance
- Lazy loading cho images
- Code splitting
- Service worker (PWA ready)

### 3. Network Optimization
- Compressed responses
- Caching strategies
- Offline support

## 🔐 Security Notes

1. **Development Only**: Cấu hình này chỉ dành cho development
2. **Production**: Sử dụng HTTPS và proper CORS cho production
3. **Environment Variables**: Không commit file `.env` lên git
4. **API Keys**: Sử dụng environment variables cho sensitive data

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy kiểm tra:
1. Console logs trong browser
2. Network tab trong DevTools
3. Backend logs trong terminal
4. Firewall settings
5. Network connectivity

---
**Chúc bạn phát triển dự án thành công! 🎉**

