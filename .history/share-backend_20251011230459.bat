@echo off
echo 🔧 TupPhim Backend Port Sharing  
echo ================================
echo.
echo Starting ngrok for backend (port 3001)...
echo.
echo 📱 This will create a public URL that works on any device
echo 🔗 The URL will be displayed below
echo.
echo Press Ctrl+C to stop sharing
echo.

ngrok http 3001

pause
