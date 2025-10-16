@echo off
echo.
echo ========================================
echo   TupPhim Development Server
echo   VS Code Port Forwarding Support
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)

echo Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm not found. Please install npm first.
    pause
    exit /b 1
)

echo.
echo Installing dependencies...
echo Installing frontend dependencies...
call npm install

echo Installing backend dependencies...
cd backend
call npm install
cd ..

echo.
echo Starting development servers...
echo.
echo ========================================
echo   VS Code Port Forwarding Instructions:
echo ========================================
echo.
echo 1. Open VS Code Command Palette (Ctrl+Shift+P)
echo 2. Type: Ports: Focus on Ports View
echo 3. Add ports: 3001 (Backend) and 5173 (Frontend)
echo 4. Set port visibility to 'Public' for mobile access
echo 5. Copy the forwarded URLs to access from mobile
echo.
echo Default URLs:
echo   Backend API: http://localhost:3001
echo   Frontend:    http://localhost:5173
echo.
echo ========================================
echo.

node scripts/start-dev-servers.js

pause
