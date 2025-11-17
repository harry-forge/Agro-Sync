# AgroSync Log Collection Script
# Run this AFTER reproducing the crash

Write-Host "=== AgroSync Crash Log Collection ===" -ForegroundColor Green

# Find the most recent crash log
$crashLogs = Get-ChildItem "C:\temp\agrosync_crash_*.txt" | Sort-Object LastWriteTime -Descending
if ($crashLogs.Count -eq 0) {
    Write-Host "❌ No crash logs found in C:\temp\" -ForegroundColor Red
    Write-Host "Please run start_debug_capture.ps1 first" -ForegroundColor Yellow
    exit 1
}

$latestLog = $crashLogs[0].FullName
Write-Host "📄 Latest crash log: $latestLog" -ForegroundColor Cyan

# Check if app is installed
Write-Host "Checking if AgroSync is installed..." -ForegroundColor Yellow
$packages = adb shell pm list packages | Select-String "agro"
if ($packages) {
    $packageName = ($packages -split ":")[1].Trim()
    Write-Host "✅ Found package: $packageName" -ForegroundColor Green
} else {
    Write-Host "❌ AgroSync app not found. Installing APK..." -ForegroundColor Yellow
    
    # Check if APK exists in Downloads
    $apkPath = "$env:USERPROFILE\Downloads\agrosync.apk"
    if (Test-Path $apkPath) {
        Write-Host "Installing APK from Downloads..." -ForegroundColor Yellow
        adb install "$apkPath"
        $packageName = "com.agrosync.app"
    } else {
        Write-Host "❌ APK not found in Downloads. Please download from:" -ForegroundColor Red
        Write-Host "https://expo.dev/artifacts/eas/mu3m5Pgf22Y6smNbd24e3X.apk" -ForegroundColor Cyan
        exit 1
    }
}

# Try to get app's internal error log
Write-Host "Attempting to retrieve internal app error logs..." -ForegroundColor Yellow

# Method 1: Direct access
try {
    $internalLogs = adb shell run-as $packageName cat files/app_error_logs.txt 2>$null
    if ($internalLogs) {
        $internalLogFile = "C:\temp\app_internal_errors.txt"
        $internalLogs | Out-File -FilePath $internalLogFile -Encoding UTF8
        Write-Host "✅ Internal error log saved to: $internalLogFile" -ForegroundColor Green
    } else {
        Write-Host "⚠️  No internal error logs found (app may not have crashed yet)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Could not access internal logs directly" -ForegroundColor Yellow
    
    # Method 2: Copy to accessible location
    try {
        adb shell run-as $packageName cp files/app_error_logs.txt /sdcard/app_error_logs.txt 2>$null
        adb pull /sdcard/app_error_logs.txt C:\temp\app_internal_errors.txt 2>$null
        if (Test-Path "C:\temp\app_internal_errors.txt") {
            Write-Host "✅ Internal error log copied to: C:\temp\app_internal_errors.txt" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠️  Could not copy internal logs" -ForegroundColor Yellow
    }
}

# Analyze the crash log for common errors
Write-Host ""
Write-Host "🔍 Analyzing crash log for common patterns..." -ForegroundColor Yellow

$logContent = Get-Content $latestLog -Raw
$errorPatterns = @(
    "FATAL EXCEPTION",
    "AndroidRuntime",
    "JavaScript error",
    "TypeError",
    "ReferenceError",
    "Navigation error",
    "react-native-reanimated",
    "react-native-worklets",
    "expo-router",
    "Cannot read propert"
)

$foundErrors = @()
foreach ($pattern in $errorPatterns) {
    if ($logContent -match $pattern) {
        $foundErrors += $pattern
    }
}

if ($foundErrors.Count -gt 0) {
    Write-Host ""
    Write-Host "🚨 Found potential error patterns:" -ForegroundColor Red
    foreach ($error in $foundErrors) {
        Write-Host "  - $error" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  No obvious error patterns found in log" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Summary of collected files:" -ForegroundColor Green
Write-Host "  - Main crash log: $latestLog" -ForegroundColor Cyan
if (Test-Path "C:\temp\app_internal_errors.txt") {
    Write-Host "  - Internal error log: C:\temp\app_internal_errors.txt" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "📤 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Open the log files and look for error messages around the crash time" -ForegroundColor White
Write-Host "  2. Copy the relevant error sections" -ForegroundColor White  
Write-Host "  3. Share them for analysis and fix" -ForegroundColor White

# Auto-open the log file
Write-Host ""
Write-Host "Opening crash log in notepad..." -ForegroundColor Green
Start-Process notepad $latestLog