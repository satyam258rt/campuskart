@echo off
title CampusKart - 1-Click Host & Access
cd /d %~dp0
cls
echo ======================================================================
echo                 CAMPUSKART - SMART CAMPUS MARKETPLACE
echo               Zero-Cloud Offline & Phone Hosting System
echo ======================================================================
echo.

:: Detect Current Local IPv4 Address
set LOCAL_IP=127.0.0.1
for /f "tokens=4" %%a in ('route print ^| find " 0.0.0.0"') do (
    set LOCAL_IP=%%a
    goto :found_ip
)

:found_ip
echo [1/3] Starting Backend API Server (Port 5000) with Local Database...
start "CampusKart Backend [Do Not Close]" cmd /k "cd /d %~dp0backend && npm run dev"

echo [2/3] Starting Frontend React UI (Port 5173)...
start "CampusKart Frontend [Do Not Close]" cmd /k "cd /d %~dp0frontend && npm run dev"

echo [3/3] Opening CampusKart in your browser...
timeout /t 4 >nul
start http://localhost:5173

cls
echo ======================================================================
echo               CAMPUSKART IS NOW HOSTED AND RUNNING!
echo ======================================================================
echo.
echo  💻 ON THIS COMPUTER:
echo     http://localhost:5173
echo.
echo  📱 ON YOUR MOBILE PHONE (Same Wi-Fi or Mobile Hotspot):
echo     http://%LOCAL_IP%:5173
echo.
echo  ------------------------------------------------------------------
echo  HOW TO OPEN ON YOUR PHONE IN 5 SECONDS:
echo  1. Connect your phone to the same Wi-Fi / Hotspot as your laptop.
echo  2. Open CampusKart on your laptop screen.
echo  3. Click the green "Open on Phone" button at the top of the navbar.
echo  4. Point your phone camera at the QR code on your screen!
echo  ------------------------------------------------------------------
echo.
echo  Leave this window open while using CampusKart.
echo.
echo  Tip: To also create a public internet link (works on 4G/5G data),
echo       run "share-to-phone.bat" at any time.
echo ======================================================================
echo.
pause
