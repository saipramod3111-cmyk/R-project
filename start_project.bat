@echo off
title DiaPredict — Full Project Launcher
echo ========================================================
echo   DiaPredict: Diabetes Risk Prediction System Launcher
echo ========================================================
echo.
echo Launching R Plumber Backend in window 1...
start "DiaPredict Backend (R Plumber)" cmd /c "%~dp0run_backend.bat"

echo Waiting 3 seconds for R backend to initialize...
timeout /t 3 /nobreak >nul

echo Launching Frontend in window 2...
start "DiaPredict Frontend (React + Vite)" cmd /c "%~dp0run_frontend.bat"

echo.
echo ========================================================
echo   Both services launched!
echo   - Backend:  http://127.0.0.1:8000
echo   - Frontend: http://localhost:5173
echo ========================================================
