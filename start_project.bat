@echo off
title DiaPredict - Full Project Launcher
echo ========================================================
echo   DiaPredict: Diabetes Risk Prediction System
echo   BCA Mini Project Launcher (R + React + Plumber)
echo ========================================================
echo.

:: 1. Launch R Plumber Backend in its own window (cmd /k keeps window open)
echo [1/3] Starting R Plumber API Backend in a new window...
start "DiaPredict Backend (R Plumber)" cmd /k "%~dp0run_backend.bat"

echo Waiting 3 seconds for R backend to initialize...
timeout /t 3 /nobreak >nul

:: 2. Launch Vite Frontend in its own window (cmd /k keeps window open)
echo [2/3] Starting React + Vite Frontend Server in a new window...
start "DiaPredict Frontend (React + Vite)" cmd /k "%~dp0run_frontend.bat"

echo Waiting 3 seconds for Frontend to start...
timeout /t 3 /nobreak >nul

:: 3. Automatically open default browser
echo [3/3] Opening DiaPredict in your default web browser...
start http://localhost:5173/

echo.
echo ========================================================
echo   DiaPredict is now RUNNING!
echo   ------------------------------------------------------
echo   * Frontend Web App:  http://localhost:5173/
echo   * R Plumber API:     http://127.0.0.1:8000/
echo   * Swagger API Docs:  http://127.0.0.1:8000/__docs__/
echo   ------------------------------------------------------
echo   NOTE: Keep the two spawned terminal windows OPEN while
echo   demonstrating or testing the project.
echo ========================================================
echo.
pause
