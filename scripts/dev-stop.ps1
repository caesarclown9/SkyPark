# Sky Park - Stop Development Environment
# Скрипт для остановки всех сервисов разработки

param(
    [switch]$KeepServices,
    [switch]$Force
)

Write-Host "🛑 Sky Park - Остановка среды разработки" -ForegroundColor Cyan
Write-Host "=" * 50

# Остановка Node.js процессов (Next.js)
Write-Host "🎨 Остановка Frontend процессов..." -ForegroundColor Yellow
try {
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
        $_.MainWindowTitle -like "*Next.js*" -or 
        $_.CommandLine -like "*next dev*" -or
        $_.CommandLine -like "*apps/web*"
    }
    
    if ($nodeProcesses) {
        $nodeProcesses | ForEach-Object {
            Write-Host "   Остановка процесса: $($_.Name) (PID: $($_.Id))" -ForegroundColor Gray
            if ($Force) {
                Stop-Process -Id $_.Id -Force
            } else {
                Stop-Process -Id $_.Id
            }
        }
        Write-Host "✅ Frontend процессы остановлены" -ForegroundColor Green
    } else {
        Write-Host "ℹ️ Frontend процессы не найдены" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠️ Ошибка при остановке Frontend процессов" -ForegroundColor Yellow
}

# Остановка Go процессов (API сервер)
Write-Host "🏗️ Остановка Backend процессов..." -ForegroundColor Yellow
try {
    $goProcesses = Get-Process -Name "main" -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -like "*apps/api*" -or
        $_.CommandLine -like "*cmd/api/main.go*"
    }
    
    if (-not $goProcesses) {
        # Попробуем найти по имени go.exe
        $goProcesses = Get-Process -Name "go" -ErrorAction SilentlyContinue | Where-Object {
            $_.CommandLine -like "*run*" -and $_.CommandLine -like "*api*"
        }
    }
    
    if ($goProcesses) {
        $goProcesses | ForEach-Object {
            Write-Host "   Остановка процесса: $($_.Name) (PID: $($_.Id))" -ForegroundColor Gray
            if ($Force) {
                Stop-Process -Id $_.Id -Force
            } else {
                Stop-Process -Id $_.Id
            }
        }
        Write-Host "✅ Backend процессы остановлены" -ForegroundColor Green
    } else {
        Write-Host "ℹ️ Backend процессы не найдены" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠️ Ошибка при остановке Backend процессов" -ForegroundColor Yellow
}

# Остановка процессов на портах 3000 и 8080
Write-Host "🔌 Проверка занятых портов..." -ForegroundColor Yellow

$ports = @(3000, 8080)
foreach ($port in $ports) {
    try {
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($connections) {
            foreach ($conn in $connections) {
                $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
                if ($process) {
                    Write-Host "   Освобождение порта $port (процесс: $($process.Name), PID: $($process.Id))" -ForegroundColor Gray
                    if ($Force) {
                        Stop-Process -Id $process.Id -Force
                    } else {
                        Stop-Process -Id $process.Id
                    }
                }
            }
        }
    } catch {
        Write-Host "   Порт $port свободен" -ForegroundColor Gray
    }
}

# Остановка Docker services (опционально)
if (-not $KeepServices) {
    Write-Host "🐳 Остановка вспомогательных сервисов..." -ForegroundColor Yellow
    
    if (Test-Path "docker-compose.yml") {
        try {
            docker-compose stop
            Write-Host "✅ Docker services остановлены" -ForegroundColor Green
        } catch {
            Write-Host "⚠️ Не удалось остановить Docker services" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "🐳 Вспомогательные сервисы оставлены запущенными" -ForegroundColor Yellow
}

# Очистка временных файлов
Write-Host "🧹 Очистка временных файлов..." -ForegroundColor Yellow

$tempDirs = @(
    "apps/web/.next",
    "apps/api/tmp",
    "node_modules/.cache"
)

foreach ($dir in $tempDirs) {
    if (Test-Path $dir) {
        try {
            Remove-Item $dir -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "   Удален: $dir" -ForegroundColor Gray
        } catch {
            Write-Host "   Не удалось удалить: $dir" -ForegroundColor Yellow
        }
    }
}

# Проверка, что порты свободны
Write-Host "🔍 Финальная проверка портов..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

$ports = @(3000, 8080)
$stillBusy = @()

foreach ($port in $ports) {
    try {
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($connections) {
            $stillBusy += $port
        } else {
            Write-Host "   ✅ Порт $port свободен" -ForegroundColor Green
        }
    } catch {
        Write-Host "   ✅ Порт $port свободен" -ForegroundColor Green
    }
}

if ($stillBusy.Count -gt 0) {
    Write-Host ""
    Write-Host "⚠️ Некоторые порты все еще заняты: $($stillBusy -join ', ')" -ForegroundColor Yellow
    Write-Host "   Попробуйте запустить с флагом -Force для принудительной остановки:" -ForegroundColor Gray
    Write-Host "   .\scripts\dev-stop.ps1 -Force" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "🎉 Все сервисы успешно остановлены!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Для повторного запуска используйте:" -ForegroundColor Cyan
Write-Host "  .\scripts\dev-start.ps1" -ForegroundColor White
Write-Host ""

if ($KeepServices) {
    Write-Host "💡 Для полной остановки (включая Docker):" -ForegroundColor Cyan
    Write-Host "  .\scripts\dev-stop.ps1" -ForegroundColor White
    Write-Host ""
} 
 