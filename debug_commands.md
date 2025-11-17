# Debug Commands for APK Crash Analysis

## Prerequisites
1. Enable USB Debugging on your Android device
2. Connect device via USB
3. Install ADB (Android Debug Bridge) if not already installed

## Step 1: Install APK and Reproduce Crash
1. Download the APK from EAS build
2. Install on your device: `adb install path/to/agrosync.apk`
3. Launch the app and navigate to login
4. Enter credentials and tap login (this should cause the crash)

## Step 2: Capture Crash Logs

### Option A: Real-time logcat (Recommended)
```powershell
# Start capturing logs (run this BEFORE reproducing the crash)
adb logcat -c  # Clear existing logs
adb logcat > C:\temp\agrosync_crash.txt

# Now reproduce the crash in the app, then press Ctrl+C to stop logging
# The crash stack trace will be in C:\temp\agrosync_crash.txt
```

### Option B: App-specific logs only
```powershell
# Filter for your app only (replace com.agrosync.app with actual package name if different)
adb logcat | findstr "com.agrosync.app"
```

## Step 3: Get App's Internal Error Log
```powershell
# Try to read the error log file created by our global error handler
adb shell run-as com.agrosync.app cat files/app_error_logs.txt

# If run-as fails, try copying to accessible location:
adb shell run-as com.agrosync.app cp files/app_error_logs.txt /sdcard/app_error_logs.txt
adb pull /sdcard/app_error_logs.txt C:\temp\app_error_logs.txt
```

## Step 4: Check Package Name (if needed)
```powershell
# List all installed packages to find the correct package name
adb shell pm list packages | findstr agro
```

## What to Look For
- JavaScript errors starting with "Error:", "TypeError:", "ReferenceError:"
- Native crashes with stack traces
- Navigation errors mentioning routes or screens
- Reanimated/worklets initialization errors
- Missing module or dependency errors

## Quick Troubleshooting Commands
```powershell
# Check if device is connected
adb devices

# Check app is installed
adb shell pm list packages | findstr agro

# Launch app manually (if needed)
adb shell am start -n com.agrosync.app/.MainActivity
```

After collecting logs, paste the relevant error sections and I'll provide a targeted fix!