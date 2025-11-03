@echo off
echo 🚀 TupPhim - Share Full-Stack (Frontend + Backend)
echo ==================================================
echo.

echo 📋 BƯỚC 1: Kiểm tra ứng dụng đang chạy
echo.

echo 🔍 Checking Frontend (Port 5173)...
netstat -an | findstr :5173 >nul
if %errorlevel% equ 0 (
    echo ✅ Frontend đang chạy trên port 5173
) else (
    echo ❌ Frontend chưa chạy
    echo 💡 Hãy chạy: npm run dev
    echo.
    pause
    exit
)

echo.
echo 🔍 Checking Backend (Port 3001)...
netstat -an | findstr :3001 >nul
if %errorlevel% equ 0 (
    echo ✅ Backend đang chạy trên port 3001
) else (
    echo ❌ Backend chưa chạy
    echo 💡 Hãy chạy: cd backend ^&^& npm start
    echo.
    pause
    exit
)

echo.
echo 📋 BƯỚC 2: Khởi động ngrok cho cả Frontend và Backend
echo.

echo 🌐 Đang share Frontend port 5173...
start /b ngrok http 5173

echo ⏳ Đợi 3 giây để ngrok khởi động...
timeout /t 3 /nobreak >nul

echo.
echo 🔧 Đang share Backend port 3001...
start /b ngrok http 3001

echo ⏳ Đợi 3 giây để ngrok khởi động...
timeout /t 3 /nobreak >nul

echo.
echo 📋 BƯỚC 3: Lấy Public URLs
echo.

echo 🔍 Đang lấy URLs từ ngrok dashboard...
timeout /t 2 /nobreak >nul

echo.
echo 🌐 Truy cập ngrok dashboard: http://localhost:4040
echo 📱 Hoặc xem trong cửa sổ ngrok đã mở
echo.

echo 📋 BƯỚC 4: Cấu hình Frontend để sử dụng Backend URL
echo.

echo ⚠️  QUAN TRỌNG: Sau khi có URLs, bạn cần:
echo.
echo 1️⃣ Copy Backend URL (dạng: https://xxx.ngrok.io)
echo 2️⃣ Mở file: src/services/movieApi.js
echo 3️⃣ Thay đổi baseURL thành Backend URL
echo 4️⃣ Hoặc sử dụng environment variable
echo.

echo 📖 Xem hướng dẫn chi tiết: FULL_STACK_SETUP.md
echo.

echo 🎯 Kết quả:
echo ✅ Frontend URL: https://xxx.ngrok.io (cho người dùng)
echo ✅ Backend URL: https://yyy.ngrok.io (cho API)
echo ✅ Cả hai đều hoạt động đầy đủ
echo.

echo Press any key để dừng ngrok...
pause

echo.
echo 🛑 Đang dừng ngrok...
taskkill /f /im ngrok.exe 2>nul

echo.
echo 👋 Đã dừng ngrok
pause
