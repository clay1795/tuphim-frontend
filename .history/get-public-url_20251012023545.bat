@echo off
echo 🔗 Lấy Public URL từ ngrok
echo ==========================
echo.

echo ⏳ Đang lấy URL từ ngrok dashboard...
timeout /t 3 /nobreak >nul

echo.
echo 🌐 Truy cập ngrok dashboard: http://localhost:4040
echo 📱 Hoặc xem URL trong cửa sổ ngrok đã mở
echo.

echo 🔍 Đang kiểm tra API ngrok...
curl -s http://localhost:4040/api/tunnels > temp.json 2>nul

if exist temp.json (
    echo ✅ Đã lấy thông tin từ ngrok API
    echo.
    echo 📋 Thông tin tunnel:
    type temp.json
    echo.
    echo 💡 Tìm dòng "public_url" để lấy URL
) else (
    echo ❌ Không thể kết nối đến ngrok API
    echo 🌐 Hãy mở: http://localhost:4040
)

echo.
echo 📱 Hướng dẫn:
echo 1. Copy URL từ ngrok (dạng https://xxx.ngrok.io)
echo 2. Gửi cho bạn bè
echo 3. Họ mở URL trên điện thoại
echo.

del temp.json 2>nul
pause
