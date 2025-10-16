# 🔧 Sửa lỗi VS Code code-tunnel.exe ENOENT

## ❌ Lỗi thường gặp:
```
Unable to forward localhost:5173. spawn c:\Users\luong\AppData\Local\Programs\cursor\bin\code-tunnel.exe ENOENT
```

## 🔍 Nguyên nhân:
- File `code-tunnel.exe` không tồn tại trong thư mục Cursor
- VS Code/Cursor không thể tìm thấy tunnel executable
- Cài đặt Cursor không hoàn chỉnh

## ✅ Giải pháp:

### **Giải pháp 1: Restart VS Code/Cursor**
```bash
1. Đóng VS Code/Cursor hoàn toàn
2. Mở lại VS Code/Cursor
3. Thử forward port lại
```

### **Giải pháp 2: Cài đặt lại Cursor**
```bash
1. Uninstall Cursor hiện tại
2. Download Cursor mới từ: https://cursor.sh/
3. Cài đặt lại
4. Restore settings và extensions
```

### **Giải pháp 3: Sử dụng VS Code thay vì Cursor**
```bash
1. Download VS Code: https://code.visualstudio.com/
2. Cài đặt VS Code
3. Mở project trong VS Code
4. Sử dụng Port Forwarding của VS Code
```

### **Giải pháp 4: Sử dụng Live Share Extension**
```bash
1. Cài extension "Live Share" trong VS Code/Cursor
2. Click "Start Collaboration Session"
3. Share link với bạn bè
4. Không cần port forwarding
```

### **Giải pháp 5: Manual Port Forwarding**
```bash
# Thay vì dùng VS Code Port Forwarding, dùng:
# 1. Ngrok (đã setup sẵn)
# 2. LocalTunnel (đã cài sẵn)
# 3. Serve + localhost.run
```

## 🎯 Khuyến nghị:

### **Option A: Sử dụng VS Code thay vì Cursor**
- ✅ **Ổn định hơn** - Port forwarding hoạt động tốt
- ✅ **Tích hợp sẵn** - Không cần cài thêm
- ✅ **Nhiều tính năng** - Remote development

### **Option B: Sử dụng Live Share**
- ✅ **Không cần port forwarding** - Share trực tiếp
- ✅ **Collaborative** - Nhiều người cùng làm việc
- ✅ **Real-time** - Thay đổi hiển thị ngay lập tức

### **Option C: Quay lại ngrok**
- ✅ **Đã setup sẵn** - Chỉ cần chạy lại
- ✅ **Ổn định** - Không bị lỗi tunnel
- ✅ **Miễn phí** - Đã có tài khoản

## 🚀 Script tự động:

Tôi đã tạo script `setup-vscode-ports.bat` để:
1. **Kiểm tra ứng dụng** đang chạy
2. **Hướng dẫn từng bước** VS Code Port Forwarding
3. **Xử lý lỗi** code-tunnel.exe

## 💡 Tips:

1. **Backup settings** trước khi cài đặt lại
2. **Export extensions list** để restore sau
3. **Test port forwarding** với port khác trước
4. **Check firewall** Windows nếu vẫn lỗi

## 🎉 Kết quả mong đợi:

Sau khi sửa lỗi:
- ✅ **VS Code Port Forwarding hoạt động**
- ✅ **Có 2 public URLs** - Frontend và Backend
- ✅ **Share với bạn bè** dễ dàng
- ✅ **Truy cập từ điện thoại** bình thường

**🎯 Chọn giải pháp phù hợp và thử ngay!** 🚀
