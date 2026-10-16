@echo off
title DiaPredict - 1-Click Live Online Demo
echo ========================================================
echo   DiaPredict: 1-Click Online Demo Launcher
echo ========================================================
echo.
cd /d "%~dp0"

:: Check if Python is available
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    python launch_online_demo.py
) else (
    echo [INFO] Starting R Plumber backend...
    start "" run_backend.bat
    timeout /t 3 /nobreak >nul
    echo.
    echo [INFO] Starting Cloudflare HTTPS tunnel...
    "C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://127.0.0.1:8000
)

pause
