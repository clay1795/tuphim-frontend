@echo off
echo 🔧 Setup ngrok miễn phí không cần đăng ký
echo ==========================================
echo.

echo 📋 Cài đặt localtunnel (thay thế ngrok miễn phí)...
npm install -g localtunnel

echo.
echo ✅ Đã cài đặt localtunnel
echo.
echo 🚀 Đang khởi động localtunnel cho port 5173...
echo 📱 Sẽ tạo URL công khai miễn phí
echo.

echo ⚠️  LƯU Ý: Tắt VS Code port forwarding trước!
echo    Nhấn Ctrl+Shift+P, gõ: Ports: Stop Port Forwarding
echo.

lt --port 5173 --subdomain tuphim-demo

echo.
echo 👋 LocalTunnel đã dừng
pause

