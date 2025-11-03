# Tính Năng Nhóm Phim Theo Series

## Tổng Quan
Tính năng này cho phép nhóm các phim cùng series và chỉ hiển thị 1 phim đại diện trong danh sách chính, giúp giao diện gọn gàng hơn và tránh trùng lặp. Khi vào chi tiết phim, người dùng sẽ thấy tất cả các phần của series.

## Các File Đã Tạo/Cập Nhật

### 1. Service Nhóm Phim
**File:** `src/services/movieGroupingService.js`
- **Chức năng:** Logic chính để nhóm phim theo series
- **Tính năng:**
  - Tạo series key từ tên phim (loại bỏ số phần, năm, chất lượng)
  - Trích xuất số phần từ tên phim
  - Nhóm phim và chọn phim đại diện (phần mới nhất hoặc cao nhất)
  - Phân tích và xử lý tên phim

### 2. Component Hiển Thị Phim Series
**File:** `src/components/SeriesMovieCard.jsx`
- **Chức năng:** Hiển thị phim với thông tin về series
- **Tính năng:**
  - Badge hiển thị số phần trong series
  - Hiển thị phần hiện tại
  - Giao diện tương tự SeparatedMovieCard nhưng có thông tin series

### 3. Component Hiển Thị Các Phần Series
**File:** `src/components/SeriesPartsSection.jsx`
- **Chức năng:** Hiển thị tất cả các phần của series trong trang chi tiết
- **Tính năng:**
  - Grid layout hiển thị các phần
  - Thông tin chi tiết từng phần (năm, chất lượng, tập phim)
  - Highlight phần đang xem
  - Link đến từng phần

### 4. Component Test
**File:** `src/components/TestSeriesGrouping.jsx`
- **Chức năng:** Test và so sánh hiển thị phim có/nhóm series
- **Truy cập:** `/test-series-grouping`

## Các File Đã Cập Nhật

### 1. MovieGrid.jsx
- Thêm prop `groupBySeries` (mặc định: true)
- Sử dụng `movieGroupingService.groupMoviesBySeries()`
- Hiển thị thông tin số lượng phim trước/sau nhóm

### 2. MovieSection.jsx
- Thêm prop `groupBySeries` (mặc định: true)
- Logic nhóm phim tương tự MovieGrid

### 3. MovieDetail.jsx
- Thêm state `seriesParts`
- Logic tìm các phần của series khi load phim
- Hiển thị `SeriesPartsSection` nếu có nhiều phần

### 4. TopMoviesSection.jsx
- Thêm prop `groupBySeries` (mặc định: true)
- Sử dụng SeriesMovieCard cho phim series

### 5. MovieSectionsWithAPI.jsx
- Bật `groupBySeries={true}` cho tất cả sections

### 6. App.jsx
- Thêm route `/test-series-grouping` để test tính năng

## Logic Nhóm Phim

### Cách Tạo Series Key
```javascript
// Ví dụ: "One Punch Man - Phần 3 HD Vietsub"
// → "one punch man"

// Loại bỏ:
// - "Phần X", "Season X", "Mùa X"
// - Năm phát hành
// - Chất lượng (HD, FHD, 4K, etc.)
// - Ngôn ngữ (Vietsub, Thuyết minh, etc.)
// - Dấu - hoặc :
```

### Cách Trích Xuất Số Phần
```javascript
// Tìm pattern: "Phần X", "Part X", "Season X"
// Hoặc số ở cuối tên (nếu <= 10 để tránh nhầm với năm)
```

### Cách Chọn Phim Đại Diện
1. Sắp xếp theo số phần (cao nhất trước)
2. Nếu cùng phần, sắp xếp theo năm (mới nhất trước)
3. Chọn phim đầu tiên làm đại diện

## Ví Dụ Hoạt Động

### Trước Khi Áp Dụng
```
One Punch Man - Phần 1 HD
One Punch Man - Phần 2 HD  
One Punch Man - Phần 3 HD
Attack on Titan - Phần 1
Attack on Titan - Phần 2
```

### Sau Khi Áp Dụng
```
One Punch Man (3 Phần) ← Hiển thị phần 3 (mới nhất)
Attack on Titan (2 Phần) ← Hiển thị phần 2 (mới nhất)
```

### Trong Chi Tiết Phim
Khi click vào "One Punch Man", sẽ hiển thị:
- Thông tin phim (phần 3)
- Danh sách các phần khác (Phần 1, 2, 3)
- Có thể click vào từng phần để xem chi tiết

## Cách Sử Dụng

### Bật/Tắt Tính Năng
```jsx
// Bật nhóm phim (mặc định)
<MovieGrid movies={movies} groupBySeries={true} />

// Tắt nhóm phim
<MovieGrid movies={movies} groupBySeries={false} />
```

### Test Tính Năng
1. Truy cập `/test-series-grouping`
2. Xem so sánh hiển thị có/nhóm series
3. Click "Phân tích phim" để xem thông tin chi tiết trong console

## Lợi Ích

1. **Giao diện gọn gàng:** Giảm trùng lặp, dễ tìm phim
2. **Trải nghiệm tốt hơn:** Người dùng không bị overwhelm bởi nhiều phần cùng series
3. **Tính năng đầy đủ:** Vẫn có thể xem tất cả các phần trong chi tiết
4. **Linh hoạt:** Có thể bật/tắt tính năng theo từng section
5. **Tương thích:** Hoạt động với tất cả component hiện tại

## Tương Lai

- Có thể thêm tính năng nhóm theo thể loại
- Cải thiện thuật toán nhận diện series
- Thêm thống kê về series phổ biến
- Tối ưu performance khi xử lý nhiều phim
