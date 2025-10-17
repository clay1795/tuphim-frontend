@echo off
echo 🔄 Restart Frontend với cấu hình ngrok mới
echo ==========================================
echo.

echo 📋 Đang dừng frontend hiện tại...
taskkill /f /im node.exe 2>nul

echo.
echo ⏳ Đợi 3 giây để cleanup...
timeout /t 3 /nobreak >nul

echo.
echo 🚀 Khởi động lại frontend với cấu hình mới...
echo ✅ Đã thêm allowedHosts cho ngrok
echo ✅ Host external connections được bật
echo.

npm run dev

echo.
echo 👋 Frontend đã dừng
pause

