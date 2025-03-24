Write-Host "Cleaning up environment..." -ForegroundColor Cyan

# Kill processes on ports 8000 and 8001
$ports = @(8000, 8001)
foreach ($port in $ports) {
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
    if ($process) {
        Stop-Process -Id $process -Force
        Write-Host "Killed process using port $port" -ForegroundColor Green
    }
}

# Deactivate venv if active
if ($env:VIRTUAL_ENV) {
    deactivate
    Write-Host "Deactivated virtual environment" -ForegroundColor Green
}

Write-Host "Cleanup complete! ✅" -ForegroundColor Green
