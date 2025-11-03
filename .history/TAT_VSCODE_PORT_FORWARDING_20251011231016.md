# 🛑 Cách tắt VS Code Port Forwarding

## ❌ Vấn đề hiện tại
VS Code vẫn hiển thị lỗi đỏ: "Unable to forward localhost:5173. spawn code-tunnel.exe ENOENT"

**Nguyên nhân:** VS Code đang cố gắng tự động forward port và gặp lỗi.

## ✅ Giải pháp: Tắt VS Code Port Forwarding

### Cách 1: Sử dụng Command Palette (Khuyến nghị)

1. **Nhấn `Ctrl + Shift + P`** (hoặc `Cmd + Shift + P` trên Mac)
2. **Gõ:** `Ports: Stop Port Forwarding`
3. **Nhấn Enter**
4. **Hoặc gõ:** `Ports: Stop All Port Forwarding`

### Cách 2: Sử dụng UI

1. **Click vào tab "Ports"** ở bottom panel
2. **Click nút "X"** trên các port đang forward
3. **Hoặc click "Stop All"** nếu có nhiều port

### Cách 3: Tắt hoàn toàn Port Forwarding

1. **Nhấn `Ctrl + Shift + P`**
2. **Gõ:** `Preferences: Open Settings (JSON)`
3. **Thêm dòng:**
   ```json
   {
     "remote.autoForwardPorts": false,
     "remote.autoForwardPortsSource": "hybrid"
   }
   ```

### Cách 4: Restart VS Code/Cursor

1. **Đóng VS Code/Cursor hoàn toàn**
2. **Mở lại**
3. **Không click "Forward a Port"** khi có thông báo

## 🔧 Sau khi tắt VS Code Port Forwarding

### Bước 1: Kiểm tra không còn lỗi đỏ
- Không còn thông báo lỗi ở góc dưới trái
- Tab "Ports" hiển thị "No forwarded ports"

### Bước 2: Sử dụng ngrok thay thế
```bash
# Chạy script đơn giản
share-simple.bat

# Hoặc chạy trực tiếp
ngrok http 5173
```

### Bước 3: Lấy public URL
- Ngrok sẽ hiển thị URL dạng: `https://abc123.ngrok.io`
- Copy URL này để share

## 🎯 Kết quả mong đợi

Sau khi làm theo hướng dẫn:
- ✅ Không còn lỗi đỏ VS Code
- ✅ Ngrok hoạt động bình thường
- ✅ Có public URL để share
- ✅ Truy cập được từ điện thoại

## 🚨 Lưu ý quan trọng

1. **Không dùng cả 2 cùng lúc:** VS Code port forwarding và ngrok
2. **Chọn 1 trong 2:** VS Code (nếu hoạt động) hoặc ngrok (khuyến nghị)
3. **Ngrok ổn định hơn:** Không bị lỗi code-tunnel.exe

## 🔍 Troubleshooting

### Vẫn còn lỗi sau khi tắt:
1. **Restart VS Code/Cursor**
2. **Kiểm tra Settings** có tắt auto forward không
3. **Dùng ngrok thay thế** hoàn toàn

### Ngrok không hoạt động:
1. **Kiểm tra ứng dụng đang chạy:** `npm run dev`
2. **Test local:** http://localhost:5173
3. **Restart ngrok:** `ngrok http 5173`

### URL ngrok không truy cập được:
1. **Kiểm tra firewall Windows**
2. **Thử trình duyệt khác**
3. **Kiểm tra internet connection**
