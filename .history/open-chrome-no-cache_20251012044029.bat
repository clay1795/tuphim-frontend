@echo off
REM Script đơn giản để mở Chrome không cache và tự reset
REM Tác giả: AI Assistant

echo ================================================
echo   CHROME KHONG CACHE - TU DONG RESET
echo ================================================
echo.

REM Kiểm tra Chrome
set "CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME_PATH%" (
    set "CHROME_PATH=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
)

if not exist "%CHROME_PATH%" (
    echo Loi: Khong tim thay Google Chrome!
    echo Vui long cai dat Chrome hoac kiem tra duong dan.
    pause
    exit /b 1
)

REM Tạo thư mục tạm thời
set "TEMP_PROFILE=%TEMP%\ChromeTemp_%RANDOM%"
mkdir "%TEMP_PROFILE%" 2>nul

echo Dang mo Chrome voi profile tam thoi...
echo Thu muc profile: %TEMP_PROFILE%
echo.

REM Mở Chrome với các tham số không cache
"%CHROME_PATH%" ^
    --user-data-dir="%TEMP_PROFILE%" ^
    --no-first-run ^
    --no-default-browser-check ^
    --disable-default-apps ^
    --disable-extensions ^
    --disable-plugins ^
    --disable-background-timer-throttling ^
    --disable-backgrounding-occluded-windows ^
    --disable-renderer-backgrounding ^
    --disable-features=TranslateUI ^
    --disable-ipc-flooding-protection ^
    --aggressive-cache-discard ^
    --clear-token-service ^
    --disable-background-networking ^
    --disable-component-extensions-with-background-pages ^
    --disable-domain-reliability ^
    --disable-features=VizDisplayCompositor ^
    --disable-sync ^
    --disable-web-security ^
    --disable-features=site-per-process ^
    --no-sandbox ^
    --incognito ^
    https://www.google.com

echo.
echo Chrome da dong. Dang don dep du lieu...

REM Dọn dẹp thư mục tạm thời
if exist "%TEMP_PROFILE%" (
    rmdir /s /q "%TEMP_PROFILE%" 2>nul
    if exist "%TEMP_PROFILE%" (
        echo Canh bao: Khong the xoa het du lieu tam thoi, nhung du lieu se khong duoc luu lai.
    ) else (
        echo Da xoa du lieu tam thoi thanh cong!
    )
)

echo.
echo ================================================
echo   HOAN THANH! Da reset het du lieu.
echo ================================================
pause
