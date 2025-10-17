# 🌐 Hướng dẫn Share Port cho TupPhim

## ❌ Vấn đề hiện tại
VS Code báo lỗi: `Unable to forward localhost:5173. spawn c:\Users\luong\AppData\Local\Programs\cursor\bin\code-tunnel.exe ENOENT`

**Nguyên nhân:** File `code-tunnel.exe` không tồn tại trong thư mục Cursor.

## ✅ Giải pháp khuyến nghị: Sử dụng ngrok

### 1. Cài đặt ngrok (đã cài xong)
```bash
npm install -g ngrok
```

### 2. Sử dụng script đơn giản

#### Option A: Chạy file .bat (Dễ nhất)
```bash
# Share frontend
share-frontend.bat

# Share backend  
share-backend.bat
```

#### Option B: Chạy script PowerShell
```powershell
# Share frontend
.\share-port.ps1 frontend

# Share backend
.\share-port.ps1 backend

# Share cả hai
.\share-port.ps1 both
```

#### Option C: Chạy trực tiếp với ngrok
```bash
# Share frontend (port 5173)
ngrok http 5173

# Share backend (port 3001)  
ngrok http 3001
```

### 3. Cách sử dụng

1. **Chạy ứng dụng của bạn:**
   ```bash
   # Terminal 1: Start frontend
   npm run dev
   
   # Terminal 2: Start backend
   cd backend
   npm start
   ```

2. **Chạy ngrok:**
   ```bash
   # Share frontend
   ngrok http 5173
   ```

3. **Lấy public URL:**
   - Ngrok sẽ hiển thị URL dạng: `https://abc123.ngrok.io`
   - Copy URL này và chia sẻ với người khác
   - URL này sẽ hoạt động trên mọi thiết bị có internet

## 🔧 Các giải pháp khác

### Giải pháp 1: Sử dụng Live Server Extension
1. Cài đặt extension "Live Server" trong VS Code
2. Right-click vào file `index.html`
3. Chọn "Open with Live Server"
4. Sử dụng port forwarding của Live Server

### Giải pháp 2: Sử dụng serve
```bash
npm install -g serve
serve -s dist -l 3000
```

### Giải pháp 3: Sử dụng localtunnel
```bash
npm install -g localtunnel
lt --port 5173
```

## 📱 Test trên điện thoại

1. Chạy ngrok: `ngrok http 5173`
2. Lấy public URL (ví dụ: `https://abc123.ngrok.io`)
3. Mở URL này trên điện thoại
4. Ứng dụng sẽ hoạt động bình thường

## 🚨 Lưu ý quan trọng

- **Frontend port:** 5173 (Vite dev server)
- **Backend port:** 3001 (Express server)
- **Ngrok dashboard:** http://localhost:4040
- **Public URL có thể thay đổi** mỗi lần restart ngrok (trừ khi có tài khoản ngrok pro)

## 🎯 Kết luận

**Khuyến nghị:** Sử dụng ngrok với script `.bat` đơn giản nhất:
1. Chạy `share-frontend.bat`
2. Copy public URL
3. Chia sẻ với người khác

Ngrok ổn định hơn và dễ sử dụng hơn VS Code port forwarding.
