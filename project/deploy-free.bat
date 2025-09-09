@echo off
REM Free Hosting Deployment Script for NXS E-JobCard System
REM This script helps you deploy to free hosting platforms

echo 🆓 Free Hosting Deployment Options
echo =================================
echo.
echo Choose your deployment strategy:
echo.
echo 1. Vercel (Frontend) + Railway (Backend) - RECOMMENDED
echo 2. Netlify (Frontend) + Render (Backend)
echo 3. Railway (Full-Stack) - SIMPLEST
echo 4. Render (Full-Stack)
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto vercel_railway
if "%choice%"=="2" goto netlify_render
if "%choice%"=="3" goto railway_full
if "%choice%"=="4" goto render_full
goto invalid

:vercel_railway
echo.
echo 🚀 Deploying to Vercel + Railway...
echo.
echo Step 1: Deploy Frontend to Vercel
echo =================================
echo.
echo 1. Install Vercel CLI:
echo    npm i -g vercel
echo.
echo 2. Login to Vercel:
echo    vercel login
echo.
echo 3. Deploy frontend:
echo    vercel --prod
echo.
echo 4. Add environment variables in Vercel dashboard:
echo    VITE_SUPABASE_URL=https://uqpankjtcuqoknaimdcb.supabase.co
echo    VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxcGFua2p0Y3Vxb2tuYWltZGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczOTIwNjYsImV4cCI6MjA3Mjk2ODA2Nn0.UFtvh1FywX7FFmRRp9TnA1i1XNJep-t2SwUbdVSjrKU
echo    VITE_API_URL=https://your-railway-backend-url.railway.app
echo.
echo Step 2: Deploy Backend to Railway
echo =================================
echo.
echo 1. Go to Railway.app and sign up with GitHub
echo 2. Create new project from GitHub repo
echo 3. Select the 'server' folder
echo 4. Add environment variables:
echo    PORT=3001
echo    CORS_ORIGIN=https://your-vercel-app.vercel.app
echo    SMTP_HOST=smtp.gmail.com
echo    SMTP_PORT=465
echo    SMTP_SECURE=true
echo    SMTP_USER=it@vanguard-group.org
echo    SMTP_PASS=alebxmozexpbfzek
echo.
echo ✅ Setup complete! Your app will be live for FREE!
goto end

:netlify_render
echo.
echo 🚀 Deploying to Netlify + Render...
echo.
echo Step 1: Deploy Frontend to Netlify
echo ==================================
echo.
echo 1. Go to Netlify.com and sign up with GitHub
echo 2. New site from Git → GitHub
echo 3. Select your repository
echo 4. Build settings:
echo    Build command: npm run build
echo    Publish directory: dist
echo 5. Add environment variables:
echo    VITE_SUPABASE_URL=https://uqpankjtcuqoknaimdcb.supabase.co
echo    VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxcGFua2p0Y3Vxb2tuYWltZGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczOTIwNjYsImV4cCI6MjA3Mjk2ODA2Nn0.UFtvh1FywX7FFmRRp9TnA1i1XNJep-t2SwUbdVSjrKU
echo    VITE_API_URL=https://your-render-backend-url.onrender.com
echo.
echo Step 2: Deploy Backend to Render
echo ================================
echo.
echo 1. Go to Render.com and sign up with GitHub
echo 2. New → Web Service
echo 3. Connect GitHub repo
echo 4. Configure:
echo    Name: nxs-backend
echo    Root Directory: server
echo    Build Command: npm install
echo    Start Command: node server.js
echo 5. Add environment variables:
echo    NODE_ENV=production
echo    PORT=3001
echo    CORS_ORIGIN=https://your-netlify-app.netlify.app
echo    SMTP_HOST=smtp.gmail.com
echo    SMTP_PORT=465
echo    SMTP_SECURE=true
echo    SMTP_USER=it@vanguard-group.org
echo    SMTP_PASS=alebxmozexpbfzek
echo.
echo ✅ Setup complete! Your app will be live for FREE!
goto end

:railway_full
echo.
echo 🚀 Deploying to Railway (Full-Stack)...
echo.
echo 1. Go to Railway.app and sign up with GitHub
echo 2. New Project → Deploy from GitHub repo
echo 3. Select your repository
echo 4. Add environment variables:
echo    NODE_ENV=production
echo    PORT=3001
echo    CORS_ORIGIN=https://your-railway-app.railway.app
echo    SMTP_HOST=smtp.gmail.com
echo    SMTP_PORT=465
echo    SMTP_SECURE=true
echo    SMTP_USER=it@vanguard-group.org
echo    SMTP_PASS=alebxmozexpbfzek
echo.
echo ✅ Setup complete! Your app will be live for FREE!
goto end

:render_full
echo.
echo 🚀 Deploying to Render (Full-Stack)...
echo.
echo 1. Go to Render.com and sign up with GitHub
echo 2. New → Web Service
echo 3. Connect GitHub repo
echo 4. Configure:
echo    Name: nxs-e-jobcards
echo    Root Directory: ./
echo    Build Command: npm install && npm run build
echo    Start Command: cd server && node server.js
echo 5. Add environment variables:
echo    NODE_ENV=production
echo    PORT=3001
echo    CORS_ORIGIN=https://your-render-app.onrender.com
echo    SMTP_HOST=smtp.gmail.com
echo    SMTP_PORT=465
echo    SMTP_SECURE=true
echo    SMTP_USER=it@vanguard-group.org
echo    SMTP_PASS=alebxmozexpbfzek
echo.
echo ✅ Setup complete! Your app will be live for FREE!
goto end

:invalid
echo.
echo ❌ Invalid choice. Please run the script again and choose 1-4.
goto end

:end
echo.
echo 📚 For detailed instructions, see FREE_HOSTING_GUIDE.md
echo.
echo 🎉 Happy deploying!
pause
