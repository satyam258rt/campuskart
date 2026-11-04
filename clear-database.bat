@echo off
title CampusKart Database Clear & Reset
cd /d %~dp0backend
echo ================================================================
echo CampusKart: Clearing all listings, uploads, orders and resetting database...
echo ================================================================
node src/utils/clearDatabase.js
pause
