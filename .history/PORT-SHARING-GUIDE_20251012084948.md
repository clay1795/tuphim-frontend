# 🚀 Hướng dẫn Chia sẻ Port TupPhim qua VS Code

## 📋 Trạng thái hiện tại
- ✅ **Frontend**: http://localhost:5173 (Vite)
- ✅ **Backend**: http://localhost:3001 (Node.js)
- ✅ **API Health**: Đang hoạt động bình thường

## 🎯 3 Cách chia sẻ port:

### 1. VS Code Port Forwarding (Khuyến nghị)

**Bước 1:** Mở Port Panel
- Nhấn `Ctrl+Shift+P`
- Gõ "Ports: Focus on Ports View"
- Hoặc click tab "PORTS" ở cuối VS Code

**Bước 2:** Thêm ports
- Click "Add Port"
- Thêm `5173` (Frontend)
- Thêm `3001` (Backend)

**Bước 3:** Chia sẻ public
- Right-click port `5173` → "Port Visibility: Public"
- Right-click port `3001` → "Port Visibility: Public"

**Kết quả:** VS Code tạo URLs dạng:
- Frontend: `https://xxxxx-5173.preview.app.github.dev`
- Backend: `https://xxxxx-3001.preview.app.github.dev`

### 2. Sử dụng script có sẵn

```bash
# Chia sẻ cả 2 ports
node share-port.js both

# Chỉ chia sẻ frontend
node share-port.js frontend

# Chỉ chia sẻ backend  
node share-port.js backend
```

### 3. Sử dụng script mới

```bash
# Khởi động cả 2 servers và chia sẻ ports
node start-with-sharing.js
```

## 🔧 Khởi động thủ công

**Terminal 1 (Backend):**
```bash
cd backend
npm start
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

## ✅ Kiểm tra tính năng

1. **Frontend**: Truy cập http://localhost:5173
2. **Backend API**: http://localhost:3001/api/health
3. **Tính năng chính:**
   - ✅ Hiển thị danh sách phim
   - ✅ Tìm kiếm phim
   - ✅ Xem chi tiết phim
   - ✅ Đăng nhập/đăng ký
   - ✅ Quản lý tài khoản
   - ✅ Đồng bộ dữ liệu từ KKPhim

## 🎬 Đảm bảo hiển thị đầy đủ phim

**Kiểm tra sync dữ liệu:**
```bash
cd backend
node complete-movie-sync.js
```

**Kiểm tra số lượng phim:**
```bash
cd backend
node check-movie-count.js
```

## 🔗 URLs sau khi chia sẻ

Sau khi chia sẻ port, bạn sẽ có URLs công khai:
- **Frontend**: `https://[random-id]-5173.preview.app.github.dev`
- **Backend**: `https://[random-id]-3001.preview.app.github.dev`

**Lưu ý:** Backend URL cần được cập nhật trong frontend config nếu sử dụng URLs khác nhau.

## 🛠️ Troubleshooting

**Nếu frontend không kết nối được backend:**
1. Kiểm tra backend có chạy không: `netstat -ano | findstr :3001`
2. Kiểm tra API health: `curl http://localhost:3001/api/health`
3. Restart cả 2 servers

**Nếu không thấy phim:**
1. Chạy sync: `node backend/complete-movie-sync.js`
2. Kiểm tra database connection
3. Xem logs: `tail -f backend/logs/all.log`

## 📱 Truy cập từ thiết bị khác

Sau khi chia sẻ port, bạn có thể:
- Mở URLs trên điện thoại, tablet
- Chia sẻ với bạn bè
- Test trên các thiết bị khác nhau
- Đảm bảo tất cả tính năng hoạt động

---
**🎉 Chúc bạn chia sẻ thành công!**
