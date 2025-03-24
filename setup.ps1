# First remove existing venv if it exists
if (Test-Path "venv") {
    Write-Host "Removing existing virtual environment..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force venv
}

# Allow script execution and run as admin if needed
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Warning "You do not have Administrator rights to create virtual environment!"
    Write-Host "Please run as Administrator" -ForegroundColor Red
    exit 1
}

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Setup Python environment
Write-Host "Setting up Python environment..." -ForegroundColor Cyan

# Create virtual environment
python -m venv venv
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to create virtual environment" -ForegroundColor Red
    exit 1
}

# Activate virtual environment
.\venv\Scripts\Activate
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to activate virtual environment" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Cyan
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Install SpaCy model
Write-Host "Installing SpaCy model..." -ForegroundColor Cyan
python -m spacy download en_core_web_sm
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to download SpaCy model" -ForegroundColor Red
    exit 1
}

Write-Host "Setup complete! ✅" -ForegroundColor Green
Write-Host "To start the server:"
Write-Host "1. Activate the environment: .\venv\Scripts\Activate" -ForegroundColor Yellow
Write-Host "2. Start the server: node server.js" -ForegroundColor Yellow
