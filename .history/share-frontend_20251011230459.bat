@echo off
echo 🚀 TupPhim Frontend Port Sharing
echo ================================
echo.
echo Starting ngrok for frontend (port 5173)...
echo.
echo 📱 This will create a public URL that works on any device
echo 🔗 The URL will be displayed below
echo.
echo Press Ctrl+C to stop sharing
echo.

ngrok http 5173

pause
