@echo off
title CampusKart Backend Server
cd /d %~dp0backend
echo Starting CampusKart Express Backend on http://localhost:5000...
npm run dev
pause
