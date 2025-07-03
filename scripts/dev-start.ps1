# Sky Park - Start Development Environment
# Скрипт для запуска всех сервисов в режиме разработки

param(
    [switch]$Frontend,
    [switch]$Backend,
    [switch]$Services,
    [switch]$All
)

# Если не указаны флаги, запускаем все
if (-not ($Frontend -or $Backend -or $Services)) {
    $All = $true
}

Write-Host "🚀 Sky Park - Запуск среды разработки" -ForegroundColor Cyan
Write-Host "=" * 50

# Функция для запуска команды в новом окне PowerShell
function Start-ServiceInNewWindow {
    param(
        [string]$Title,
        [string]$Command,
        [string]$WorkingDirectory = $PWD
    )
    
    $encodedCommand = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($Command))
    
    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-EncodedCommand", $encodedCommand
    ) -WindowStyle Normal
    
    Write-Host "✅ $Title запущен в новом окне" -ForegroundColor Green
}

# Проверка зависимостей
Write-Host "🔍 Проверка зависимостей..." -ForegroundColor Yellow

if (-not (Test-Path "node_modules")) {
    Write-Host "❌ Зависимости не установлены. Запустите .\scripts\dev-setup.ps1" -ForegroundColor Red
    exit 1
}

# Запуск Docker services
if ($Services -or $All) {
    Write-Host "🐳 Запуск вспомогательных сервисов..." -ForegroundColor Yellow
    
    if (Test-Path "docker-compose.yml") {
        try {
            docker-compose up -d postgres redis
            Write-Host "✅ PostgreSQL и Redis запущены" -ForegroundColor Green
            Start-Sleep -Seconds 3
        } catch {
            Write-Host "⚠️ Не удалось запустить Docker services" -ForegroundColor Yellow
            Write-Host "   Убедитесь, что Docker установлен и запущен" -ForegroundColor Gray
        }
    }
}

# Запуск Backend API
if ($Backend -or $All) {
    Write-Host "🏗️ Запуск Backend API..." -ForegroundColor Yellow
    
    $backendCommand = @"
Write-Host '🏗️ Sky Park API Server' -ForegroundColor Cyan
Write-Host 'Переход в apps/api...'
Set-Location 'apps/api'
Write-Host 'Запуск Go сервера...'
go run cmd/api/main.go
"@
    
    Start-ServiceInNewWindow -Title "Sky Park API" -Command $backendCommand
    Start-Sleep -Seconds 2
}

# Запуск Frontend
if ($Frontend -or $All) {
    Write-Host "🎨 Запуск Frontend..." -ForegroundColor Yellow
    
    $frontendCommand = @"
Write-Host '🎨 Sky Park Web App' -ForegroundColor Cyan
Write-Host 'Переход в apps/web...'
Set-Location 'apps/web'
Write-Host 'Запуск Next.js dev server...'
npm run dev
"@
    
    Start-ServiceInNewWindow -Title "Sky Park Web" -Command $frontendCommand
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "🎉 Все сервисы запущены!" -ForegroundColor Green
Write-Host ""
Write-Host "Доступные URL:" -ForegroundColor Cyan
Write-Host "  🌐 Frontend:    http://localhost:3000" -ForegroundColor White
Write-Host "  🏗️ Backend API: http://localhost:8080" -ForegroundColor White
Write-Host "  📊 Health:      http://localhost:8080/health" -ForegroundColor White
Write-Host ""
Write-Host "Логи сервисов отображаются в отдельных окнах PowerShell" -ForegroundColor Yellow
Write-Host ""
Write-Host "Для остановки всех сервисов:" -ForegroundColor Cyan
Write-Host "  .\scripts\dev-stop.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Горячие клавиши в окнах сервисов:" -ForegroundColor Cyan
Write-Host "  Ctrl+C  - Остановить сервис" -ForegroundColor White
Write-Host "  Ctrl+R  - Перезапустить (где поддерживается)" -ForegroundColor White
Write-Host ""

# Ожидание и проверка запуска
Write-Host "⏳ Ожидание запуска сервисов..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Проверка здоровья API
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/health" -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ API сервер работает корректно" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ API сервер еще не готов (может потребоваться время)" -ForegroundColor Yellow
}

# Проверка Frontend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend работает корректно" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Frontend еще не готов (может потребоваться время)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Начинайте разработку! 🚀" -ForegroundColor Green 
 