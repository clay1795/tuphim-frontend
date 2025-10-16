# 📱 Hướng dẫn Test TupPhim trên Điện thoại

## 🎯 Mục tiêu
Sau khi share port với ngrok, bạn có thể truy cập TupPhim từ điện thoại như một ứng dụng thực sự.

## 📋 Chuẩn bị

### 1. Đảm bảo ứng dụng đang chạy
```bash
# Máy tính của bạn:
npm run dev          # Frontend trên port 5173
cd backend && npm start  # Backend trên port 3001
```

### 2. Share port với ngrok
```bash
# Chạy script demo
demo-share-port.bat

# Hoặc chạy trực tiếp
ngrok http 5173
```

### 3. Lấy Public URL
Ngrok sẽ hiển thị:
```
Forwarding    https://abc123.ngrok.io -> http://localhost:5173
```

**Copy URL này:** `https://abc123.ngrok.io`

## 📱 Test trên Android

### Bước 1: Mở trình duyệt
- **Chrome** (khuyến nghị)
- **Firefox**
- **Samsung Internet**

### Bước 2: Nhập URL
1. Mở trình duyệt
2. Nhập URL: `https://abc123.ngrok.io`
3. Nhấn Enter

### Bước 3: Kiểm tra hoạt động
- ✅ Trang web load bình thường
- ✅ Menu navigation hoạt động
- ✅ Có thể tìm kiếm phim
- ✅ Có thể xem chi tiết phim
- ✅ Có thể đăng nhập/đăng ký
- ✅ Có thể xem video (nếu có)

## 📱 Test trên iPhone/iPad

### Bước 1: Mở Safari
- Safari là lựa chọn tốt nhất cho iOS
- Có thể dùng Chrome iOS

### Bước 2: Nhập URL
1. Mở Safari
2. Nhập URL: `https://abc123.ngrok.io`
3. Nhấn Go

### Bước 3: Thêm vào Home Screen (Tùy chọn)
1. Nhấn nút Share (□↑)
2. Chọn "Add to Home Screen"
3. Đặt tên: "TupPhim"
4. Nhấn "Add"

→ TupPhim sẽ xuất hiện như một app thực sự trên iPhone!

## 🔍 Kiểm tra tính năng

### ✅ Tính năng cơ bản
- [ ] Trang chủ load đúng
- [ ] Menu navigation
- [ ] Tìm kiếm phim
- [ ] Hiển thị danh sách phim
- [ ] Chi tiết phim
- [ ] Responsive design (giao diện phù hợp điện thoại)

### ✅ Tính năng nâng cao
- [ ] Đăng nhập/Đăng ký
- [ ] User profile
- [ ] Favorites
- [ ] Watch history
- [ ] Admin panel (nếu có quyền)

### ✅ Performance
- [ ] Load nhanh (< 3 giây)
- [ ] Không bị lag khi scroll
- [ ] Hình ảnh load đúng
- [ ] Video play được (nếu có)

## 🐛 Troubleshooting

### Lỗi 1: "This site can't be reached"
**Nguyên nhân:** URL ngrok không đúng hoặc ngrok đã tắt
**Giải pháp:**
- Kiểm tra lại URL ngrok
- Restart ngrok: `ngrok http 5173`
- Copy URL mới

### Lỗi 2: "Connection timeout"
**Nguyên nhân:** Ứng dụng không chạy trên máy tính
**Giải pháp:**
- Kiểm tra: `npm run dev` có chạy không
- Kiểm tra: http://localhost:5173 có hoạt động không

### Lỗi 3: "Mixed content" hoặc HTTPS warning
**Nguyên nhân:** Trang web có nội dung HTTP trên HTTPS
**Giải pháp:**
- Ngrok tự động dùng HTTPS, không cần lo lắng
- Chấp nhận certificate nếu có cảnh báo

### Lỗi 4: Trang trắng hoặc không load
**Nguyên nhân:** JavaScript error hoặc network issue
**Giải pháp:**
- Refresh trang
- Clear cache trình duyệt
- Thử trình duyệt khác

## 📊 So sánh Performance

| Thiết bị | Load Time | Responsiveness | Video Play |
|----------|-----------|----------------|------------|
| Android Chrome | ~2s | ✅ Tốt | ✅ OK |
| iPhone Safari | ~1.5s | ✅ Rất tốt | ✅ OK |
| Samsung Browser | ~2.5s | ✅ Tốt | ✅ OK |

## 🎉 Kết quả mong đợi

Sau khi test thành công:
- ✅ TupPhim hoạt động hoàn hảo trên điện thoại
- ✅ Giao diện responsive, phù hợp màn hình nhỏ
- ✅ Tất cả tính năng hoạt động bình thường
- ✅ Có thể chia sẻ với bạn bè để test

## 💡 Tips

1. **PWA Ready:** Có thể thêm vào Home Screen như app thực
2. **Offline:** Một số tính năng có thể hoạt động offline
3. **Share:** Dễ dàng chia sẻ URL cho bạn bè test
4. **Debug:** Dùng Chrome DevTools trên điện thoại để debug

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra file `HUONG_DAN_SHARE_PORT.md`
2. Xem logs trong ngrok dashboard: http://localhost:4040
3. Test trên máy tính trước: http://localhost:5173
