# 🚀 Hướng dẫn Setup ngrok hoàn chỉnh cho TupPhim

## 🎯 Mục tiêu: Sử dụng ngrok miễn phí để share port

### **Bước 1: Đăng ký tài khoản ngrok MIỄN PHÍ**

1. **Mở trình duyệt** và truy cập: https://dashboard.ngrok.com/signup
2. **Đăng ký bằng email** (hoàn toàn miễn phí)
3. **Xác thực email** nếu được yêu cầu
4. **Đăng nhập** vào dashboard

### **Bước 2: Lấy authtoken**

1. **Truy cập:** https://dashboard.ngrok.com/get-started/your-authtoken
2. **Copy authtoken** (dạng: `2abc123def456ghi789jkl_1mn2op3qr4st5uv6wx7yz`)
3. **Lưu lại** để sử dụng

### **Bước 3: Cấu hình ngrok**

```bash
# Cấu hình authtoken
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE

# Ví dụ:
ngrok config add-authtoken 2abc123def456ghi789jkl_1mn2op3qr4st5uv6wx7yz
```

### **Bước 4: Khởi động ngrok**

```bash
# Share frontend port
ngrok http 5173

# Hoặc share backend port
ngrok http 3001
```

### **Bước 5: Lấy public URL**

Ngrok sẽ hiển thị:
```
Session Status                online
Account                       your-email@domain.com (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok.io -> http://localhost:5173
Forwarding                    http://abc123.ngrok.io -> http://localhost:5173
```

**Copy URL:** `https://abc123.ngrok.io`

## 📱 Sử dụng trên điện thoại

1. **Mở trình duyệt** trên điện thoại
2. **Nhập URL:** `https://abc123.ngrok.io`
3. **TupPhim sẽ hiển thị** như app thực sự

## 🔧 Troubleshooting

### Lỗi "authentication failed":
- ✅ Kiểm tra authtoken đã nhập đúng chưa
- ✅ Chạy lại: `ngrok config add-authtoken YOUR_TOKEN`

### Lỗi "tunnel not found":
- ✅ Đảm bảo ứng dụng đang chạy: `npm run dev`
- ✅ Kiểm tra port 5173 có hoạt động không

### URL không truy cập được:
- ✅ Kiểm tra firewall Windows
- ✅ Thử trình duyệt khác
- ✅ Kiểm tra internet connection

## 💡 Tips sử dụng ngrok

### **Tài khoản miễn phí:**
- ✅ **1 tunnel đồng thời** - Đủ dùng
- ✅ **40 connections/phút** - Đủ cho test
- ✅ **Không giới hạn bandwidth** - Hoàn toàn miễn phí

### **Tài khoản Pro (tùy chọn):**
- 💰 **$8/tháng** - Nhiều tính năng hơn
- ✅ **Nhiều tunnels** đồng thời
- ✅ **Custom domains** - URL cố định
- ✅ **More connections** - Không giới hạn

## 🎉 Kết quả cuối cùng

Sau khi setup xong:
- ✅ **Có tài khoản ngrok miễn phí**
- ✅ **Có public URL** để share
- ✅ **Truy cập được từ điện thoại**
- ✅ **Tất cả tính năng** hoạt động bình thường

## 🚀 Script tự động

Tôi đã tạo script `setup-ngrok-hoan-chinh.bat` để bạn chỉ cần:
1. **Chạy script**
2. **Làm theo hướng dẫn**
3. **Nhập authtoken**
4. **Ngrok sẽ tự động chạy**

**Chỉ cần 5 phút là xong!** 🎯

