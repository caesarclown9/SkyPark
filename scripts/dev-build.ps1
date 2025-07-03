# Sky Park - Build Project
# Скрипт для сборки проекта в production режиме

param(
    [switch]$Frontend,
    [switch]$Backend,
    [switch]$Clean,
    [switch]$Test,
    [string]$Environment = "production"
)

# Если не указаны флаги, собираем все
if (-not ($Frontend -or $Backend)) {
    $Frontend = $true
    $Backend = $true
}

Write-Host "🏗️ Sky Park - Сборка проекта" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Gray
Write-Host "=" * 50

# Очистка предыдущих сборок
if ($Clean) {
    Write-Host "🧹 Очистка предыдущих сборок..." -ForegroundColor Yellow
    
    $cleanDirs = @(
        "apps/web/.next",
        "apps/web/out",
        "apps/api/bin",
        "apps/api/dist",
        "dist",
        "build"
    )
    
    foreach ($dir in $cleanDirs) {
        if (Test-Path $dir) {
            Remove-Item $dir -Recurse -Force
            Write-Host "   Удален: $dir" -ForegroundColor Gray
        }
    }
    
    Write-Host "✅ Очистка завершена" -ForegroundColor Green
}

# Проверка переменных окружения
Write-Host "🔧 Проверка конфигурации..." -ForegroundColor Yellow

if ($Environment -eq "production") {
    # Проверяем обязательные переменные для production
    $requiredEnvVars = @(
        "DATABASE_URL",
        "JWT_SECRET",
        "NEXT_PUBLIC_API_URL"
    )
    
    $missingVars = @()
    foreach ($var in $requiredEnvVars) {
        if (-not (Get-ChildItem Env: | Where-Object Name -eq $var)) {
            $missingVars += $var
        }
    }
    
    if ($missingVars.Count -gt 0) {
        Write-Host "❌ Отсутствуют обязательные переменные окружения:" -ForegroundColor Red
        $missingVars | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
        Write-Host "   Настройте переменные окружения или используйте .env файлы" -ForegroundColor Gray
        exit 1
    }
}

Write-Host "✅ Конфигурация проверена" -ForegroundColor Green

# Запуск тестов (если указано)
if ($Test) {
    Write-Host "🧪 Запуск тестов..." -ForegroundColor Yellow
    
    # Frontend тесты
    if ($Frontend) {
        Write-Host "   Frontend тесты..." -ForegroundColor Gray
        Set-Location "apps/web"
        try {
            npm run test:ci
            Write-Host "   ✅ Frontend тесты пройдены" -ForegroundColor Green
        } catch {
            Write-Host "   ❌ Frontend тесты провалены" -ForegroundColor Red
            Set-Location "../.."
            exit 1
        }
        Set-Location "../.."
    }
    
    # Backend тесты
    if ($Backend) {
        Write-Host "   Backend тесты..." -ForegroundColor Gray
        Set-Location "apps/api"
        try {
            go test ./... -v
            Write-Host "   ✅ Backend тесты пройдены" -ForegroundColor Green
        } catch {
            Write-Host "   ❌ Backend тесты провалены" -ForegroundColor Red
            Set-Location "../.."
            exit 1
        }
        Set-Location "../.."
    }
}

# Сборка Backend
if ($Backend) {
    Write-Host "🏗️ Сборка Backend..." -ForegroundColor Yellow
    
    Set-Location "apps/api"
    
    # Создание директории для бинарников
    if (-not (Test-Path "bin")) {
        New-Item -ItemType Directory -Path "bin" | Out-Null
    }
    
    try {
        # Сборка основного API сервера
        Write-Host "   Сборка API сервера..." -ForegroundColor Gray
        $env:GOOS = "windows"
        $env:GOARCH = "amd64"
        $env:CGO_ENABLED = "0"
        
        go build -ldflags "-w -s" -o "bin/skypark-api.exe" "./cmd/api"
        
        # Сборка утилит миграций
        Write-Host "   Сборка утилиты миграций..." -ForegroundColor Gray
        go build -ldflags "-w -s" -o "bin/skypark-migrate.exe" "./cmd/migrate"
        
        # Сборка утилиты заполнения данными
        Write-Host "   Сборка утилиты seed..." -ForegroundColor Gray
        go build -ldflags "-w -s" -o "bin/skypark-seed.exe" "./cmd/seed"
        
        Write-Host "✅ Backend собран успешно" -ForegroundColor Green
        
        # Информация о бинарниках
        Get-ChildItem "bin/*.exe" | ForEach-Object {
            $size = [math]::Round($_.Length / 1MB, 2)
            Write-Host "   📦 $($_.Name): ${size} MB" -ForegroundColor Gray
        }
        
    } catch {
        Write-Host "❌ Ошибка сборки Backend" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        Set-Location "../.."
        exit 1
    }
    
    Set-Location "../.."
}

