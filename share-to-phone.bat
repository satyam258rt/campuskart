@echo off
title CampusKart - Phone Access & Cloud Tunnel
cd /d %~dp0
echo ======================================================================
echo           CampusKart - Access From Your Mobile Phone
echo ======================================================================
echo.

:: Detect Local IPv4
set LOCAL_IP=localhost
for /f "tokens=4" %%a in ('route print^|find " 0.0.0.0"') do (
    set LOCAL_IP=%%a
    goto :found_ip
)

:found_ip
echo ----------------------------------------------------------------------
echo  OPTION 1: Instant Local Wi-Fi (Fastest, zero setup)
echo ----------------------------------------------------------------------
echo  If your phone and PC are connected to the SAME Wi-Fi or Hotspot:
echo.
echo      http://%LOCAL_IP%:5173
echo.
echo  Open Chrome or Safari on your phone and open the link above!
echo.
echo ----------------------------------------------------------------------
echo  OPTION 2: Public Cloud Tunnel (Access anywhere on 4G / 5G Mobile Data)
echo ----------------------------------------------------------------------
echo  Fetching tunnel password...
for /f "usebackq tokens=*" %%p in (`powershell -NoProfile -Command "(Invoke-RestMethod -Uri https://loca.lt/mytunnelpassword -TimeoutSec 3) 2>$null"`) do set PWD_IP=%%p
if defined PWD_IP (
    echo  Tunnel Password: %PWD_IP%
    echo  (If the page asks for password, enter %PWD_IP% and click Continue)
)
echo.
echo  Starting secure public HTTPS tunnel for port 5173...
echo  (Your public URL ending in .loca.lt will appear below in 3 seconds)
echo.
npx --yes localtunnel --port 5173
pause