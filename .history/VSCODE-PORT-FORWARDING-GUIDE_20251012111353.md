# Hướng Dẫn VS Code Port Forwarding cho TupPhim

## 📱 Tổng Quan
Hướng dẫn này sẽ giúp bạn chia sẻ dự án TupPhim qua VS Code Port Forwarding, cho phép truy cập từ mobile và các thiết bị khác mà không ảnh hưởng đến localhost hiện tại.

## 🚀 Cách Khởi Động

### Phương Pháp 1: Sử dụng PowerShell Script (Khuyến nghị)
```powershell
# Chạy script PowerShell
.\start-dev-with-port-forwarding.ps1
```

### Phương Pháp 2: Khởi động thủ công
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend  
npm run dev
```

### Phương Pháp 3: Sử dụng VS Code Launch Configuration
1. Mở VS Code
2. Nhấn `F5` hoặc vào `Run and Debug`
3. Chọn `Start Full Stack Dev` để khởi động cả frontend và backend

## 🔧 Cấu Hình VS Code Port Forwarding

### Bước 1: Mở Ports View
1. Nhấn `Ctrl+Shift+P` để mở Command Palette
2. Gõ `Ports: Focus on Ports View`
3. Hoặc nhấn `Ctrl+Shift+`` (backtick) và chọn tab "PORTS"

### Bước 2: Thêm Ports
1. Click vào `Forward a Port`
2. Thêm các ports sau:
   - **3001** - TupPhim Backend API
   - **5173** - TupPhim Frontend (Vite)

### Bước 3: Cấu hình Port Visibility
1. Click vào biểu tượng `Public` bên cạnh mỗi port
2. Chọn `Public` để cho phép truy cập từ mobile
3. Chọn `Private` nếu chỉ muốn truy cập từ máy tính

### Bước 4: Lấy URLs
1. Copy các URLs được tạo bởi VS Code
2. URLs sẽ có dạng:
   - Frontend: `https://xxx.vscode.dev:5173`
   - Backend: `https://xxx.vscode.dev:3001`

## 📱 Truy Cập Từ Mobile

### Cách 1: Sử dụng URLs từ VS Code
1. Mở trình duyệt mobile
2. Truy cập URL frontend từ VS Code
3. Website sẽ hoạt động đầy đủ tính năng

### Cách 2: Sử dụng QR Code
1. VS Code sẽ tự động tạo QR code
2. Quét QR code bằng camera mobile
3. Truy cập website

## 🎯 Tính Năng Được Hỗ Trợ

### ✅ Hoạt động đầy đủ:
- ✅ Xem danh sách phim từ MongoDB
- ✅ Tìm kiếm phim
- ✅ Xem chi tiết phim
- ✅ Đăng ký/Đăng nhập người dùng
- ✅ Thêm vào yêu thích
- ✅ Lịch sử xem phim
- ✅ Responsive design cho mobile
- ✅ Tất cả API endpoints

### 🔒 Bảo mật:
- ✅ CORS được cấu hình để hỗ trợ VS Code domains
- ✅ Rate limiting được áp dụng
- ✅ JWT authentication hoạt động bình thường
- ✅ MongoDB connection an toàn

## 🛠️ Troubleshooting

### Lỗi CORS
```
Error: Not allowed by CORS
```
**Giải pháp**: Kiểm tra xem origin có được thêm vào CORS config trong `backend/server.js`

### Lỗi Connection Refused
```
Connection refused
```
**Giải pháp**: 
1. Đảm bảo backend server đang chạy trên port 3001
2. Kiểm tra firewall settings
3. Đảm bảo server bind trên `0.0.0.0` thay vì `localhost`

### Lỗi Mobile không truy cập được
**Giải pháp**:
1. Đảm bảo port được set thành `Public` trong VS Code
2. Kiểm tra URL có đúng không
3. Thử refresh trang trên mobile

### Lỗi API không hoạt động
**Giải pháp**:
1. Kiểm tra backend server logs
2. Đảm bảo MongoDB connection hoạt động
3. Kiểm tra proxy configuration trong Vite

## 📊 Monitoring

### Kiểm tra trạng thái servers:
```bash
# Kiểm tra backend
curl http://localhost:3001/api/health

# Kiểm tra frontend
curl http://localhost:5173
```

### Logs:
- Backend logs: `backend/logs/`
- Frontend logs: Console trong browser DevTools

## 🔄 Cập Nhật Cấu Hình

### Thêm port mới:
1. Cập nhật `.vscode/settings.json`
2. Thêm port vào `remote.portForwarding.include`
3. Restart VS Code

### Thay đổi CORS:
1. Chỉnh sửa `backend/server.js`
2. Thêm domain mới vào `corsOptions.origin`
3. Restart backend server

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra logs trong terminal
2. Xem browser DevTools Console
3. Kiểm tra Network tab để xem API calls
4. Đảm bảo tất cả dependencies đã được cài đặt

## 🎉 Kết Quả

Sau khi setup thành công:
- ✅ Website hoạt động đầy đủ trên PC
- ✅ Website hoạt động đầy đủ trên mobile
- ✅ Không ảnh hưởng đến localhost hiện tại
- ✅ Database MongoDB hoạt động bình thường
- ✅ Tất cả tính năng user authentication
- ✅ Sync phim từ KKPhim API
