@echo off
echo 🚀 Testing ngrok for TupPhim
echo ============================
echo.

echo 📋 Step 1: Testing ngrok installation...
ngrok version
if %errorlevel% neq 0 (
    echo ❌ Ngrok not working properly
    echo 🔧 Trying to fix...
    npm install -g ngrok@latest
    goto :end
)

echo ✅ Ngrok is working!
echo.

echo 📋 Step 2: Starting ngrok for frontend (port 5173)...
echo.
echo 🌐 This will create a public URL that you can share
echo 📱 The URL will work on any device with internet
echo.
echo ⚠️  Make sure your frontend is running first:
echo    npm run dev
echo.
echo Press any key to start ngrok...
pause >nul

echo.
echo 🚀 Starting ngrok...
ngrok http 5173

:end
echo.
echo Press any key to exit...
pause >nul
