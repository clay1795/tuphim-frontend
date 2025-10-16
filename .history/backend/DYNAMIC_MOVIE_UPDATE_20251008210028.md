# Dynamic Movie Data Update System

## Overview
Hệ thống cập nhật dữ liệu phim động cho phép tự động lấy dữ liệu thật từ API KKPhim khi người dùng thêm phim vào favorites, watchlist, hoặc history.

## Features

### 1. Automatic Data Update
- **Tự động cập nhật**: Khi thêm phim mới, hệ thống tự động lấy dữ liệu thật từ API KKPhim
- **Fallback an toàn**: Nếu API lỗi, vẫn lưu dữ liệu từ frontend
- **Caching thông minh**: API responses được cache để tối ưu hiệu suất

### 2. MovieDataUpdater Middleware
```javascript
// Cập nhật dữ liệu phim đơn lẻ
const updatedMovie = await MovieDataUpdater.updateMovieData(movieData);

// Cập nhật nhiều phim cùng lúc
const updatedMovies = await MovieDataUpdater.updateMultipleMoviesData(moviesArray);

// Kiểm tra phim có cần cập nhật không
const needsUpdate = MovieDataUpdater.needsUpdate(movieData);

// Lấy thống kê cập nhật
const stats = MovieDataUpdater.getUpdateStats(moviesArray);
```

### 3. API Endpoints

#### Update Single Movie
```http
POST /api/movie-data/update-single
Content-Type: application/json
Authorization: Bearer <token>

{
  "movieId": "movie-id",
  "movieSlug": "movie-slug",
  "listType": "favorites" // or "watchlist" or "history"
}
```

#### Update Entire List
```http
POST /api/movie-data/update-list
Content-Type: application/json
Authorization: Bearer <token>

{
  "listType": "favorites" // or "watchlist" or "history"
}
```

#### Get Statistics
```http
GET /api/movie-data/stats
Authorization: Bearer <token>
```

## How It Works

### 1. User Adds Movie
```javascript
// Frontend sends movie data
const movieData = {
  movieId: "123",
  movieSlug: "movie-slug",
  movieName: "Movie Name",
  poster_url: "sample-poster.jpg"
};

// Backend automatically updates with real data
const updatedData = await MovieDataUpdater.updateMovieData(movieData);
// Result: Real poster, thumb, banner from KKPhim API
```

### 2. Data Flow
1. **User Action**: Thêm phim vào favorites/watchlist
2. **Frontend**: Gửi dữ liệu phim cơ bản
3. **Backend**: Gọi MovieDataUpdater.updateMovieData()
4. **API Call**: Lấy dữ liệu thật từ KKPhim API
5. **Database**: Lưu dữ liệu thật vào MongoDB
6. **Response**: Trả về dữ liệu đã cập nhật

### 3. Update Detection
```javascript
// Hệ thống tự động phát hiện phim cần cập nhật
const needsUpdate = (movieData) => {
  return !movieData.poster_url || 
         !movieData.poster_url.includes('phimimg.com');
};
```

## Statistics

### Current Status
- **Favorites**: 13 phim (12 có dữ liệu thật, 1 cần cập nhật)
- **Watchlist**: 1 phim (0 có dữ liệu thật, 1 cần cập nhật)
- **History**: 0 phim

### Update Statistics Format
```javascript
{
  total: 13,           // Tổng số phim
  needsUpdate: 1,      // Số phim cần cập nhật
  hasRealData: 12,     // Số phim đã có dữ liệu thật
  noSlug: 0           // Số phim không có slug
}
```

## Error Handling

### 1. API Failures
- **Rate Limiting**: Tự động delay giữa các request
- **Network Errors**: Fallback về dữ liệu gốc
- **Invalid Slugs**: Log warning và giữ dữ liệu gốc

### 2. Data Validation
- **Required Fields**: movieId, movieSlug
- **List Types**: favorites, watchlist, history
- **User Authentication**: Tất cả endpoints yêu cầu auth

## Performance

### 1. Caching
- **API Responses**: Cache 5 phút
- **Rate Limiting**: 100 requests/phút
- **Batch Updates**: Delay 100ms giữa các phim

### 2. Optimization
- **Skip Existing**: Không cập nhật phim đã có dữ liệu thật
- **Parallel Processing**: Cập nhật nhiều phim song song
- **Lazy Loading**: Chỉ cập nhật khi cần thiết

## Usage Examples

### 1. Frontend Integration
```javascript
// Thêm phim vào favorites
const addToFavorites = async (movie) => {
  const response = await fetch('/api/users/favorites', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      movieId: movie._id,
      movieSlug: movie.slug,
      movieName: movie.name,
      poster_url: movie.poster_url
    })
  });
  
  // Backend tự động cập nhật với dữ liệu thật
  return response.json();
};
```

### 2. Manual Update
```javascript
// Cập nhật thủ công một phim
const updateMovie = async (movieId, movieSlug) => {
  const response = await fetch('/api/movie-data/update-single', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      movieId,
      movieSlug,
      listType: 'favorites'
    })
  });
  
  return response.json();
};
```

### 3. Batch Update
```javascript
// Cập nhật toàn bộ danh sách
const updateAllFavorites = async () => {
  const response = await fetch('/api/movie-data/update-list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      listType: 'favorites'
    })
  });
  
  return response.json();
};
```

## Benefits

1. **User Experience**: Người dùng luôn thấy ảnh phim thật
2. **Data Quality**: Dữ liệu phim luôn chính xác và cập nhật
3. **Performance**: Caching và rate limiting tối ưu hiệu suất
4. **Reliability**: Fallback mechanism đảm bảo hệ thống luôn hoạt động
5. **Scalability**: Hệ thống có thể xử lý nhiều người dùng đồng thời

## Future Enhancements

1. **Background Jobs**: Cập nhật dữ liệu phim trong background
2. **Scheduled Updates**: Tự động cập nhật định kỳ
3. **User Preferences**: Cho phép người dùng tắt/bật auto-update
4. **Analytics**: Theo dõi hiệu suất và usage statistics
5. **Multi-Source**: Hỗ trợ nhiều nguồn dữ liệu phim
