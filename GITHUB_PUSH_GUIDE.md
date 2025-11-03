# 🚀 **HƯỚNG DẪN XÓA CODE CŨ VÀ PUSH CODE MỚI LÊN GITHUB**

## 📋 **TỔNG QUAN**

Bạn sẽ xóa toàn bộ code cũ trong 2 repositories và push code mới lên:
- **Frontend**: [https://github.com/clay1795/tuphim-frontend](https://github.com/clay1795/tuphim-frontend)
- **Backend**: [https://github.com/clay1795/tuphim-backend](https://github.com/clay1795/tuphim-backend)

---

## 🛠️ **CÁCH 1: SỬ DỤNG GITHUB WEB (DỄ NHẤT)**

### **BƯỚC 1: Xóa tất cả files cũ**

#### **Frontend Repository:**
1. **Truy cập**: [https://github.com/clay1795/tuphim-frontend](https://github.com/clay1795/tuphim-frontend)
2. **Click vào từng file** trong repository
3. **Click "Delete file"** ở góc phải
4. **Commit message**: `Delete old files`
5. **Click "Commit changes"**
6. **Lặp lại** cho tất cả files

#### **Backend Repository:**
1. **Truy cập**: [https://github.com/clay1795/tuphim-backend](https://github.com/clay1795/tuphim-backend)
2. **Click vào từng file** trong repository
3. **Click "Delete file"** ở góc phải
4. **Commit message**: `Delete old files`
5. **Click "Commit changes"**
6. **Lặp lại** cho tất cả files

### **BƯỚC 2: Upload code mới**

#### **Frontend:**
1. **Vào repository** [https://github.com/clay1795/tuphim-frontend](https://github.com/clay1795/tuphim-frontend)
2. **Click "Add file" → "Upload files"**
3. **Drag & drop** toàn bộ thư mục `tuphim2` (trừ folder `backend`)
4. **Commit message**: `Upload new frontend code`
5. **Click "Commit changes"**

#### **Backend:**
1. **Vào repository** [https://github.com/clay1795/tuphim-backend](https://github.com/clay1795/tuphim-backend)
2. **Click "Add file" → "Upload files"**
3. **Drag & drop** chỉ thư mục `backend`
4. **Commit message**: `Upload new backend code`
5. **Click "Commit changes"**

---

## 🛠️ **CÁCH 2: SỬ DỤNG GITHUB DESKTOP (KHUYẾN NGHỊ)**

### **BƯỚC 1: Cài đặt GitHub Desktop**
1. **Tải**: [https://desktop.github.com/](https://desktop.github.com/)
2. **Cài đặt** và đăng nhập GitHub account
3. **Clone repositories** về máy

### **BƯỚC 2: Xóa và thay thế code**

#### **Frontend:**
```bash
# Clone repository
git clone https://github.com/clay1795/tuphim-frontend.git
cd tuphim-frontend

# Xóa tất cả files cũ (trừ .git)
# Windows PowerShell
Remove-Item -Recurse -Force * -Exclude .git

# Copy code mới từ tuphim2 (trừ backend)
# Copy tất cả files từ tuphim2 vào tuphim-frontend

# Commit và push
git add .
git commit -m "Replace with new frontend code"
git push origin main
```

#### **Backend:**
```bash
# Clone repository
git clone https://github.com/clay1795/tuphim-backend.git
cd tuphim-backend

# Xóa tất cả files cũ (trừ .git)
# Windows PowerShell
Remove-Item -Recurse -Force * -Exclude .git

# Copy code mới từ tuphim2/backend
# Copy tất cả files từ tuphim2/backend vào tuphim-backend

# Commit và push
git add .
git commit -m "Replace with new backend code"
git push origin main
```

---

## 🛠️ **CÁCH 3: SỬ DỤNG GIT COMMAND LINE**

### **BƯỚC 1: Cài đặt Git**
1. **Tải**: [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. **Cài đặt** với default settings
3. **Restart** PowerShell

### **BƯỚC 2: Xóa và thay thế code**

#### **Frontend:**
```bash
# Clone repository
git clone https://github.com/clay1795/tuphim-frontend.git
cd tuphim-frontend

# Xóa tất cả files cũ (trừ .git)
Remove-Item -Recurse -Force * -Exclude .git

# Copy code mới
# Copy tất cả files từ tuphim2 vào tuphim-frontend (trừ backend)

# Add, commit và push
git add .
git commit -m "Replace with new frontend code - Production Ready"
git push origin main
```

#### **Backend:**
```bash
# Clone repository
git clone https://github.com/clay1795/tuphim-backend.git
cd tuphim-backend

# Xóa tất cả files cũ (trừ .git)
Remove-Item -Recurse -Force * -Exclude .git

# Copy code mới
# Copy tất cả files từ tuphim2/backend vào tuphim-backend

# Add, commit và push
git add .
git commit -m "Replace with new backend code - Production Ready"
git push origin main
```

---

## 📁 **CẤU TRÚC FILES CẦN COPY**

### **Frontend (tuphim-frontend):**
```
tuphim-frontend/
├── src/
├── public/
├── package.json
├── package-lock.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── vercel.json
├── .env
├── .gitignore
├── README.md
└── [tất cả files khác trừ backend/]
```

### **Backend (tuphim-backend):**
```
tuphim-backend/
├── routes/
├── models/
├── services/
├── middleware/
├── config/
├── scripts/
├── logs/
├── data/
├── backups/
├── server.js
├── package.json
├── package-lock.json
├── .env
├── .gitignore
├── README.md
└── [tất cả files khác trong backend/]
```

---

## ⚠️ **LƯU Ý QUAN TRỌNG**

### **🔒 BẢO MẬT:**
- **KHÔNG** push file `.env` chứa sensitive data
- **KHÔNG** push `node_modules/`
- **KHÔNG** push logs và cache files

### **📝 COMMIT MESSAGES:**
- **Frontend**: `Replace with new frontend code - Production Ready`
- **Backend**: `Replace with new backend code - Production Ready`

### **🔄 SAU KHI PUSH:**
1. **Kiểm tra** repositories trên GitHub
2. **Verify** tất cả files đã được upload
3. **Test** deploy trên Vercel/Render
4. **Update** environment variables

---

## 🎯 **THỨ TỰ THỰC HIỆN KHUYẾN NGHỊ**

### **1. Frontend trước:**
1. Xóa code cũ trong `tuphim-frontend`
2. Upload code mới
3. Deploy lên Vercel
4. Lấy URL Vercel

### **2. Backend sau:**
1. Xóa code cũ trong `tuphim-backend`
2. Upload code mới
3. Deploy lên Render với environment variables
4. Update CORS với URL Vercel

---

## 🚀 **DEPLOYMENT SAU KHI PUSH**

### **Frontend (Vercel):**
1. **Import** repository `tuphim-frontend`
2. **Environment Variables**: Copy từ `ENVIRONMENT_VARIABLES_COMPLETE.md`
3. **Deploy** → Lấy URL

### **Backend (Render):**
1. **Import** repository `tuphim-backend`
2. **Environment Variables**: Copy từ `ENVIRONMENT_VARIABLES_COMPLETE.md`
3. **Deploy** → Test health check

---

## ✅ **CHECKLIST HOÀN THÀNH**

- [ ] ✅ Xóa code cũ trong tuphim-frontend
- [ ] ✅ Upload code mới vào tuphim-frontend
- [ ] ✅ Xóa code cũ trong tuphim-backend
- [ ] ✅ Upload code mới vào tuphim-backend
- [ ] ✅ Verify repositories trên GitHub
- [ ] ✅ Deploy frontend lên Vercel
- [ ] ✅ Deploy backend lên Render
- [ ] ✅ Test production deployment

---

## 🎉 **KẾT QUẢ CUỐI CÙNG**

Sau khi hoàn thành:
- **Frontend**: `https://tuphim-frontend-xxx.vercel.app`
- **Backend**: `https://tuphim-backend.onrender.com`
- **GitHub**: Code mới đã được push và sẵn sàng

**Chọn cách phù hợp với bạn và bắt đầu thực hiện! 🚀**
