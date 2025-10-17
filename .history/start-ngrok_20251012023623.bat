@echo off
echo 🚀 TupPhim - Share Port với ngrok
echo ==============================
echo.
echo ✅ Frontend đang chạy trên port 5173
echo 🌐 Đang khởi động ngrok...
echo 📱 Sẽ tạo URL công khai cho bạn
echo.
echo ⚠️  LƯU Ý: Tắt VS Code port forwarding trước!
echo    Nhấn Ctrl+Shift+P, gõ: Ports: Stop Port Forwarding
echo.
echo 🔗 Sau khi ngrok chạy, copy URL https://xxx.ngrok.io
echo 📱 Gửi URL này cho bạn bè để họ truy cập trên điện thoại
echo.
pause
ngrok http 5173
