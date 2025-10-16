@echo off
echo 🚀 Setup ngrok hoàn chỉnh cho TupPhim
echo =====================================
echo.

echo 📋 BƯỚC 1: Đăng ký tài khoản ngrok MIỄN PHÍ
echo.
echo 🌐 Mở trình duyệt và truy cập: https://dashboard.ngrok.com/signup
echo 📧 Đăng ký bằng email (miễn phí)
echo 🔑 Sau khi đăng ký, lấy authtoken từ: https://dashboard.ngrok.com/get-started/your-authtoken
echo.
echo ⏳ Nhấn Enter sau khi đã đăng ký và có authtoken...
pause

echo.
echo 📋 BƯỚC 2: Nhập authtoken
echo.
set /p authtoken="Nhập authtoken của bạn: "

if "%authtoken%"=="" (
    echo ❌ Bạn chưa nhập authtoken!
    echo 🔄 Restart script và nhập lại
    pause
    exit
)

echo.
echo 🔧 Đang cấu hình ngrok với authtoken...
ngrok config add-authtoken %authtoken%

if %errorlevel% equ 0 (
    echo ✅ Đã cấu hình ngrok thành công!
) else (
    echo ❌ Lỗi cấu hình ngrok. Kiểm tra authtoken.
    pause
    exit
)

echo.
echo 📋 BƯỚC 3: Khởi động ngrok
echo.
echo 🌐 Đang share port 5173...
echo 📱 Sẽ tạo URL công khai cho bạn
echo.

ngrok http 5173

echo.
echo 👋 Ngrok đã dừng
pause

