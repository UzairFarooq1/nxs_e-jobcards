@echo off
REM Start NXS E-JobCard System on Local Server
REM This script starts both frontend and backend services

echo 🚀 Starting NXS E-JobCard System...
echo.

REM Check if PM2 is installed
pm2 --version >nul 2>&1
if errorlevel 1 (
    echo ❌ PM2 is not installed. Installing PM2...
    call npm install -g pm2
    if errorlevel 1 (
        echo ❌ Failed to install PM2. Please install manually: npm install -g pm2
        pause
        exit /b 1
    )
)

REM Create logs directory
if not exist "logs" mkdir logs

REM Start services using PM2
echo 📦 Starting services with PM2...
pm2 start ecosystem.config.js

REM Save PM2 configuration
pm2 save

echo.
echo ✅ NXS E-JobCard System started successfully!
echo.
echo 🌐 Access your application:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:3001
echo.
echo 📋 Useful commands:
echo    pm2 status          - Check service status
echo    pm2 logs            - View logs
echo    pm2 restart all     - Restart all services
echo    pm2 stop all        - Stop all services
echo    pm2 delete all      - Delete all services
echo.
echo Press any key to view service status...
pause

pm2 status
echo.
echo Press any key to exit...
pause
