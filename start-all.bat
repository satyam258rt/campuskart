@echo off
title CampusKart Full-Stack Launcher
echo ========================================================
echo        CampusKart - Smart Campus Marketplace
echo ========================================================
echo.
echo [1/3] Starting Backend API Server (Port 5000)...
start "CampusKart Backend Server" cmd /k "cd /d %~dp0backend && npm run dev"

echo [2/3] Starting Frontend React UI (Port 5173)...
start "CampusKart Frontend Client" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo [3/3] Opening CampusKart in your default browser...
timeout /t 3 >nul
start http://localhost:5173

:: Detect Local IPv4
set LOCAL_IP=localhost
for /f "tokens=4" %%a in ('route print^|find " 0.0.0.0"') do (
    set LOCAL_IP=%%a
    goto :found_ip
)

:found_ip
echo.
echo ========================================================
echo Application started successfully!
echo.
echo  PC Browser:           http://localhost:5173
echo  Mobile Phone (Wi-Fi): http://%LOCAL_IP%:5173
echo  Backend Health:       http://localhost:5000/api/v1/health
echo ========================================================
echo Tip: For 4G/5G mobile access anywhere, double-click:
echo      share-to-phone.bat
echo ========================================================
echo You can minimize this window.
pause
