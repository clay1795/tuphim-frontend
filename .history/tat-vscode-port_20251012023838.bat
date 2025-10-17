@echo off
echo 🛑 Tắt VS Code Port Forwarding hoàn toàn
echo ========================================
echo.

echo 📋 Đang tắt tất cả VS Code port forwarding processes...
taskkill /f /im "cursor.exe" 2>nul
taskkill /f /im "code.exe" 2>nul
taskkill /f /im "code-tunnel.exe" 2>nul

echo.
echo ✅ Đã tắt tất cả VS Code processes
echo.
echo 🔄 Restart VS Code/Cursor để áp dụng thay đổi
echo.
echo 🚀 Sau khi restart, sử dụng localtunnel thay vì ngrok:
echo    localtunnel --port 5173
echo.

pause
