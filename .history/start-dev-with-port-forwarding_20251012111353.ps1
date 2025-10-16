# TupPhim Development Server with Port Forwarding Support
# This script starts both frontend and backend servers optimized for VS Code Port Forwarding

Write-Host "🚀 Starting TupPhim Development Environment..." -ForegroundColor Green
Write-Host "📱 Optimized for VS Code Port Forwarding and Mobile Access" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please install npm first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔧 Installing dependencies..." -ForegroundColor Yellow

# Install frontend dependencies
Write-Host "📦 Installing frontend dependencies..."
Set-Location $PSScriptRoot
npm install

# Install backend dependencies
Write-Host "📦 Installing backend dependencies..."
Set-Location backend
npm install
Set-Location ..

Write-Host ""
Write-Host "🌐 Starting servers with port forwarding support..." -ForegroundColor Green
Write-Host ""
Write-Host "📋 Instructions for VS Code Port Forwarding:" -ForegroundColor Cyan
Write-Host "   1. Open VS Code Command Palette (Ctrl+Shift+P)" -ForegroundColor White
Write-Host "   2. Type 'Ports: Focus on Ports View'" -ForegroundColor White
Write-Host "   3. Add ports: 3001 (Backend) and 5173 (Frontend)" -ForegroundColor White
Write-Host "   4. Set port visibility to 'Public' for mobile access" -ForegroundColor White
Write-Host "   5. Copy the forwarded URLs to access from mobile devices" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Default URLs:" -ForegroundColor Yellow
Write-Host "   Backend API: http://localhost:3001" -ForegroundColor White
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host ""

# Start the development servers
try {
    node scripts/start-dev-servers.js
} catch {
    Write-Host "❌ Failed to start servers. Please check the error messages above." -ForegroundColor Red
    exit 1
}
