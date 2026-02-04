@echo off
chcp 65001 >nul
title Chạy Website - Kết Nối Supabase

echo ========================================
echo    CHẠY WEBSITE VÀ KIỂM TRA SUPABASE
echo ========================================
echo.

echo Bước 1: Kiểm tra Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Lỗi: Chưa cài đặt Node.js!
    echo Vui lòng cài đặt Node.js từ: https://nodejs.org
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [✓] Node.js đã cài đặt: %NODE_VERSION%
echo.

echo Bước 2: Di chuyển đến thư mục project...
cd /d "C:\Users\ADMIN\.gemini\antigravity\scratch\authentic-luffy"
if %errorlevel% neq 0 (
    echo [X] Lỗi: Không tìm thấy thư mục project!
    pause
    exit /b 1
)
echo [✓] Đã vào thư mục project
echo.

echo Bước 3: Kiểm tra file cấu hình...
if exist ".env" (
    echo [✓] File .env tồn tại
) else (
    echo [!] Cảnh báo: Không tìm thấy file .env
)
echo.

echo Bước 4: Kiểm tra dependencies...
if exist "node_modules" (
    echo [✓] Dependencies đã được cài đặt
) else (
    echo [!] Chưa cài đặt dependencies, đang cài đặt...
    call npm install
    echo [✓] Đã cài đặt xong!
)
echo.

echo ========================================
echo    ĐANG KHỞI ĐỘNG WEBSITE...
echo ========================================
echo.
echo Website sẽ mở tại: http://localhost:5173
echo Nhấn Ctrl+C để dừng server
echo.

npm run dev

pause
