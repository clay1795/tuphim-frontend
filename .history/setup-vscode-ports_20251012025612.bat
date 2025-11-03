@echo off
echo 🌐 Setup VS Code Port Forwarding cho TupPhim
echo ============================================
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
echo.
echo 3️⃣ Click "Forward a Port" button lần nữa
echo    Nhập port: 3001 (Backend)  
echo    Chọn "Public" để share với internet
echo.
echo 4️⃣ Copy 2 public URLs được tạo
echo    - Frontend URL: https://xxx-5173.preview.app.github.dev
echo    - Backend URL: https://xxx-3001.preview.app.github.dev
echo.
echo 5️⃣ Share Frontend URL với bạn bè
echo    Họ mở URL trên điện thoại để sử dụng TupPhim
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

echo 📖 Xem hướng dẫn chi tiết: VSCODE_PORT_FORWARDING_GUIDE.md
echo.

pause
