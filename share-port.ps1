# TupPhim Port Sharing Script
# Usage: .\share-port.ps1 [frontend|backend|both]

param(
    [string]$Port = "frontend"
)

Write-Host "🚀 TupPhim Port Sharing Tool" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Check if ngrok is installed
try {
    $ngrokVersion = ngrok version 2>$null
    Write-Host "✅ Ngrok found: $ngrokVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Ngrok not found. Installing..." -ForegroundColor Red
    npm install -g ngrok
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Ngrok installed successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install ngrok" -ForegroundColor Red
        exit 1
    }
}

# Function to start ngrok for a specific port
function Start-NgrokPort {
    param(
        [int]$Port,
        [string]$Name
    )
    
    Write-Host "🌐 Starting $Name port sharing (Port: $Port)..." -ForegroundColor Yellow
    Write-Host "📱 This will create a public URL that works on any device" -ForegroundColor Cyan
    
    # Start ngrok in background
    $ngrokProcess = Start-Process -FilePath "ngrok" -ArgumentList "http", $Port -PassThru -WindowStyle Hidden
    
    # Wait a moment for ngrok to start
    Start-Sleep -Seconds 3
    
    # Try to get the public URL from ngrok API
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -TimeoutSec 5
        if ($response.tunnels) {
            $publicUrl = $response.tunnels[0].public_url
            Write-Host "🔗 Public URL for $Name: $publicUrl" -ForegroundColor Green
            Write-Host "📋 Copy this URL to share with others" -ForegroundColor Cyan
        }
    } catch {
        Write-Host "⚠️  Could not retrieve public URL automatically" -ForegroundColor Yellow
        Write-Host "🌐 Check http://localhost:4040 for the ngrok dashboard" -ForegroundColor Cyan
    }
    
    return $ngrokProcess
}

# Main execution
switch ($Port.ToLower()) {
    "frontend" {
        Write-Host "🎬 Sharing Frontend Port (5173)" -ForegroundColor Blue
        $process = Start-NgrokPort -Port 5173 -Name "Frontend"
        
        Write-Host "`n📖 Instructions:" -ForegroundColor White
        Write-Host "1. Make sure your frontend is running: npm run dev" -ForegroundColor Gray
        Write-Host "2. The public URL above will forward to your local frontend" -ForegroundColor Gray
        Write-Host "3. Press Ctrl+C to stop sharing" -ForegroundColor Gray
    }
    
    "backend" {
        Write-Host "🔧 Sharing Backend Port (3001)" -ForegroundColor Blue
        $process = Start-NgrokPort -Port 3001 -Name "Backend"
        
        Write-Host "`n📖 Instructions:" -ForegroundColor White
        Write-Host "1. Make sure your backend is running: cd backend && npm start" -ForegroundColor Gray
        Write-Host "2. The public URL above will forward to your local backend API" -ForegroundColor Gray
        Write-Host "3. Press Ctrl+C to stop sharing" -ForegroundColor Gray
    }
    
    "both" {
        Write-Host "🚀 Sharing Both Frontend and Backend Ports" -ForegroundColor Blue
        Write-Host "Frontend: Port 5173" -ForegroundColor Cyan
        Write-Host "Backend: Port 3001" -ForegroundColor Cyan
        
        $frontendProcess = Start-NgrokPort -Port 5173 -Name "Frontend"
        Start-Sleep -Seconds 2
        $backendProcess = Start-NgrokPort -Port 3001 -Name "Backend"
        
        Write-Host "`n📖 Instructions:" -ForegroundColor White
        Write-Host "1. Make sure both frontend (npm run dev) and backend (cd backend && npm start) are running" -ForegroundColor Gray
        Write-Host "2. Use the frontend URL to access your app" -ForegroundColor Gray
        Write-Host "3. The backend URL is for API access" -ForegroundColor Gray
        Write-Host "4. Press Ctrl+C to stop sharing" -ForegroundColor Gray
        
        # Wait for user to stop
        try {
            while ($true) {
                Start-Sleep -Seconds 1
            }
        } finally {
            Write-Host "`n🛑 Stopping port sharing..." -ForegroundColor Yellow
            $frontendProcess.Kill()
            $backendProcess.Kill()
        }
    }
    
    default {
        Write-Host "❌ Invalid option: $Port" -ForegroundColor Red
        Write-Host "`n📖 Usage: .\share-port.ps1 [frontend|backend|both]" -ForegroundColor White
        Write-Host "`nExamples:" -ForegroundColor Cyan
        Write-Host "  .\share-port.ps1 frontend  # Share frontend port (5173)" -ForegroundColor Gray
        Write-Host "  .\share-port.ps1 backend   # Share backend port (3001)" -ForegroundColor Gray
        Write-Host "  .\share-port.ps1 both      # Share both ports" -ForegroundColor Gray
        Write-Host "  .\share-port.ps1           # Default: share frontend port" -ForegroundColor Gray
    }
}

# Keep the script running if not 'both' mode
if ($Port.ToLower() -ne "both") {
    Write-Host "`n⏳ Press Ctrl+C to stop sharing..." -ForegroundColor Yellow
    try {
        while ($true) {
            Start-Sleep -Seconds 1
        }
    } finally {
        if ($process) {
            Write-Host "`n🛑 Stopping port sharing..." -ForegroundColor Yellow
            $process.Kill()
        }
    }
}

