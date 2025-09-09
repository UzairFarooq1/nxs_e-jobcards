@echo off
REM Local Server Deployment Script for NXS E-JobCard System
REM This script helps you deploy to your local server

echo 🏠 Local Server Deployment for NXS E-JobCard System
echo ==================================================
echo.
echo This script will help you deploy your application to your local server.
echo.
echo Prerequisites:
echo - Node.js installed (v16+)
echo - Git installed
echo - Stable internet connection
echo - Server with 4GB+ RAM, 20GB+ storage
echo.
pause

echo.
echo 🚀 Starting deployment process...
echo.

REM Check if Node.js is installed
echo 📋 Checking prerequisites...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js from https://nodejs.org
    pause
    exit /b 1
) else (
    echo ✅ Node.js is installed
)

REM Check if Git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git is not installed. Please install Git from https://git-scm.com
    pause
    exit /b 1
) else (
    echo ✅ Git is installed
)

echo.
echo 📦 Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Error: Failed to install frontend dependencies
    pause
    exit /b 1
)

cd server
call npm install
if errorlevel 1 (
    echo ❌ Error: Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..

echo ✅ Dependencies installed successfully

echo.
echo 🏗️ Building frontend...
call npm run build
if errorlevel 1 (
    echo ❌ Error: Frontend build failed
    pause
    exit /b 1
)

echo ✅ Frontend built successfully

echo.
echo ⚙️ Creating environment configuration...
(
echo # Local Server Environment Variables
echo VITE_SUPABASE_URL=https://uqpankjtcuqoknaimdcb.supabase.co
echo VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxcGFua2p0Y3Vxb2tuYWltZGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczOTIwNjYsImV4cCI6MjA3Mjk2ODA2Nn0.UFtvh1FywX7FFmRRp9TnA1i1XNJep-t2SwUbdVSjrKU
echo.
echo # Backend Server Configuration
echo PORT=3001
echo CORS_ORIGIN=http://localhost:3000
echo SMTP_HOST=smtp.gmail.com
echo SMTP_PORT=465
echo SMTP_SECURE=true
echo SMTP_USER=it@vanguard-group.org
echo SMTP_PASS=alebxmozexpbfzek
) > .env.local

echo ✅ Environment configuration created

echo.
echo 📋 Installing PM2 for process management...
call npm install -g pm2
if errorlevel 1 (
    echo ⚠️ Warning: Failed to install PM2 globally. You may need to run as administrator.
    echo You can install PM2 manually with: npm install -g pm2
) else (
    echo ✅ PM2 installed successfully
)

echo.
echo 🚀 Starting application...
echo.

REM Start backend
echo Starting backend server...
cd server
start "NXS Backend" cmd /k "node server.js"
cd ..

REM Wait a moment for backend to start
echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

REM Start frontend
echo Starting frontend server...
cd dist
start "NXS Frontend" cmd /k "npx serve -s . -l 3000"
cd ..

echo.
echo ✅ Application started successfully!
echo.
echo 🌐 Access your application:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:3001
echo.
echo 📋 Next steps:
echo    1. Test the application by visiting http://localhost:3000
echo    2. Check if all features work correctly
echo    3. Configure your router for external access (optional)
echo    4. Set up SSL certificate for HTTPS (optional)
echo    5. Configure domain name (optional)
echo.
echo 📚 For detailed instructions, see LOCAL_SERVER_DEPLOYMENT_GUIDE.md
echo.
echo 🎉 Your NXS E-JobCard System is now running locally!
pause
