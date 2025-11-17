# AgroSync Debug Capture Script
# Run this BEFORE reproducing the crash

Write-Host "=== AgroSync Debug Capture Starting ===" -ForegroundColor Green

# Check if device is connected
Write-Host "Checking device connection..." -ForegroundColor Yellow
$devices = adb devices
if ($devices -match "device$") {
    Write-Host "✅ Device connected!" -ForegroundColor Green
} else {
    Write-Host "❌ No device connected. Please connect your Android device with USB debugging enabled." -ForegroundColor Red
    exit 1
}

# Create temp directory
$tempDir = "C:\temp"
if (!(Test-Path $tempDir)) {
    New-Item -ItemType Directory -Path $tempDir
    Write-Host "Created temp directory: $tempDir" -ForegroundColor Green
}

# Clear previous logs
Write-Host "Clearing previous logcat entries..." -ForegroundColor Yellow
adb logcat -c

# Start capturing logs
$logFile = "C:\temp\agrosync_crash_$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss').txt"
Write-Host "Starting log capture..." -ForegroundColor Green
Write-Host "Log file: $logFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔥 NOW REPRODUCE THE CRASH ON YOUR DEVICE!" -ForegroundColor Red -BackgroundColor Yellow
Write-Host "   1. Open AgroSync app on your device" -ForegroundColor Yellow
Write-Host "   2. Navigate to login screen" -ForegroundColor Yellow
Write-Host "   3. Enter credentials and tap Login" -ForegroundColor Yellow
Write-Host "   4. Wait for crash to occur" -ForegroundColor Yellow
Write-Host "   5. Press Ctrl+C here to stop capture" -ForegroundColor Yellow
Write-Host ""

# Capture logs (this will run until Ctrl+C)
adb logcat > $logFile

Write-Host ""
Write-Host "✅ Log capture stopped!" -ForegroundColor Green
Write-Host "Logs saved to: $logFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next: Run collect_crash_logs.ps1 to get additional information" -ForegroundColor Yellow