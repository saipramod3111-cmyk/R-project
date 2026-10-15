@echo off
title DiaPredict - Frontend Web Server
echo ========================================================
echo   DiaPredict: Starting React + Vite Frontend Server
echo ========================================================
echo.

cd /d "%~dp0frontend"

:: Ensure Node and npm are found
set "PATH=C:\Program Files\nodejs;%APPDATA%\npm;%PATH%"

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js was not found in PATH or in C:\Program Files\nodejs.
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js detected:
node -v
echo.
echo Starting Vite development server...
echo URL: http://localhost:5173/
echo.
echo NOTE: Keep this window OPEN while running DiaPredict.
echo ========================================================
echo.

call npm run dev

echo.
echo [INFO] Vite server has stopped.
pause
