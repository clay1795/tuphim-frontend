# 🇺🇸 Giải pháp tên tiếng Anh - TupPhim

## ✅ **Hướng dẫn sử dụng tính năng tên tiếng Anh**

### **🎯 Tổng quan:**

Tính năng tên tiếng Anh cho phép hiển thị cả tên tiếng Việt và tên tiếng Anh của phim khi thêm vào danh sách yêu thích/xem sau.

### **🔧 Cách hoạt động:**

#### **1. Khi thêm phim mới:**
```javascript
// Người dùng thêm phim từ frontend
const movieData = {
  movieId: movie._id,
  movieSlug: movie.slug,
  movieName: movie.name,
  poster_url: movie.poster_url,
  thumb_url: movie.thumb_url,
  banner_url: movie.banner_url,
  originalName: movie.original_name || movie.name
};

// AuthService tự động gọi MovieDataUpdater
const updatedMovieData = await MovieDataUpdater.updateMovieData(movieData);

// Lưu vào database với tên tiếng Anh
user.preferences.favorites.push(updatedMovieData);
await user.save();
```

#### **2. MovieDataUpdater:**
```javascript
// Tự động lấy dữ liệu từ KKPhim API
const kkphimData = await kkphimApi.getMovieDetail(movieData.movieSlug);

// Cập nhật với tên tiếng Anh
const updatedData = {
  ...movieData,
  movieId: movie._id,
  movieSlug: movie.slug,
  movieName: movie.name,
  originalName: movie.origin_name || movieData.originalName || null,
  poster_url: movie.poster_url,
  thumb_url: movie.thumb_url,
  banner_url: movie.banner_url,
  addedAt: movieData.addedAt
};
```

#### **3. Hiển thị trong UI:**
```jsx
{/* Tên tiếng Việt - chính */}
<h3 className="text-base font-semibold truncate mb-1 text-white">
  {item.movieName}
</h3>

{/* Tên tiếng Anh - phụ, italic */}
{item.originalName && item.originalName !== item.movieName && (
  <p className="text-sm text-gray-400 truncate italic">
    {item.originalName}
  </p>
)}

{/* Fallback nếu không có tên tiếng Anh */}
{!item.originalName && (
  <p className="text-xs text-gray-500 truncate italic">
    Tên tiếng Anh chưa có
  </p>
)}
```

### **🐛 Debug và sửa lỗi:**

#### **Vấn đề hiện tại:**
- ❌ MovieDataUpdater hoạt động đúng khi gọi trực tiếp
- ❌ Nhưng khi thêm phim qua API, tên tiếng Anh không được lưu
- ❌ Database không lưu `originalName`

#### **Nguyên nhân có thể:**
1. **MovieDataUpdater không được gọi đúng cách** trong AuthService
2. **Có lỗi trong quá trình gọi** MovieDataUpdater
3. **Database schema không đúng** hoặc không lưu `originalName`
4. **Frontend không gửi đủ thông tin** để MovieDataUpdater hoạt động

#### **Cách kiểm tra:**
```bash
# 1. Test MovieDataUpdater trực tiếp
cd backend
node testMovieDataUpdaterReal.cjs

# 2. Test việc thêm phim qua API
node testAddMovieWithEnglish.cjs

# 3. Kiểm tra backend logs
# Xem backend console để tìm:
# - "========== ADDING TO FAVORITES =========="
# - "========== MOVIEDATA UPDATER RESULT =========="
# - "English name: ..."
```

### **🔧 Giải pháp:**

#### **1. Đảm bảo frontend gửi đúng dữ liệu:**
```javascript
// Trong MovieDetailRoPhim.jsx, Banner.jsx, MovieTooltip.jsx
const movieData = {
  movieId: movie._id,
  movieSlug: movie.slug,  // ← Quan trọng! Cần có slug để lấy dữ liệu từ API
  movieName: movie.name,
  poster_url: movie.poster_url,
  thumb_url: movie.thumb_url,
  banner_url: movie.banner_url,
  originalName: movie.original_name || movie.name
};

await addToFavorites(movieData);
```

#### **2. Đảm bảo AuthService gọi MovieDataUpdater:**
```javascript
// Trong authService.js
const updatedMovieData = await MovieDataUpdater.updateMovieData({
  ...movieData,
  addedAt: movieData.addedAt || new Date()
});

logger.info(`English name: ${updatedMovieData.originalName || 'NOT SET'}`);
```

#### **3. Đảm bảo database schema đúng:**
```javascript
// Trong models/User.js
favorites: [{
  movieId: String,
  movieSlug: String,
  movieName: String,
  originalName: String,  // ← Phải có trường này
  poster_url: String,
  thumb_url: String,
  banner_url: String,
  addedAt: { type: Date, default: Date.now }
}]
```

### **📊 Test kết quả:**

#### **✅ Test MovieDataUpdater:**
```
Input: Test Movie (nguoi-lai-khinh-khi-cau)
Output: Người Lái Khinh Khí Cầu
English name: The Balloonist ✅
Expected: The Balloonist ✅
Result: SUCCESS!
```

#### **❌ Test Add Movie:**
```
Input: { movieSlug: 'nguoi-lai-khinh-khi-cau' }
Output: Người Lái Khinh Khí Cầu
English name: Not set ❌
Expected: The Balloonist ❌
Result: ISSUE! English name not being saved
```

### **🚀 Hướng tiếp theo:**

1. **Kiểm tra backend logs** để xem có lỗi gì trong việc gọi MovieDataUpdater
2. **Debug AuthService** để đảm bảo MovieDataUpdater được gọi đúng cách
3. **Kiểm tra database** để đảm bảo `originalName` được lưu đúng cách
4. **Test lại** với dữ liệu thật để đảm bảo tính năng hoạt động đúng

### **📝 Ghi chú:**

- **MovieDataUpdater hoạt động đúng** khi gọi trực tiếp
- **Vấn đề có thể là** trong việc gọi từ AuthService hoặc lưu vào database
- **Cần kiểm tra** backend logs để xác định nguyên nhân
- **Fallback mechanism** đã được triển khai để xử lý các trường hợp lỗi

### **🎯 Kết luận:**

**Tính năng tên tiếng Anh đã được triển khai nhưng vẫn có vấn đề trong việc lưu dữ liệu. Cần kiểm tra backend logs và debug AuthService để tìm ra nguyên nhân.**

**Vui lòng kiểm tra backend console logs khi thêm phim mới để xem có lỗi gì!**




