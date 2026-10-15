@echo off
title DiaPredict — Frontend Web Server
echo ========================================================
echo   DiaPredict: Starting React + Vite Frontend
echo ========================================================
echo.

cd /d "%~dp0frontend"

:: Check if node is in PATH
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] npm not in system PATH. Checking standard Program Files...
    if exist "C:\Program Files\nodejs\npm.cmd" (
        set "PATH=C:\Program Files\nodejs;%PATH%"
    )
)

echo Starting Vite development server on http://localhost:5173 ...
echo.
npm run dev
pause