# Сборка Frontend
if ($Frontend) {
    Write-Host "🎨 Сборка Frontend..." -ForegroundColor Yellow
    
    Set-Location "apps/web"
    
    try {
        # Установка зависимостей (если нужно)
        if (-not (Test-Path "node_modules")) {
            Write-Host "   Установка зависимостей..." -ForegroundColor Gray
            npm ci
        }
        
        # Сборка Next.js приложения
        Write-Host "   Сборка Next.js приложения..." -ForegroundColor Gray
        $env:NODE_ENV = $Environment
        
        if ($Environment -eq "production") {
            npm run build
        } else {
            npm run build:dev
        }
        
        # Статистика сборки
        if (Test-Path ".next") {
            $buildSize = (Get-ChildItem ".next" -Recurse | Measure-Object -Property Length -Sum).Sum
            $buildSizeMB = [math]::Round($buildSize / 1MB, 2)
            Write-Host "   📦 Размер сборки: ${buildSizeMB} MB" -ForegroundColor Gray
        }
        
        Write-Host "✅ Frontend собран успешно" -ForegroundColor Green
        
    } catch {
        Write-Host "❌ Ошибка сборки Frontend" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        Set-Location "../.."
        exit 1
    }
    
    Set-Location "../.."
}

# Создание архива для деплоя (если production)
if ($Environment -eq "production") {
    Write-Host "📦 Создание архива для деплоя..." -ForegroundColor Yellow
    
    $deployDir = "deploy-$(Get-Date -Format 'yyyy-MM-dd-HHmm')"
    New-Item -ItemType Directory -Path $deployDir | Out-Null
    
    # Копирование файлов
    if ($Frontend -and (Test-Path "apps/web/.next")) {
        Copy-Item "apps/web/.next" "$deployDir/web" -Recurse
        Copy-Item "apps/web/public" "$deployDir/web/public" -Recurse -ErrorAction SilentlyContinue
        Copy-Item "apps/web/package.json" "$deployDir/web/" -ErrorAction SilentlyContinue
    }
    
    if ($Backend -and (Test-Path "apps/api/bin")) {
        Copy-Item "apps/api/bin" "$deployDir/api" -Recurse
        Copy-Item "apps/api/migrations" "$deployDir/api/migrations" -Recurse -ErrorAction SilentlyContinue
    }
    
    # Создание архива
    try {
        Compress-Archive -Path "$deployDir/*" -DestinationPath "$deployDir.zip" -Force
        Remove-Item $deployDir -Recurse -Force
        
        $archiveSize = [math]::Round((Get-Item "$deployDir.zip").Length / 1MB, 2)
        Write-Host "✅ Архив создан: $deployDir.zip (${archiveSize} MB)" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Не удалось создать архив" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🎉 Сборка завершена успешно!" -ForegroundColor Green
Write-Host ""

if ($Backend) {
    Write-Host "Backend бинарники:" -ForegroundColor Cyan
    Write-Host "  apps/api/bin/skypark-api.exe     - Основной API сервер" -ForegroundColor White
    Write-Host "  apps/api/bin/skypark-migrate.exe - Утилита миграций" -ForegroundColor White
    Write-Host "  apps/api/bin/skypark-seed.exe    - Утилита заполнения данными" -ForegroundColor White
}

if ($Frontend) {
    Write-Host "Frontend сборка:" -ForegroundColor Cyan
    Write-Host "  apps/web/.next/  - Собранное Next.js приложение" -ForegroundColor White
}

Write-Host ""
Write-Host "Для запуска в production:" -ForegroundColor Cyan
Write-Host "  # Backend" -ForegroundColor Gray
Write-Host "  cd apps/api && ./bin/skypark-api.exe" -ForegroundColor White
Write-Host "  # Frontend" -ForegroundColor Gray
Write-Host "  cd apps/web && npm start" -ForegroundColor White 
 