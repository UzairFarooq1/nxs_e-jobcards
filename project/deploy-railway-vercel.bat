@echo off
REM Railway + Vercel Deployment Script for NXS E-JobCard System
REM This script helps you deploy backend to Railway and frontend to Vercel

echo 🚀 Railway + Vercel Deployment for NXS E-JobCard System
echo ======================================================
echo.
echo This script will help you deploy:
echo - Backend (server folder) to Railway
echo - Frontend (root project) to Vercel
echo.
echo Prerequisites:
echo - GitHub repository with your code
echo - Railway account (free)
echo - Vercel account (free)
echo - Node.js and npm installed
echo.
pause

echo.
echo 📋 Step 1: Prepare for Deployment
echo ================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the project root directory
    pause
    exit /b 1
)

if not exist "server" (
    echo ❌ Error: Server folder not found
    pause
    exit /b 1
)

echo ✅ Project structure looks good

REM Install dependencies
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

REM Build frontend
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
echo 📋 Step 2: Deploy Backend to Railway
echo ===================================
echo.
echo 1. Go to Railway.app and sign up with GitHub
echo 2. Click "New Project" → "Deploy from GitHub repo"
echo 3. Select your repository
echo 4. Configure deployment:
echo    - Root Directory: server
echo    - Build Command: npm install
echo    - Start Command: node server.js
echo 5. Add environment variables:
echo    NODE_ENV=production
echo    PORT=3001
echo    CORS_ORIGIN=https://your-vercel-app.vercel.app
echo    SMTP_HOST=smtp.gmail.com
echo    SMTP_PORT=465
echo    SMTP_SECURE=true
echo    SMTP_USER=it@vanguard-group.org
echo    SMTP_PASS=alebxmozexpbfzek
echo.
echo 6. Deploy and note the Railway URL (e.g., https://your-backend.railway.app)
echo.
set /p railway_url="Enter your Railway backend URL (e.g., https://your-backend.railway.app): "

if "%railway_url%"=="" (
    echo ❌ Error: Railway URL is required
    pause
    exit /b 1
)

echo.
echo 📋 Step 3: Deploy Frontend to Vercel
echo ====================================
echo.

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if errorlevel 1 (
    echo 📦 Installing Vercel CLI...
    call npm install -g vercel
    if errorlevel 1 (
        echo ❌ Error: Failed to install Vercel CLI
        echo Please install manually: npm install -g vercel
        pause
        exit /b 1
    )
)

echo ✅ Vercel CLI is ready

REM Create .env.local for Vercel
echo.
echo ⚙️ Creating environment configuration...
(
echo # Vercel Environment Variables
echo VITE_SUPABASE_URL=https://uqpankjtcuqoknaimdcb.supabase.co
echo VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxcGFua2p0Y3Vxb2tuYWltZGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczOTIwNjYsImV4cCI6MjA3Mjk2ODA2Nn0.UFtvh1FywX7FFmRRp9TnA1i1XNJep-t2SwUbdVSjrKU
echo VITE_API_URL=%railway_url%
) > .env.local

echo ✅ Environment configuration created

echo.
echo 🚀 Deploying to Vercel...
echo.
echo Note: You'll need to:
echo 1. Login to Vercel (vercel login)
echo 2. Deploy the project (vercel --prod)
echo 3. Add environment variables in Vercel dashboard
echo.

REM Deploy to Vercel
echo Starting Vercel deployment...
vercel --prod

if errorlevel 1 (
    echo ❌ Error: Vercel deployment failed
    echo Please check the error messages above
    pause
    exit /b 1
)

echo.
echo ✅ Deployment completed!
echo.
echo 📋 Step 4: Configure Environment Variables
echo =========================================
echo.
echo In Vercel dashboard, add these environment variables:
echo.
echo VITE_SUPABASE_URL=https://uqpankjtcuqoknaimdcb.supabase.co
echo VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxcGFua2p0Y3Vxb2tuYWltZGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczOTIwNjYsImV4cCI6MjA3Mjk2ODA2Nn0.UFtvh1FywX7FFmRRp9TnA1i1XNJep-t2SwUbdVSjrKU
echo VITE_API_URL=%railway_url%
echo.
echo In Railway dashboard, update CORS_ORIGIN to your Vercel URL
echo.

echo 🎉 Deployment Summary
echo ====================
echo.
echo ✅ Backend deployed to Railway: %railway_url%
echo ✅ Frontend deployed to Vercel: https://your-app.vercel.app
echo.
echo 📋 Next steps:
echo 1. Test your application
echo 2. Configure custom domain (optional)
echo 3. Set up monitoring and alerts
echo.
echo 📚 For detailed instructions, see RAILWAY_VERCEL_DEPLOYMENT.md
echo.
echo 🎉 Your NXS E-JobCard System is now live!
pause
