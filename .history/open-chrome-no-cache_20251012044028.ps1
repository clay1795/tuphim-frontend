# Script để mở Chrome không cache và tự động reset dữ liệu khi tắt
# Tác giả: AI Assistant
# Mô tả: Script này sẽ mở Chrome với profile tạm thời, không lưu cache, cookies, history

param(
    [string]$Url = "https://www.google.com",
    [switch]$Incognito = $true
)

# Đường dẫn đến Chrome (thay đổi nếu cần)
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$chromePathAlt = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"

# Kiểm tra Chrome có tồn tại không
if (-not (Test-Path $chromePath)) {
    if (Test-Path $chromePathAlt) {
        $chromePath = $chromePathAlt
    } else {
        Write-Host "Không tìm thấy Google Chrome!" -ForegroundColor Red
        Write-Host "Vui lòng cài đặt Chrome hoặc kiểm tra đường dẫn." -ForegroundColor Yellow
        exit 1
    }
}

# Tạo thư mục tạm thời cho profile
$tempProfileDir = Join-Path $env:TEMP "ChromeTempProfile_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Path $tempProfileDir -Force | Out-Null

Write-Host "Đang mở Chrome với profile tạm thời..." -ForegroundColor Green
Write-Host "Profile tạm thời: $tempProfileDir" -ForegroundColor Cyan
Write-Host "URL: $Url" -ForegroundColor Cyan

# Tham số để mở Chrome không cache
$chromeArgs = @(
    "--user-data-dir=`"$tempProfileDir`""
    "--no-first-run"
    "--no-default-browser-check"
    "--disable-default-apps"
    "--disable-extensions"
    "--disable-plugins"
    "--disable-background-timer-throttling"
    "--disable-backgrounding-occluded-windows"
    "--disable-renderer-backgrounding"
    "--disable-features=TranslateUI"
    "--disable-ipc-flooding-protection"
    "--aggressive-cache-discard"
    "--clear-token-service"
    "--clear-token-service"
    "--disable-background-networking"
    "--disable-component-extensions-with-background-pages"
    "--disable-domain-reliability"
    "--disable-features=VizDisplayCompositor"
    "--disable-sync"
    "--disable-web-security"
    "--disable-features=site-per-process"
    "--no-sandbox"
)

# Thêm incognito mode nếu được yêu cầu
if ($Incognito) {
    $chromeArgs += "--incognito"
}

# Thêm URL
$chromeArgs += $Url

try {
    # Mở Chrome với các tham số đã định
    $chromeProcess = Start-Process -FilePath $chromePath -ArgumentList $chromeArgs -PassThru
    
    Write-Host "Chrome đã được mở với PID: $($chromeProcess.Id)" -ForegroundColor Green
    Write-Host "Chờ Chrome đóng..." -ForegroundColor Yellow
    
    # Chờ cho đến khi Chrome đóng
    $chromeProcess.WaitForExit()
    
    Write-Host "Chrome đã đóng. Đang dọn dẹp dữ liệu tạm thời..." -ForegroundColor Yellow
    
} catch {
    Write-Host "Lỗi khi mở Chrome: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    # Dọn dẹp thư mục profile tạm thời
    if (Test-Path $tempProfileDir) {
        try {
            Remove-Item -Path $tempProfileDir -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "Đã xóa dữ liệu tạm thời thành công!" -ForegroundColor Green
        } catch {
            Write-Host "Không thể xóa một số file tạm thời, nhưng dữ liệu sẽ không được lưu lại." -ForegroundColor Yellow
        }
    }
}

Write-Host "Hoàn thành!" -ForegroundColor Green
Write-Host "Chrome đã được đóng và tất cả dữ liệu tạm thời đã được xóa." -ForegroundColor Cyan

# Tạm dừng để người dùng có thể đọc thông báo
Read-Host "Nhấn Enter để thoát"
