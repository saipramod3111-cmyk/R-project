@echo off
title DiaPredict — R Plumber API Backend
echo ========================================================
echo   DiaPredict: Starting R Plumber API Backend
echo ========================================================
echo.

cd /d "%~dp0backend"

:: Check if Rscript is in PATH
where Rscript >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Rscript not in system PATH. Checking local installation...
    if exist "%LOCALAPPDATA%\Programs\R\app\bin\Rscript.exe" (
        set "PATH=%LOCALAPPDATA%\Programs\R\app\bin;%PATH%"
    ) else (
        echo [ERROR] R is not installed or Rscript.exe was not found.
        echo Please ensure R is installed.
        pause
        exit /b 1
    )
)

echo [1/2] Verifying model and dataset files...
if not exist "data\diabetes.xlsx" (
    echo Generating Excel dataset...
    Rscript prepare_data.R
)
if not exist "models\diabetes_glm_model.rds" (
    echo Training GLM Logistic Regression model...
    Rscript train_model.R
)

echo.
echo [2/2] Launching R Plumber API on http://127.0.0.1:8000 ...
echo Swagger docs available at: http://127.0.0.1:8000/__docs__/
echo.
Rscript app.R
pause
