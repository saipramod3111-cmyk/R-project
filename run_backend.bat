@echo off
title DiaPredict - R Plumber Backend API
echo ========================================================
echo   DiaPredict: Starting R Plumber API Backend
echo ========================================================
echo.

cd /d "%~dp0backend"

:: Ensure R and Rscript are found
set "PATH=%LOCALAPPDATA%\Programs\R\app\bin;%LOCALAPPDATA%\Programs\R\app\bin\x64;C:\Program Files\R\R-4.4.2\bin;C:\Program Files\R\R-4.3.3\bin;%PATH%"

where Rscript >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Rscript was not found in PATH or standard installation folders.
    echo Please ensure R for Windows is installed.
    echo.
    pause
    exit /b 1
)

echo [OK] Rscript detected:
Rscript --version
echo.

echo [1/2] Verifying model and Excel dataset...
if not exist "data\diabetes.xlsx" (
    echo [INFO] Generating Excel dataset...
    Rscript prepare_data.R
)
if not exist "models\diabetes_glm_model.rds" (
    echo [INFO] Training GLM Logistic Regression model...
    Rscript train_model.R
)

echo.
echo [2/2] Launching R Plumber API on http://127.0.0.1:8000 ...
echo Swagger documentation available at: http://127.0.0.1:8000/__docs__/
echo.
echo NOTE: Keep this window OPEN while running DiaPredict.
echo ========================================================
echo.

Rscript app.R

echo.
echo [INFO] R Plumber server has stopped.
pause
