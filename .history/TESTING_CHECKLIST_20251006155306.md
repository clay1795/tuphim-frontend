# ✅ Kiểm Tra Web Sau Khi Nâng Cấp

## 🧪 Test Checklist

### **1. Kiểm Tra Cơ Bản**
```bash
# Chạy development server
npm run dev

# Build production
npm run build

# Preview production build
npm run preview
```

### **2. Test Chức Năng Chính**

#### **✅ Trang Chủ**
- [ ] Trang chủ load được
- [ ] Banner phim hiển thị
- [ ] Danh sách phim load được
- [ ] Không có lỗi console (production mode)
- [ ] Responsive trên mobile/tablet/desktop

#### **✅ Tìm Kiếm & Lọc**
- [ ] Tìm kiếm phim hoạt động
- [ ] Lọc theo thể loại
- [ ] Lọc theo quốc gia
- [ ] Lọc theo năm
- [ ] Phân trang hoạt động

#### **✅ Chi Tiết Phim**
- [ ] Click vào phim hiển thị chi tiết
- [ ] Video player hoạt động
- [ ] Thông tin phim đầy đủ
- [ ] Danh sách tập phim

#### **✅ Đăng Nhập/Đăng Ký**
- [ ] Modal đăng nhập mở được
- [ ] Đăng nhập admin: `admin@example.com` / `admin123`
- [ ] Đăng nhập member: `member@example.com` / `member123`
- [ ] Đăng ký member mới
- [ ] Chuyển hướng admin đúng
- [ ] User menu hiển thị đúng

#### **✅ Admin Panel**
- [ ] Truy cập `/admin` với quyền admin
- [ ] Dashboard load được
- [ ] Quản lý phim
- [ ] Quản lý người dùng
- [ ] Quản lý danh mục
- [ ] Thống kê
- [ ] Cài đặt

### **3. Test Error Handling**

#### **✅ API Errors**
- [ ] Khi API lỗi, hiển thị fallback data
- [ ] Không crash ứng dụng
- [ ] Error boundary hoạt động
- [ ] Loading states hiển thị đúng

#### **✅ Network Issues**
- [ ] Offline mode (nếu có)
- [ ] Slow connection
- [ ] API timeout

### **4. Test Performance**

#### **✅ Loading Speed**
- [ ] Trang chủ load < 3 giây
- [ ] Images lazy load
- [ ] Bundle size hợp lý
- [ ] No memory leaks

#### **✅ Browser Compatibility**
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### **5. Test SEO & Meta**

#### **✅ Meta Tags**
- [ ] Title tag hiển thị đúng
- [ ] Description tag
- [ ] Open Graph tags
- [ ] Twitter Card tags
- [ ] Favicon

### **6. Test Security**

#### **✅ Input Validation**
- [ ] Email validation
- [ ] Password validation
- [ ] XSS protection
- [ ] CSRF protection (nếu có)

## 🚨 Lỗi Thường Gặp & Cách Sửa

### **Lỗi: "API không hoạt động"**
```bash
# Kiểm tra environment variables
echo $VITE_API_BASE_URL

# Kiểm tra trong browser console
console.log('API URL:', import.meta.env.VITE_API_BASE_URL);
```

### **Lỗi: "Build failed"**
```bash
# Clear cache và rebuild
rm -rf node_modules dist
npm install
npm run build
```

### **Lỗi: "404 on refresh"**
- Vercel: Tự động handle
- Netlify: Tạo file `_redirects` với nội dung: `/* /index.html 200`

### **Lỗi: "CORS error"**
- API đã được cấu hình CORS
- Kiểm tra network tab trong browser

## 📊 Performance Metrics

### **Target Metrics:**
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- First Input Delay: < 100ms

### **Bundle Size:**
- Main bundle: < 500KB
- Vendor bundle: < 1MB
- Total: < 1.5MB

## 🔧 Debug Commands

```bash
# Kiểm tra bundle size
npm run build
npx vite-bundle-analyzer dist

# Kiểm tra dependencies
npm audit

# Lint code
npm run lint

# Fix lint issues
npm run lint:fix
```

## 📱 Mobile Testing

### **Test trên thiết bị thật:**
- [ ] iPhone Safari
- [ ] Android Chrome
- [ ] Touch interactions
- [ ] Orientation changes

### **Test responsive breakpoints:**
- [ ] 320px (Mobile S)
- [ ] 375px (Mobile M)
- [ ] 768px (Tablet)
- [ ] 1024px (Laptop)
- [ ] 1440px (Desktop)

## 🌐 Production Testing

### **Sau khi deploy:**
1. Test trên domain thật
2. Test HTTPS
3. Test CDN
4. Test analytics
5. Test error tracking

## 📞 Khi Gặp Vấn Đề

1. **Kiểm tra console log** (F12)
2. **Kiểm tra network tab**
3. **Kiểm tra environment variables**
4. **Kiểm tra build log**
5. **Tạo issue với thông tin chi tiết**

---

**✅ Hoàn thành checklist này để đảm bảo web hoạt động ổn định!**

