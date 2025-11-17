@echo off
echo Starting crash log capture...
echo.
echo INSTRUCTIONS:
echo 1. This window will start capturing Android logs
echo 2. Now go to your phone and open the Agro-Sync app
echo 3. Login with your credentials (this should cause the crash)
echo 4. Come back here and press Ctrl+C to stop logging
echo 5. Check C:\temp\agrosync_crash.txt for the crash details
echo.
pause
adb logcat > C:\temp\agrosync_crash.txt