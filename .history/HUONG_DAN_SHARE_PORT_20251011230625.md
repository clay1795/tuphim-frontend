# 🌐 Hướng dẫn Share Port TupPhim từ A-Z

## 📋 Chuẩn bị

### 1. Kiểm tra ứng dụng đang chạy
```bash
# Terminal 1: Chạy Frontend
npm run dev
# Sẽ hiển thị: Local: http://localhost:5173

# Terminal 2: Chạy Backend  
cd backend
npm start
# Sẽ hiển thị: Server running on port 3001
```

### 2. Kiểm tra ngrok
```bash
ngrok version
# Nếu báo lỗi: npm install -g ngrok@latest
```

## 🚀 Cách 1: Sử dụng Script đơn giản (Khuyến nghị)

### Chia sẻ Frontend (Port 5173)
```bash
# Chạy file .bat
test-ngrok.bat

# Hoặc chạy trực tiếp
ngrok http 5173
```

### Chia sẻ Backend (Port 3001)  
```bash
ngrok http 3001
```

## 📱 Cách 2: Hướng dẫn chi tiết

### Bước 1: Chạy ngrok
1. Mở Command Prompt hoặc PowerShell
2. Chạy lệnh: `ngrok http 5173`
3. Ngrok sẽ hiển thị:

```
Session Status                online
Account                       (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok.io -> http://localhost:5173
Forwarding                    http://abc123.ngrok.io -> http://localhost:5173

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

### Bước 2: Lấy Public URL
- **Public URL:** `https://abc123.ngrok.io` (thay abc123 bằng URL thực tế)
- **Web Interface:** http://127.0.0.1:4040 (để xem thống kê)

### Bước 3: Chia sẻ
1. Copy URL: `https://abc123.ngrok.io`
2. Gửi cho bạn bè qua Zalo, Facebook, email...
3. Họ mở URL trên điện thoại/máy tính bất kỳ

## 🎯 Test trên điện thoại

### Android/iPhone:
1. Mở trình duyệt (Chrome, Safari)
2. Nhập URL: `https://abc123.ngrok.io`
3. Ứng dụng TupPhim sẽ hiển thị như bình thường
4. Có thể xem phim, đăng nhập, tất cả tính năng hoạt động

## 🔧 Troubleshooting

### Lỗi 1: "ngrok command not found"
```bash
# Cài đặt lại ngrok
npm install -g ngrok@latest

# Hoặc cài từ trang chủ
# https://ngrok.com/download
```

### Lỗi 2: "tunnel not found"
- Đảm bảo ứng dụng đang chạy trên port đúng
- Kiểm tra: http://localhost:5173 có hoạt động không

### Lỗi 3: "Connection refused"
- Kiểm tra firewall Windows
- Thử restart ứng dụng

## 📊 Dashboard ngrok

Truy cập: http://localhost:4040 để xem:
- Thống kê requests
- Logs chi tiết  
- Quản lý tunnels

## 💡 Tips

1. **URL thay đổi:** Mỗi lần restart ngrok, URL sẽ thay đổi (trừ khi có tài khoản Pro)

2. **Bảo mật:** URL ngrok công khai, chỉ share với người tin tưởng

3. **Performance:** Có thể chậm hơn localhost một chút do đi qua server ngrok

4. **Giới hạn:** Tài khoản free có giới hạn bandwidth và connections

## 🎉 Kết quả

Sau khi làm theo hướng dẫn:
- ✅ Có public URL hoạt động trên internet
- ✅ Bạn bè có thể truy cập từ điện thoại
- ✅ Tất cả tính năng ứng dụng hoạt động bình thường
- ✅ Không cần cài đặt gì thêm trên thiết bị khác
