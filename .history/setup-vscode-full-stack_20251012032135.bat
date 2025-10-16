@echo off
echo 🌐 VS Code Port Forwarding - Full-Stack TupPhim
echo ===============================================
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
echo 📋 BƯỚC 2: Hướng dẫn VS Code Port Forwarding
echo.

echo 🌐 Mở VS Code và làm theo các bước sau:
echo.
echo 1️⃣ Click vào tab "Ports" ở bottom panel
echo    (Hoặc nhấn Ctrl+Shift+P, gõ: Ports: Focus on Ports View)
echo.
echo 2️⃣ Click "Forward a Port" button
echo    Nhập port: 5173 (Frontend)
echo    Chọn "Public" để share với internet
echo    Copy URL: https://xxx-5173.app.github.dev
echo.
echo 3️⃣ Click "Forward a Port" button lần nữa
echo    Nhập port: 3001 (Backend)
echo    Chọn "Public" để share với internet
echo    Copy URL: https://yyy-3001.app.github.dev
echo.

echo 📋 BƯỚC 3: Cấu hình Frontend sử dụng Backend URL
echo.

echo ⚠️  QUAN TRỌNG: Làm theo các bước sau:
echo.
echo 1️⃣ Copy Backend URL (dạng: https://yyy-3001.app.github.dev)
echo 2️⃣ Mở file: src/services/dynamicApi.js
echo 3️⃣ Thay YOUR_BACKEND_VSCODE_URL bằng URL thực tế
echo 4️⃣ Restart frontend: npm run dev
echo.

echo 📖 Xem hướng dẫn chi tiết: VSCODE_FULL_STACK_GUIDE.md
echo.

echo 🎯 Kết quả:
echo ✅ Frontend URL: https://xxx-5173.app.github.dev (cho người dùng)
echo ✅ Backend URL: https://yyy-3001.app.github.dev (cho API)
echo ✅ Full-stack hoạt động đầy đủ
echo.

echo ⚠️  LƯU Ý QUAN TRỌNG:
echo.
echo 🔧 Nếu gặp lỗi "code-tunnel.exe ENOENT":
echo    - Restart VS Code
echo    - Hoặc cài đặt lại VS Code
echo.
echo 🌐 Nếu không có tab "Ports":
echo    - Cài extension "Remote Development"
echo    - Hoặc update VS Code lên phiên bản mới nhất
echo.

echo Press any key để tiếp tục...
pause
