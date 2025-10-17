@echo off
echo 🚀 TupPhim - Share Port Simple
echo ==============================
echo.

echo ⚠️  QUAN TRỌNG: Tắt VS Code port forwarding trước!
echo    1. Nhấn Ctrl+Shift+P
echo    2. Gõ: "Ports: Stop Port Forwarding"  
echo    3. Hoặc click X trên tab Ports
echo.
pause

echo.
echo 🔍 Kiểm tra ứng dụng...
netstat -an | findstr :5173 >nul
if %errorlevel% neq 0 (
    echo ❌ Frontend chưa chạy!
    echo 💡 Hãy chạy: npm run dev
    pause
    exit
)

echo ✅ Frontend đang chạy trên port 5173
echo.
echo 🌐 Đang khởi động ngrok...
echo 📱 Sẽ tạo URL công khai cho bạn
echo.

ngrok http 5173

echo.
echo 👋 Ngrok đã dừng
pause
