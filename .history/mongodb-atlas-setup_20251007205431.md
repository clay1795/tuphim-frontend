# MongoDB Atlas Setup Guide

## 🎯 **Mục Tiêu**
Setup MongoDB Atlas database cho TupPhim Backend để lưu trữ user data.

## 📋 **Yêu Cầu**
- MongoDB Atlas account (free tier available)
- Internet connection
- Email để tạo account

## 🚀 **Bước 1: Tạo MongoDB Atlas Account**

### 1.1 Đăng ký Account
1. Truy cập [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" hoặc "Start Free"
3. Điền thông tin:
   - **Email:** your-email@example.com
   - **Password:** strong-password
   - **First Name:** Your Name
   - **Last Name:** Your Last Name
4. Click "Create your Atlas account"

### 1.2 Xác thực Email
1. Kiểm tra email inbox
2. Click link xác thực trong email
3. Hoàn thành xác thực

## 🏗️ **Bước 2: Tạo Cluster**

### 2.1 Chọn Plan
1. Chọn **"M0 Sandbox"** (Free tier)
   - 512 MB storage
   - Shared RAM
   - Free forever
2. Click "Create a cluster"

### 2.2 Cấu hình Cluster
1. **Cloud Provider:** AWS (recommended)
2. **Region:** Chọn region gần nhất (Singapore hoặc Tokyo)
3. **Cluster Name:** `tuphim-cluster` (hoặc tên khác)
4. Click "Create Cluster"

### 2.3 Chờ Cluster Ready
- Quá trình tạo cluster mất 3-5 phút
- Bạn sẽ thấy "Your cluster is ready" khi hoàn thành

## 🔐 **Bước 3: Tạo Database User**

### 3.1 Tạo User
1. Trong cluster dashboard, click "Database Access"
2. Click "Add New Database User"
3. Cấu hình:
   - **Authentication Method:** Password
   - **Username:** `tuphim-user` (hoặc tên khác)
   - **Password:** Tạo password mạnh (lưu lại!)
   - **Database User Privileges:** "Read and write to any database"
4. Click "Add User"

### 3.2 Lưu Thông Tin
```
Username: tuphim-user
Password: your-strong-password
```

## 🌐 **Bước 4: Cấu hình Network Access**

### 4.1 Whitelist IP Addresses
1. Click "Network Access" trong sidebar
2. Click "Add IP Address"
3. Chọn một trong các options:
   - **"Add Current IP Address"** - Chỉ cho phép IP hiện tại
   - **"Allow Access from Anywhere"** - Cho phép từ mọi nơi (0.0.0.0/0)
4. Click "Confirm"

### 4.2 Lưu Ý Bảo Mật
- **Development:** Có thể dùng "Allow Access from Anywhere"
- **Production:** Nên whitelist specific IP addresses

## 🔗 **Bước 5: Lấy Connection String**

### 5.1 Connect to Cluster
1. Click "Connect" trên cluster card
2. Chọn "Connect your application"
3. Chọn driver: **Node.js**
4. Chọn version: **4.1 or later**

### 5.2 Copy Connection String
```
mongodb+srv://tuphim-user:<password>@tuphim-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### 5.3 Cập nhật Connection String
Thay `<password>` bằng password thực tế:
```
mongodb+srv://tuphim-user:your-actual-password@tuphim-cluster.xxxxx.mongodb.net/tuphim_users?retryWrites=true&w=majority
```

## ⚙️ **Bước 6: Cấu hình Backend**

### 6.1 Tạo .env File
Trong thư mục `backend/`, tạo file `.env`:

```env
# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://tuphim-user:your-actual-password@tuphim-cluster.xxxxx.mongodb.net/tuphim_users?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRES_IN=7d

# Server Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# KKPhim API Configuration
KKPHIM_API_BASE=https://phimapi.com
KKPHIM_IMG_BASE=https://phimimg.com
KKPHIM_PLAYER_BASE=https://player.phimapi.com/player/?url=

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret-here

# Monitoring
LOG_LEVEL=info
ENABLE_ANALYTICS=true
```

### 6.2 Test Connection
```bash
cd backend
npm install
npm run dev
```

Kiểm tra logs để đảm bảo kết nối thành công:
```
MongoDB connected successfully to: tuphim-cluster-shard-00-00.xxxxx.mongodb.net
```

## 🗄️ **Bước 7: Tạo Database và Collections**

### 7.1 Database sẽ được tạo tự động
- Database name: `tuphim_users`
- Sẽ được tạo khi first user register

### 7.2 Collections sẽ được tạo tự động
- `users` - User data
- `sessions` - User sessions (nếu cần)
- `user_preferences` - User preferences (nếu cần)

## 🔍 **Bước 8: Verify Setup**

### 8.1 Test API Endpoints
```bash
# Health check
curl http://localhost:3001/api/health/database

# Expected response:
{
  "status": "healthy",
  "message": "Database connection is healthy",
  "state": "connected",
  "readyState": 1,
  "host": "tuphim-cluster-shard-00-00.xxxxx.mongodb.net",
  "port": 27017,
  "name": "tuphim_users"
}
```

### 8.2 Test User Registration
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "username": "testuser",
    "fullName": "Test User"
  }'
```

## 📊 **Bước 9: Monitor Database**

### 9.1 Atlas Dashboard
- **Metrics:** CPU, Memory, Storage usage
- **Real-time Performance:** Query performance
- **Alerts:** Set up alerts for issues

### 9.2 Database Monitoring
```bash
# Check database health
curl http://localhost:3001/api/health/detailed

# Check user count
curl http://localhost:3001/api/users/stats
```

## 🔒 **Bước 10: Security Best Practices**

### 10.1 Production Security
1. **Strong Passwords:** Sử dụng password mạnh cho database user
2. **IP Whitelisting:** Chỉ whitelist IP addresses cần thiết
3. **Regular Backups:** Enable automatic backups
4. **Monitor Access:** Theo dõi database access logs

### 10.2 Environment Variables
```env
# Production environment
NODE_ENV=production
MONGODB_URI=mongodb+srv://tuphim-user:strong-production-password@tuphim-cluster.xxxxx.mongodb.net/tuphim_users?retryWrites=true&w=majority
JWT_SECRET=very-long-and-random-production-secret-key
```

## 🚨 **Troubleshooting**

### Common Issues

1. **Connection Timeout**
   ```
   Error: connect ETIMEDOUT
   ```
   **Solution:** Kiểm tra network access và IP whitelist

2. **Authentication Failed**
   ```
   Error: Authentication failed
   ```
   **Solution:** Kiểm tra username/password trong connection string

3. **Database Not Found**
   ```
   Error: database tuphim_users not found
   ```
   **Solution:** Database sẽ được tạo tự động khi có first user

### Debug Commands
```bash
# Check connection string format
echo $MONGODB_URI

# Test connection
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected!'))
  .catch(err => console.error('Error:', err));
"
```

## 📈 **Scaling Options**

### Free Tier Limits
- **Storage:** 512 MB
- **Connections:** 100 concurrent
- **Users:** Unlimited

### Upgrade Options
- **M2:** $9/month - 2 GB storage
- **M5:** $25/month - 5 GB storage
- **M10:** $57/month - 10 GB storage

## ✅ **Checklist**

- [ ] MongoDB Atlas account created
- [ ] Cluster created (M0 Sandbox)
- [ ] Database user created
- [ ] Network access configured
- [ ] Connection string obtained
- [ ] Backend .env configured
- [ ] Connection tested
- [ ] User registration tested
- [ ] Health check working
- [ ] Monitoring setup

## 🎉 **Hoàn Thành!**

MongoDB Atlas đã được setup thành công! Bạn có thể:

1. **Start Backend Server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Test API:**
   ```bash
   curl http://localhost:3001/api/health
   ```

3. **Register First User:**
   ```bash
   curl -X POST http://localhost:3001/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@tuphim.com","password":"Admin123456","username":"admin","fullName":"Admin User"}'
   ```

Bước tiếp theo: **Implement Authentication System** và **Deploy Backend**!



