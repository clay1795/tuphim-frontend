# Hướng Dẫn Test Tính Năng Nhóm Phim Series

## 🚀 Cách Test Nhanh

### 1. Test Với Dữ Liệu Mẫu (Khuyến nghị)
```
Truy cập: http://localhost:5173/simple-series-test
```

**Tính năng:**
- ✅ Dữ liệu mẫu sẵn có (không cần API)
- ✅ Hiển thị 12 phim mẫu với 5 series
- ✅ Nút chuyển đổi hiển thị có/nhóm series
- ✅ Console log chi tiết quá trình nhóm phim

**Dữ liệu mẫu:**
- One Punch Man (3 phần)
- Attack on Titan (4 phần) 
- Demon Slayer (2 phần)
- Jujutsu Kaisen (2 phần)
- Naruto Movie (1 phim lẻ)

### 2. Test Với API Thực (Nếu API hoạt động)
```
Truy cập: http://localhost:5173/test-series-grouping
```

**Tính năng:**
- 🔄 Load phim từ API thực
- 🔄 Fallback sang dữ liệu mẫu nếu API lỗi
- 🔄 Thử nhiều API endpoints khác nhau

## 🎯 Kết Quả Mong Đợi

### Khi Bật Nhóm Phim:
```
Trước: 12 phim riêng lẻ
Sau:   5 phim đại diện (mỗi series 1 phim)
Giảm:  7 phim trùng lặp
```

### Giao Diện:
- **Badge "X Phần"** trên poster phim series
- **Thông tin series** trong tên phim
- **Nút chuyển đổi** để so sánh có/nhóm

## 🔍 Debug & Phân Tích

### 1. Mở Console (F12)
Click nút **"Phân tích phim (Console)"** để xem:
```
=== SIMPLE SERIES TEST ANALYSIS ===
Total movies: 12
Grouped movies: 5
Series analysis:
- one punch man: 3 parts
- attack on titan: 4 parts  
- demon slayer: 2 parts
- jujutsu kaisen: 2 parts
- naruto: 1 parts
```

### 2. Log Chi Tiết
Console sẽ hiển thị:
- Quá trình tạo series key
- Số phần được trích xuất
- Cách sắp xếp và chọn phim đại diện

## 🎬 Test Trên Trang Chủ

Sau khi test xong, tính năng sẽ tự động hoạt động trên:
- ✅ Trang chủ (Top Movies, Movie Sections)
- ✅ Trang duyệt phim
- ✅ Trang tìm kiếm
- ✅ Trang chi tiết phim (hiển thị các phần)

## 🛠️ Troubleshooting

### Nếu Không Thấy Phim:
1. Kiểm tra Console (F12) có lỗi gì không
2. Thử route `/simple-series-test` trước
3. Kiểm tra backend có chạy không (port 3001)

### Nếu Logic Nhóm Không Đúng:
1. Click "Phân tích phim" để xem console log
2. Kiểm tra series key được tạo
3. Xem số phần được trích xuất

## 📱 Responsive Design

Tính năng hoạt động tốt trên:
- 📱 Mobile (2-3 cột)
- 💻 Tablet (4-5 cột) 
- 🖥️ Desktop (6-8 cột)

## 🎨 UI/UX Features

- **Smooth transitions** khi hover
- **Badge thông tin** rõ ràng
- **Loading states** khi chuyển đổi
- **Error handling** graceful
- **Accessibility** friendly

---

**💡 Tip:** Bắt đầu với `/simple-series-test` để hiểu cách hoạt động, sau đó test với API thực!

