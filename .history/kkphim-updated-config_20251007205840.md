# Cấu Hình KKPhim API Đã Cập Nhật

## 🎯 **Thông Tin Domain Mới**

### **Domains Chính:**
- **Website:** kkphim1.com, kkphim.vip
- **API:** https://phimapi.com
- **Hình ảnh:** https://phimimg.com
- **Trình phát:** https://player.phimapi.com/player/?url=
- **Tài liệu:** https://kkphim1.com/tai-lieu-api

## 📁 **Các File Đã Cập Nhật**

### **1. KKPhim Configuration (`src/config/kkphimConfig.js`)**
- ✅ **Tập trung tất cả cấu hình** domain và endpoints
- ✅ **Utility functions** cho image optimization, player URLs
- ✅ **Fallback data** cho error handling
- ✅ **Constants** cho movie types, sort fields, languages

### **2. KKPhim API Service (`src/services/kkphimApi.js`)**
- ✅ **Sử dụng config tập trung** thay vì hardcode
- ✅ **Tất cả endpoints** được cập nhật theo domain mới
- ✅ **Image optimization** với phimimg.com
- ✅ **Player integration** với player.phimapi.com
- ✅ **WebP conversion** tự động

### **3. Integration Guide (`kkphim-integration-guide.md`)**
- ✅ **Cập nhật tài liệu** với domain mới
- ✅ **Thêm player endpoints**
- ✅ **Image optimization guide**

## 🚀 **Tính Năng Mới**

### **Image Optimization:**
```javascript
// Tự động chuyển đổi sang phimimg.com
const optimizedUrl = kkphimApi.getOptimizedImageUrl(originalUrl);

// Chuyển đổi sang WebP
const webpUrl = kkphimApi.getWebpImage(originalUrl);
```

### **Player Integration:**
```javascript
// Tạo player URL
const playerUrl = kkphimApi.getPlayerUrl(videoUrl);
// Kết quả: https://player.phimapi.com/player/?url=encoded_video_url
```

### **Centralized Configuration:**
```javascript
import KKPHIM_CONFIG from '../config/kkphimConfig';

// Sử dụng config
const apiUrl = KKPHIM_CONFIG.api.base; // https://phimapi.com
const imgUrl = KKPHIM_CONFIG.images.base; // https://phimimg.com
const playerUrl = KKPHIM_CONFIG.player.base; // https://player.phimapi.com/player/?url=
```

## 🔧 **API Endpoints Đã Cập Nhật**

### **1. Phim Mới Cập Nhật:**
```javascript
// V3 (khuyến nghị)
GET https://phimapi.com/danh-sach/phim-moi-cap-nhat-v3?page=1
```

### **2. Chi Tiết Phim:**
```javascript
GET https://phimapi.com/phim/{slug}
```

### **3. Tìm Kiếm:**
```javascript
GET https://phimapi.com/v1/api/tim-kiem?keyword={keyword}&page={page}
```

### **4. Thể Loại:**
```javascript
// Danh sách thể loại
GET https://phimapi.com/the-loai

// Phim theo thể loại
GET https://phimapi.com/v1/api/the-loai/{slug}?page={page}
```

### **5. Quốc Gia:**
```javascript
// Danh sách quốc gia
GET https://phimapi.com/quoc-gia

// Phim theo quốc gia
GET https://phimapi.com/v1/api/quoc-gia/{slug}?page={page}
```

### **6. Năm:**
```javascript
GET https://phimapi.com/v1/api/nam/{year}?page={page}
```

### **7. TMDB:**
```javascript
GET https://phimapi.com/tmdb/{type}/{id}
```

### **8. Image Conversion:**
```javascript
GET https://phimapi.com/image.php?url={image_url}
```

### **9. Player:**
```javascript
GET https://player.phimapi.com/player/?url={video_url}
```

## 📊 **Lợi Ích Của Cấu Hình Mới**

### **✅ Maintainability:**
- **Tập trung cấu hình** trong một file
- **Dễ thay đổi** domain hoặc endpoints
- **Consistent** across toàn bộ app

### **✅ Performance:**
- **Image optimization** với phimimg.com
- **WebP conversion** tự động
- **Player integration** tối ưu

### **✅ Reliability:**
- **Fallback data** khi API down
- **Error handling** tốt hơn
- **Caching strategy** hiệu quả

### **✅ Developer Experience:**
- **Type safety** với constants
- **Utility functions** tiện lợi
- **Clear documentation**

## 🎯 **Cách Sử Dụng**

### **1. Import Configuration:**
```javascript
import KKPHIM_CONFIG from '../config/kkphimConfig';
import kkphimApi from '../services/kkphimApi';
```

### **2. Sử Dụng API:**
```javascript
// Lấy phim mới
const movies = await kkphimApi.getNewMovies(1, 'v3');

// Tìm kiếm phim
const searchResults = await kkphimApi.searchMovies('thước', { page: 1 });

// Chi tiết phim
const movieDetail = await kkphimApi.getMovieDetail('ngoi-truong-xac-song');

// Tối ưu hình ảnh
const optimizedImage = kkphimApi.getOptimizedImageUrl(movie.poster);
const webpImage = kkphimApi.getWebpImage(movie.poster);

// Player URL
const playerUrl = kkphimApi.getPlayerUrl(episode.url);
```

### **3. Sử Dụng Config:**
```javascript
// Lấy danh sách thể loại
const categories = Object.keys(KKPHIM_CONFIG.movieTypes);

// Lấy danh sách quốc gia phổ biến
const popularCountries = KKPHIM_CONFIG.popularCountries;

// Lấy năm có sẵn
const availableYears = KKPHIM_CONFIG.getAvailableYears();
```

## 🚀 **Next Steps**

### **1. Test API Integration:**
```bash
npm run dev
# Kiểm tra tất cả endpoints hoạt động
```

### **2. Update Components:**
- Sử dụng `kkphimApi` thay vì `movieApi`
- Implement image optimization
- Add player integration

### **3. Deploy:**
- Test trên production
- Monitor API performance
- Setup error tracking

## 💰 **Chi Phí Không Đổi**

| Service | Cost | Notes |
|---------|------|-------|
| **KKPhim API** | **FREE** | Không thay đổi |
| **Backend** | $5/tháng | User management |
| **Database** | Free | MongoDB Atlas |
| **Total** | **$5/tháng** | **Production ready** |

Với cấu hình mới này, dự án của bạn sẽ có:
- **Performance tốt hơn** với image optimization
- **Reliability cao hơn** với fallback data
- **Maintainability tốt hơn** với centralized config
- **Developer experience** tốt hơn với utility functions



