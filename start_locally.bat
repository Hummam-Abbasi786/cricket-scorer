@echo off
setlocal
echo ==========================================
echo    Cricket Scoring App - Smart Launcher
echo ==========================================

if not exist node_modules (
    echo [INFO] node_modules not found. Installing dependencies...
    cmd /c npm install --legacy-peer-deps
)

echo [INFO] Starting the appraisal server...
echo.
echo Please visit: http://127.0.0.1:5173/
echo.
cmd /c npm run dev

pause
