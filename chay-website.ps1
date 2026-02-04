# Script chạy website và kiểm tra kết nối Supabase
# Cách dùng: Nhấn chuột phải vào file này → Run with PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   CHẠY WEBSITE VÀ KIỂM TRA SUPABASE   " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra Node.js
Write-Host "Bước 1: Kiểm tra Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js đã cài đặt: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Lỗi: Chưa cài đặt Node.js!" -ForegroundColor Red
    Write-Host "Vui lòng cài đặt Node.js từ: https://nodejs.org" -ForegroundColor Yellow
    pause
    exit
}

Write-Host ""

# Di chuyển đến thư mục project
Write-Host "Bước 2: Di chuyển đến thư mục project..." -ForegroundColor Yellow
$projectPath = "C:\Users\ADMIN\.gemini\antigravity\scratch\authentic-luffy"

if (Test-Path $projectPath) {
    Set-Location $projectPath
    Write-Host "✓ Đã vào thư mục: $projectPath" -ForegroundColor Green
} else {
    Write-Host "✗ Lỗi: Không tìm thấy thư mục project!" -ForegroundColor Red
    pause
    exit
}

Write-Host ""

# Kiểm tra file .env
Write-Host "Bước 3: Kiểm tra file cấu hình..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✓ File .env tồn tại" -ForegroundColor Green
    
    # Đọc và hiển thị thông tin (ẩn key)
    $envContent = Get-Content ".env"
    foreach ($line in $envContent) {
        if ($line -match "VITE_SUPABASE_URL=(.+)") {
            Write-Host "  - Supabase URL: $($matches[1])" -ForegroundColor Cyan
        }
        if ($line -match "VITE_SUPABASE_ANON_KEY=(.+)") {
            $key = $matches[1]
            $maskedKey = $key.Substring(0, 20) + "..." + $key.Substring($key.Length - 10)
            Write-Host "  - API Key: $maskedKey" -ForegroundColor Cyan
        }
    }
} else {
    Write-Host "✗ Cảnh báo: Không tìm thấy file .env!" -ForegroundColor Red
    Write-Host "Bạn cần tạo file .env với thông tin Supabase" -ForegroundColor Yellow
}

Write-Host ""

# Kiểm tra node_modules
Write-Host "Bước 4: Kiểm tra dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✓ Dependencies đã được cài đặt" -ForegroundColor Green
} else {
    Write-Host "! Chưa cài đặt dependencies, đang cài đặt..." -ForegroundColor Yellow
    npm install
    Write-Host "✓ Đã cài đặt xong!" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   ĐANG KHỞI ĐỘNG WEBSITE...           " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Website sẽ mở tại: http://localhost:5173" -ForegroundColor Green
Write-Host "Nhấn Ctrl+C để dừng server" -ForegroundColor Yellow
Write-Host ""

# Chạy dev server
npm run dev
