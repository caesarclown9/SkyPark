# Sky Park - Setup Development Environment
# Скрипт для настройки среды разработки на Windows

param(
    [switch]$SkipInstall,
    [switch]$ResetDatabase,
    [switch]$SeedData
)

Write-Host "🚀 Sky Park - Настройка среды разработки" -ForegroundColor Cyan
Write-Host "=" * 50

# Проверка Node.js
Write-Host "🔍 Проверка Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js найден: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js не найден. Установите Node.js 18+ из https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Проверка Go
Write-Host "🔍 Проверка Go..." -ForegroundColor Yellow
try {
    $goVersion = go version
    Write-Host "✅ Go найден: $goVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Go не найден. Установите Go 1.22+ из https://golang.org" -ForegroundColor Red
    exit 1
}

# Проверка PostgreSQL
Write-Host "🔍 Проверка PostgreSQL..." -ForegroundColor Yellow
try {
    $pgVersion = psql --version
    Write-Host "✅ PostgreSQL найден: $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️ PostgreSQL не найден. Рекомендуется установить PostgreSQL 14+" -ForegroundColor Yellow
    Write-Host "   Альтернативно можно использовать Docker Compose" -ForegroundColor Yellow
}

# Установка зависимостей
if (-not $SkipInstall) {
    Write-Host "📦 Установка зависимостей..." -ForegroundColor Yellow
    
    # Root dependencies
    Write-Host "   Корневые зависимости..." -ForegroundColor Gray
    npm install
    
    # Frontend dependencies
    Write-Host "   Frontend зависимости..." -ForegroundColor Gray
    Set-Location "apps/web"
    npm install
    Set-Location "../.."
    
    # Go dependencies
    Write-Host "   Backend зависимости..." -ForegroundColor Gray
    Set-Location "apps/api"
    go mod tidy
    go mod download
    Set-Location "../.."
    
    Write-Host "✅ Зависимости установлены" -ForegroundColor Green
}

# Настройка переменных окружения
Write-Host "🔧 Настройка переменных окружения..." -ForegroundColor Yellow

if (-not (Test-Path ".env")) {
    if (Test-Path "env.example") {
        Copy-Item "env.example" ".env"
        Write-Host "✅ Файл .env создан из env.example" -ForegroundColor Green
        Write-Host "⚠️ Проверьте и настройте переменные в .env файле" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Файл env.example не найден" -ForegroundColor Red
    }
}

# Создание .env для web приложения
$webEnvPath = "apps/web/.env.local"
if (-not (Test-Path $webEnvPath)) {
    @"
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENVIRONMENT=development
"@ | Out-File -FilePath $webEnvPath -Encoding UTF8
    Write-Host "✅ Файл apps/web/.env.local создан" -ForegroundColor Green
}

# Создание .env для API
$apiEnvPath = "apps/api/.env"
if (-not (Test-Path $apiEnvPath)) {
    @"
APP_ENV=development
PORT=8080
JWT_SECRET=skypark-super-secret-key-for-development-only

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=skypark_dev
DB_USER=postgres
DB_PASSWORD=password
DB_SSLMODE=disable

# Redis
REDIS_URL=redis://localhost:6379

# SMS (development)
SMS_PROVIDER=mock
SMS_API_KEY=your-sms-api-key

# File uploads
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE=10485760
"@ | Out-File -FilePath $apiEnvPath -Encoding UTF8
    Write-Host "✅ Файл apps/api/.env создан" -ForegroundColor Green
}

# Запуск Docker Compose (если есть)
if (Test-Path "docker-compose.yml") {
    Write-Host "🐳 Запуск Docker services..." -ForegroundColor Yellow
    try {
        docker-compose up -d postgres redis
        Write-Host "✅ Docker services запущены" -ForegroundColor Green
        Start-Sleep -Seconds 5
    } catch {
        Write-Host "⚠️ Не удалось запустить Docker services" -ForegroundColor Yellow
        Write-Host "   Убедитесь, что Docker установлен и запущен" -ForegroundColor Gray
    }
}

# Миграции базы данных
if ($ResetDatabase) {
    Write-Host "🗄️ Сброс базы данных..." -ForegroundColor Yellow
    Set-Location "apps/api"
    try {
        go run cmd/migrate/main.go down
        go run cmd/migrate/main.go up
        Write-Host "✅ База данных сброшена" -ForegroundColor Green
    } catch {
        Write-Host "❌ Ошибка миграций базы данных" -ForegroundColor Red
    }
    Set-Location "../.."
}

# Заполнение тестовыми данными
if ($SeedData) {
    Write-Host "🌱 Заполнение тестовыми данными..." -ForegroundColor Yellow
    Set-Location "apps/api"
    try {
        go run cmd/seed/main.go
        Write-Host "✅ Тестовые данные добавлены" -ForegroundColor Green
    } catch {
        Write-Host "❌ Ошибка заполнения данными" -ForegroundColor Red
    }
    Set-Location "../.."
}

Write-Host ""
Write-Host "🎉 Настройка завершена!" -ForegroundColor Green
Write-Host ""
Write-Host "Для запуска проекта используйте:" -ForegroundColor Cyan
Write-Host "  .\scripts\dev-start.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Полезные команды:" -ForegroundColor Cyan
Write-Host "  .\scripts\dev-stop.ps1      - Остановить все сервисы" -ForegroundColor White
Write-Host "  .\scripts\dev-reset.ps1     - Сбросить базу данных" -ForegroundColor White
Write-Host "  .\scripts\dev-test.ps1      - Запустить тесты" -ForegroundColor White
Write-Host "  .\scripts\dev-build.ps1     - Собрать проект" -ForegroundColor White 
 