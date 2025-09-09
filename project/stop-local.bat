@echo off
REM Stop NXS E-JobCard System on Local Server
REM This script stops all services

echo 🛑 Stopping NXS E-JobCard System...
echo.

REM Check if PM2 is installed
pm2 --version >nul 2>&1
if errorlevel 1 (
    echo ❌ PM2 is not installed. Nothing to stop.
    pause
    exit /b 1
)

REM Stop all services
echo 📦 Stopping all services...
pm2 stop all

REM Delete all services
echo 🗑️ Cleaning up services...
pm2 delete all

echo.
echo ✅ NXS E-JobCard System stopped successfully!
echo.
echo Press any key to exit...
pause
