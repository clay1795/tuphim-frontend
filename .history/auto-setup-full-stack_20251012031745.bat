@echo off
echo 🚀 TupPhim - Auto Setup Full-Stack
echo ===================================
echo.

echo 📋 BƯỚC 1: Kiểm tra ứng dụng
echo.

echo 🔍 Checking Frontend (Port 5173)...
netstat -an | findstr :5173 >nul
if %errorlevel% neq 0 (
    echo ❌ Frontend chưa chạy
    echo 🚀 Đang khởi động frontend...
    start /b npm run dev
    timeout /t 5 /nobreak >nul
) else (
    echo ✅ Frontend đang chạy
)

echo.
echo 🔍 Checking Backend (Port 3001)...
netstat -an | findstr :3001 >nul
if %errorlevel% neq 0 (
    echo ❌ Backend chưa chạy
    echo 🚀 Đang khởi động backend...
    start /b cmd /c "cd backend && npm start"
    timeout /t 5 /nobreak >nul
) else (
    echo ✅ Backend đang chạy
)

echo.
echo 📋 BƯỚC 2: Khởi động ngrok cho cả hai ports
echo.

echo 🌐 Đang share Frontend port 5173...
start /b ngrok http 5173

echo ⏳ Đợi 3 giây...
timeout /t 3 /nobreak >nul

echo 🔧 Đang share Backend port 3001...
start /b ngrok http 3001

echo ⏳ Đợi 3 giây...
timeout /t 3 /nobreak >nul

echo.
echo 📋 BƯỚC 3: Lấy URLs từ ngrok
echo.

echo 🔍 Đang lấy URLs...
timeout /t 2 /nobreak >nul

echo.
echo 🌐 Ngrok Dashboard: http://localhost:4040
echo.

echo 📋 BƯỚC 4: Hướng dẫn cấu hình
echo.

echo ⚠️  QUAN TRỌNG: Làm theo các bước sau:
echo.
echo 1️⃣ Mở ngrok dashboard: http://localhost:4040
echo 2️⃣ Copy Backend URL (port 3001)
echo 3️⃣ Mở file: src/services/dynamicApi.js
echo 4️⃣ Thay YOUR_BACKEND_NGROK_URL bằng URL thực tế
echo 5️⃣ Restart frontend: npm run dev
echo.

echo 📖 Xem hướng dẫn chi tiết: FULL_STACK_SETUP.md
echo.

echo 🎯 Kết quả:
echo ✅ Frontend URL: https://xxx.ngrok.io (cho người dùng)
echo ✅ Backend URL: https://yyy.ngrok.io (cho API)
echo ✅ Full-stack hoạt động đầy đủ
echo.

echo Press any key để dừng tất cả...
pause

echo.
echo 🛑 Đang dừng tất cả services...
taskkill /f /im ngrok.exe 2>nul
taskkill /f /im node.exe 2>nul

echo.
echo 👋 Đã dừng tất cả
pause
