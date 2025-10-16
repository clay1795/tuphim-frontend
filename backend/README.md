# TupPhim Backend API

Backend API cho ứng dụng TupPhim - User Management & KKPhim API Proxy.

## 🚀 **Tính Năng**

- **User Authentication** - JWT-based authentication system
- **User Management** - Profile, watchlist, favorites, watch history
- **KKPhim API Proxy** - Caching và rate limiting cho KKPhim API
- **Security** - Helmet, CORS, rate limiting, input validation
- **Monitoring** - Health checks, logging, performance metrics
- **Database** - MongoDB Atlas cho user data

## 📋 **Yêu Cầu Hệ Thống**

- Node.js 18+
- MongoDB Atlas account
- PM2 (cho production)

## 🛠️ **Cài Đặt**

### 1. Clone và Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Variables

Copy `env.example` thành `.env` và cấu hình:

```bash
cp env.example .env
```

Cấu hình các biến môi trường:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tuphim_users

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Server
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# KKPhim API
KKPHIM_API_BASE=https://phimapi.com
KKPHIM_IMG_BASE=https://phimimg.com
KKPHIM_PLAYER_BASE=https://player.phimapi.com/player/?url=
```

### 3. Chạy Development Server

```bash
npm run dev
```

Server sẽ chạy tại `http://localhost:3001`

## 📚 **API Endpoints**

### **Authentication**
- `POST /api/auth/register` - Đăng ký user mới
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/change-password` - Đổi mật khẩu
- `POST /api/auth/logout` - Đăng xuất

### **User Management**
- `GET /api/users/profile` - Lấy profile user
- `PUT /api/users/profile` - Cập nhật profile
- `GET /api/users/watchlist` - Lấy watchlist
- `POST /api/users/watchlist` - Thêm vào watchlist
- `DELETE /api/users/watchlist/:movieId` - Xóa khỏi watchlist
- `GET /api/users/favorites` - Lấy favorites
- `POST /api/users/favorites` - Thêm vào favorites
- `GET /api/users/history` - Lấy watch history
- `POST /api/users/history` - Thêm vào watch history
- `GET /api/users/stats` - Lấy thống kê user

### **Movie API (KKPhim Proxy)**
- `GET /api/movies/new` - Phim mới cập nhật
- `GET /api/movies/detail/:slug` - Chi tiết phim
- `GET /api/movies/search` - Tìm kiếm phim
- `GET /api/movies/categories` - Danh sách thể loại
- `GET /api/movies/category/:slug` - Phim theo thể loại
- `GET /api/movies/countries` - Danh sách quốc gia
- `GET /api/movies/country/:slug` - Phim theo quốc gia
- `GET /api/movies/year/:year` - Phim theo năm
- `GET /api/movies/tmdb/:type/:id` - Thông tin TMDB
- `GET /api/movies/optimize-image` - Tối ưu hình ảnh
- `GET /api/movies/player-url` - URL trình phát

### **Health Check**
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed health check
- `GET /api/health/database` - Database health
- `GET /api/health/kkphim-api` - KKPhim API health
- `GET /api/health/ready` - Readiness check
- `GET /api/health/live` - Liveness check

## 🔧 **Scripts**

```bash
# Development
npm run dev          # Chạy với nodemon

# Production
npm start           # Chạy production server

# Testing
npm test            # Chạy tests
npm run test:watch  # Chạy tests với watch mode
```

## 🚀 **Deployment**

### 1. Production Build

```bash
npm install --production
```

### 2. Environment Variables

Cấu hình production environment variables:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-production-secret
FRONTEND_URL=https://yourdomain.com
```

### 3. PM2 Deployment

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start server.js --name tuphim-backend

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
```

### 4. Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 **Monitoring**

### Health Checks

```bash
# Basic health
curl http://localhost:3001/api/health

# Detailed health
curl http://localhost:3001/api/health/detailed

# Database health
curl http://localhost:3001/api/health/database

# KKPhim API health
curl http://localhost:3001/api/health/kkphim-api
```

### Logs

```bash
# PM2 logs
pm2 logs tuphim-backend

# Application logs
tail -f logs/all.log
tail -f logs/error.log
```

## 🔒 **Security**

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - 100 requests per 15 minutes
- **JWT Authentication** - Secure token-based auth
- **Input Validation** - Joi validation schemas
- **Password Hashing** - bcrypt with salt rounds 12

## 📈 **Performance**

- **Caching** - Node-cache cho KKPhim API responses
- **Rate Limiting** - 100 requests/minute cho KKPhim API
- **Compression** - Gzip compression
- **Database Indexing** - Optimized MongoDB indexes
- **Error Handling** - Graceful error handling với fallback data

## 🗄️ **Database Schema**

### User Collection

```javascript
{
  email: String,
  password: String (hashed),
  username: String,
  fullName: String,
  role: String ('user' | 'admin'),
  preferences: {
    favoriteGenres: [String],
    watchHistory: [{
      movieId: String,
      movieSlug: String,
      movieName: String,
      watchedAt: Date,
      progress: Number
    }],
    watchlist: [{
      movieId: String,
      movieSlug: String,
      movieName: String,
      addedAt: Date
    }],
    favorites: [{
      movieId: String,
      movieSlug: String,
      movieName: String,
      addedAt: Date
    }],
    settings: {
      theme: String,
      language: String,
      notifications: Object
    }
  },
  isActive: Boolean,
  isEmailVerified: Boolean,
  createdAt: Date,
  lastLogin: Date
}
```

## 🐛 **Troubleshooting**

### Common Issues

1. **MongoDB Connection Error**
   - Kiểm tra MONGODB_URI
   - Kiểm tra network connectivity
   - Kiểm tra MongoDB Atlas whitelist

2. **JWT Token Error**
   - Kiểm tra JWT_SECRET
   - Kiểm tra token expiration
   - Kiểm tra token format

3. **KKPhim API Error**
   - Kiểm tra network connectivity
   - Kiểm tra rate limiting
   - Kiểm tra API endpoint availability

### Debug Mode

```bash
# Enable debug logging
LOG_LEVEL=debug npm run dev
```

## 📝 **API Documentation**

Chi tiết API documentation có thể xem tại:
- `http://localhost:3001/api` - API overview
- `http://localhost:3001/api/health` - Health status

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 **License**

MIT License - xem file LICENSE để biết thêm chi tiết.


