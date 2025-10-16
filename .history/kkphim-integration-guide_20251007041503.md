# Hướng Dẫn Tích Hợp KKPhim API

## 📚 **Tài Liệu API**
- **Nguồn:** [KKPhim API Documentation](https://kkphim1.com/tai-lieu-api)
- **API Base:** `https://phimapi.com`
- **Image Base:** `https://phimimg.com`
- **Player Base:** `https://player.phimapi.com/player/?url=`
- **Domains:** kkphim1.com, kkphim.vip
- **Rate Limit:** ~100 requests/phút (không có giới hạn chặt chẽ)

## 🎯 **Các Endpoint Chính**

### **1. Phim Mới Cập Nhật**
```javascript
// V1 (cơ bản)
GET https://phimapi.com/danh-sach/phim-moi-cap-nhat?page=1

// V2 (cải tiến)
GET https://phimapi.com/danh-sach/phim-moi-cap-nhat-v2?page=1

// V3 (tối ưu nhất - KHUYẾN NGHỊ)
GET https://phimapi.com/danh-sach/phim-moi-cap-nhat-v3?page=1
```

### **2. Thông Tin Phim & Tập Phim**
```javascript
GET https://phimapi.com/phim/{slug}
// Ví dụ: https://phimapi.com/phim/ngoi-truong-xac-song
```

### **3. Thông Tin TMDB**
```javascript
GET https://phimapi.com/tmdb/{type}/{id}
// type: tv (phim bộ) hoặc movie (phim lẻ)
// Ví dụ: https://phimapi.com/tmdb/tv/280945
```

### **4. Danh Sách Tổng Hợp**
```javascript
GET https://phimapi.com/v1/api/danh-sach/{type_list}?page={page}&sort_field={sort_field}&sort_type={sort_type}&sort_lang={sort_lang}&category={category}&country={country}&year={year}&limit={limit}

// type_list: phim-bo, phim-le, tv-shows, hoat-hinh, phim-vietsub, phim-thuyet-minh, phim-long-tieng
```

### **5. Tìm Kiếm**
```javascript
GET https://phimapi.com/v1/api/tim-kiem?keyword={keyword}&page={page}&sort_field={sort_field}&sort_type={sort_type}&sort_lang={sort_lang}&category={category}&country={country}&year={year}&limit={limit}
```

### **6. Thể Loại**
```javascript
// Lấy danh sách thể loại
GET https://phimapi.com/the-loai

// Lấy phim theo thể loại
GET https://phimapi.com/v1/api/the-loai/{slug}?page={page}&sort_field={sort_field}&sort_type={sort_type}&sort_lang={sort_lang}&country={country}&year={year}&limit={limit}
```

### **7. Quốc Gia**
```javascript
// Lấy danh sách quốc gia
GET https://phimapi.com/quoc-gia

// Lấy phim theo quốc gia
GET https://phimapi.com/v1/api/quoc-gia/{slug}?page={page}&sort_field={sort_field}&sort_type={sort_type}&sort_lang={sort_lang}&category={category}&year={year}&limit={limit}
```

### **8. Năm**
```javascript
GET https://phimapi.com/v1/api/nam/{year}?page={page}&sort_field={sort_field}&sort_type={sort_type}&sort_lang={sort_lang}&category={category}&country={country}&limit={limit}
```

### **9. Chuyển Đổi Ảnh WebP**
```javascript
GET https://phimapi.com/image.php?url={link_anh_goc}
// Tự động chuyển đổi ảnh sang định dạng WebP để tối ưu tốc độ
```

## 🔧 **Tham Số Kỹ Thuật**

### **type_list (Danh sách loại phim):**
- `phim-bo` - Phim bộ
- `phim-le` - Phim lẻ  
- `tv-shows` - TV Shows
- `hoat-hinh` - Hoạt hình
- `phim-vietsub` - Phim có Vietsub
- `phim-thuyet-minh` - Phim có Thuyết minh
- `phim-long-tieng` - Phim có Lồng tiếng

### **sort_field (Sắp xếp theo):**
- `modified_time` - Thời gian cập nhật
- `_id` - ID của phim
- `year` - Năm phát hành

### **sort_type (Kiểu sắp xếp):**
- `desc` - Giảm dần (mới nhất trước)
- `asc` - Tăng dần (cũ nhất trước)

### **sort_lang (Ngôn ngữ):**
- `vietsub` - Phim có Vietsub
- `thuyet-minh` - Phim có Thuyết minh
- `long-tieng` - Phim có Lồng tiếng

### **limit (Giới hạn kết quả):**
- Tối đa: 64 phim/trang
- Khuyến nghị: 20-30 phim/trang

## 🚀 **Implementation trong TupPhim**

### **1. Cập nhật API Service**
```javascript
// Thay thế movieApi.js bằng kkphimApi.js
import kkphimApi from './services/kkphimApi';

// Sử dụng
const movies = await kkphimApi.getNewMovies(1, 'v3');
const movieDetail = await kkphimApi.getMovieDetail('ngoi-truong-xac-song');
const searchResults = await kkphimApi.searchMovies('thước', { page: 1, limit: 20 });
```

### **2. Tối Ưu Performance**
```javascript
// Cache 5 phút cho mỗi request
// Rate limiting 100 requests/phút
// Fallback data khi API down
// WebP image optimization
```

### **3. Error Handling**
```javascript
// Graceful degradation
// Stale cache fallback
// User-friendly error messages
// Retry mechanism
```

## 📊 **Lợi Ích của KKPhim API**

### **✅ Ưu Điểm:**
- **Miễn phí:** Không cần API key
- **Ổn định:** API được maintain tốt
- **Đầy đủ:** Có tất cả tính năng cần thiết
- **Tối ưu:** Hỗ trợ WebP, caching
- **Chi tiết:** Có TMDB integration
- **Linh hoạt:** Nhiều tham số filter

### **⚠️ Lưu Ý:**
- **Rate limiting:** Không có giới hạn chặt chẽ nhưng nên tự giới hạn
- **Caching:** Nên cache 5-10 phút để giảm requests
- **Fallback:** Luôn có fallback data khi API down
- **Monitoring:** Theo dõi API health

## 🎯 **Khuyến Nghị Triển Khai**

### **Giai đoạn 1: Migration (1-2 ngày)**
1. Thay thế `movieApi.js` bằng `kkphimApi.js`
2. Update các component sử dụng API
3. Test tất cả tính năng

### **Giai đoạn 2: Optimization (1 ngày)**
1. Implement caching strategy
2. Add error handling
3. Optimize image loading với WebP

### **Giai đoạn 3: Production (1 ngày)**
1. Deploy và test trên production
2. Monitor API performance
3. Setup fallback mechanisms

## 💰 **Chi Phí Triển Khai**

| Component | Cost | Notes |
|-----------|------|-------|
| **KKPhim API** | Free | Không cần API key |
| **Backend Server** | $5/tháng | Chỉ cho user data |
| **Database** | Free | MongoDB Atlas free tier |
| **CDN** | Free | CloudFlare free |
| **Total** | **$5/tháng** | **Production ready** |

## 🔍 **Monitoring & Analytics**

### **API Health Check:**
```javascript
// Kiểm tra API health mỗi 5 phút
const healthCheck = async () => {
  try {
    const response = await fetch('https://phimapi.com/danh-sach/phim-moi-cap-nhat-v3?page=1');
    return response.ok;
  } catch (error) {
    return false;
  }
};
```

### **Performance Metrics:**
- Response time
- Success rate
- Cache hit ratio
- Error rate

### **User Analytics:**
- Popular searches
- Most viewed movies
- User preferences
- Watch history

## 🚀 **Next Steps**

1. **Immediate:** Thay thế API service hiện tại
2. **Short-term:** Implement caching và error handling
3. **Long-term:** Add user features (watchlist, history, preferences)

Với KKPhim API, dự án của bạn sẽ có nguồn dữ liệu phim ổn định và miễn phí, giúp tiết kiệm chi phí đáng kể so với việc tự host database phim.
