# 🚀 Quick Start - VS Code Port Forwarding

## ⚡ Khởi động nhanh (3 bước)

### 1. Khởi động servers
```bash
# Chọn 1 trong 3 cách:

# Cách 1: PowerShell Script (Khuyến nghị)
.\start-dev-with-port-forwarding.ps1

# Cách 2: Batch Script (Windows)
start-dev-with-port-forwarding.bat

# Cách 3: NPM Script
npm run start:port-forwarding
```

### 2. Cấu hình VS Code Port Forwarding
1. Mở VS Code Command Palette: `Ctrl+Shift+P`
2. Gõ: `Ports: Focus on Ports View`
3. Thêm ports:
   - **3001** (Backend API)
   - **5173** (Frontend)
4. Set visibility: **Public** (cho mobile access)

### 3. Truy cập từ mobile
- Copy URL từ VS Code Ports view
- Mở trình duyệt mobile
- Truy cập URL

## 🎯 Kết quả
- ✅ Website hoạt động đầy đủ trên PC
- ✅ Website hoạt động đầy đủ trên mobile  
- ✅ Không ảnh hưởng localhost hiện tại
- ✅ Database MongoDB hoạt động bình thường
- ✅ Tất cả tính năng: search, auth, favorites, history

## 📱 URLs mẫu
- Frontend: `https://abc123.vscode.dev:5173`
- Backend: `https://abc123.vscode.dev:3001`

## 🔧 Troubleshooting
- **CORS Error**: Restart backend server
- **Connection Refused**: Kiểm tra ports đã được forward chưa
- **Mobile không truy cập được**: Set port visibility = Public

## 📖 Hướng dẫn chi tiết
Xem file: `VSCODE-PORT-FORWARDING-GUIDE.md`
