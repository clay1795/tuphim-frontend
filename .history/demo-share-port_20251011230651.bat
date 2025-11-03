@echo off
echo 🎬 TupPhim - Demo Share Port với ngrok
echo =====================================
echo.

echo 📋 Kiểm tra ứng dụng đang chạy...
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
    exit /b 1
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
    exit /b 1
)

echo.
echo 🎯 Chọn port để share:
echo.
echo [1] Frontend (Port 5173) - Cho người dùng cuối
echo [2] Backend (Port 3001) - Cho API access  
echo [3] Cả hai
echo [4] Thoát
echo.
set /p choice="Nhập lựa chọn (1-4): "

if "%choice%"=="1" goto :frontend
if "%choice%"=="2" goto :backend
if "%choice%"=="3" goto :both
if "%choice%"=="4" goto :end
echo ❌ Lựa chọn không hợp lệ
goto :end

:frontend
echo.
echo 🌐 Đang share Frontend port 5173...
echo 📱 URL sẽ hoạt động trên mọi thiết bị
echo.
ngrok http 5173
goto :end

:backend
echo.
echo 🔧 Đang share Backend port 3001...
echo 🔌 URL cho API access
echo.
ngrok http 3001
goto :end

:both
echo.
echo 🚀 Đang share cả Frontend và Backend...
echo.
echo 🌐 Frontend (Port 5173):
start /b ngrok http 5173
timeout /t 3 /nobreak >nul

echo 🔧 Backend (Port 3001):  
start /b ngrok http 3001
echo.
echo ✅ Cả hai ports đã được share!
echo 📊 Dashboard: http://localhost:4040
echo.
echo Press any key to stop sharing...
pause >nul

:end
echo.
echo 👋 Cảm ơn bạn đã sử dụng TupPhim!
echo 📖 Xem thêm: HUONG_DAN_SHARE_PORT.md
pause
