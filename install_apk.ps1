# AgroSync APK Installation Script

Write-Host "=== AgroSync APK Installation ===" -ForegroundColor Green

# Download APK if not present
$apkPath = "$env:USERPROFILE\Downloads\agrosync.apk"
$downloadUrl = "https://expo.dev/artifacts/eas/mu3m5Pgf22Y6smNbd24e3X.apk"

if (!(Test-Path $apkPath)) {
    Write-Host "APK not found in Downloads. Downloading..." -ForegroundColor Yellow
    Write-Host "Download URL: $downloadUrl" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Please manually download the APK from the above URL to:" -ForegroundColor Yellow
    Write-Host "$apkPath" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press any key once you've downloaded the APK..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

if (!(Test-Path $apkPath)) {
    Write-Host "❌ APK still not found. Please download it manually." -ForegroundColor Red
    exit 1
}

# Check device connection
Write-Host "Checking device connection..." -ForegroundColor Yellow
$devices = adb devices
if ($devices -match "device$") {
    Write-Host "✅ Device connected!" -ForegroundColor Green
} else {
    Write-Host "❌ No device connected. Please:" -ForegroundColor Red
    Write-Host "  1. Connect your Android device via USB" -ForegroundColor Yellow
    Write-Host "  2. Enable USB debugging in Developer Options" -ForegroundColor Yellow
    Write-Host "  3. Allow USB debugging when prompted on device" -ForegroundColor Yellow
    exit 1
}

# Uninstall previous version if exists
Write-Host "Uninstalling previous version (if any)..." -ForegroundColor Yellow
adb uninstall com.agrosync.app 2>$null

# Install the APK
Write-Host "Installing AgroSync APK..." -ForegroundColor Green
$result = adb install "$apkPath"

if ($result -match "Success") {
    Write-Host "✅ APK installed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎯 Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Run: start_debug_capture.ps1" -ForegroundColor White
    Write-Host "  2. When prompted, reproduce the crash on your device" -ForegroundColor White
    Write-Host "  3. Run: collect_crash_logs.ps1" -ForegroundColor White
} else {
    Write-Host "❌ Installation failed!" -ForegroundColor Red
    Write-Host "Error: $result" -ForegroundColor Red
}