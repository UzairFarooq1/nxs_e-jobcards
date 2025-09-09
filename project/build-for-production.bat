@echo off
REM NXS E-JobCard System - Production Build Script for Windows
REM This script prepares the application for Hostinger deployment

echo 🚀 Building NXS E-JobCard System for Production...

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the project root directory
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Error: Failed to install dependencies
    pause
    exit /b 1
)

REM Build frontend
echo 🏗️ Building frontend...
call npm run build
if errorlevel 1 (
    echo ❌ Error: Frontend build failed
    pause
    exit /b 1
)

REM Check if build was successful
if not exist "dist" (
    echo ❌ Error: Frontend build failed - dist folder not found
    pause
    exit /b 1
)

REM Install server dependencies
echo 📦 Installing server dependencies...
cd server
call npm install --production
if errorlevel 1 (
    echo ❌ Error: Failed to install server dependencies
    pause
    exit /b 1
)
cd ..

REM Create production environment file
echo ⚙️ Creating production environment file...
(
echo # Production Environment Variables
echo VITE_SUPABASE_URL=https://uqpankjtcuqoknaimdcb.supabase.co
echo VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxcGFua2p0Y3Vxb2tuYWltZGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczOTIwNjYsImV4cCI6MjA3Mjk2ODA2Nn0.UFtvh1FywX7FFmRRp9TnA1i1XNJep-t2SwUbdVSjrKU
echo.
echo # Backend Server Configuration
echo PORT=3001
echo CORS_ORIGIN=https://yourdomain.com
echo SMTP_HOST=smtp.gmail.com
echo SMTP_PORT=465
echo SMTP_SECURE=true
echo SMTP_USER=it@vanguard-group.org
echo SMTP_PASS=alebxmozexpbfzek
) > .env.production

REM Create deployment package
echo 📦 Creating deployment package...
if exist "deployment" rmdir /s /q deployment
mkdir deployment
xcopy /E /I dist deployment\dist
xcopy /E /I server deployment\server
copy package.json deployment\
copy .env.production deployment\.env
copy HOSTINGER_DEPLOYMENT_GUIDE.md deployment\

REM Create start script for Windows
(
echo @echo off
echo echo 🚀 Starting NXS E-JobCard System...
echo.
echo REM Start backend server
echo cd server
echo start "Backend Server" cmd /k "npm start"
echo.
echo REM Wait a moment for backend to start
echo timeout /t 3 /nobreak ^>nul
echo.
echo REM Start frontend
echo cd ..\dist
echo start "Frontend Server" cmd /k "npx serve -s . -l 3000"
echo.
echo echo ✅ Application started!
echo echo Frontend: http://localhost:3000
echo echo Backend API: http://localhost:3001
echo pause
) > deployment\start.bat

REM Create PM2 ecosystem file
(
echo module.exports = {
echo   apps: [
echo     {
echo       name: 'nxs-backend',
echo       script: './server/server.js',
echo       cwd: './',
echo       env: {
echo         NODE_ENV: 'production',
echo         PORT: 3001
echo       }
echo     },
echo     {
echo       name: 'nxs-frontend',
echo       script: 'npx',
echo       args: 'serve -s dist -l 3000',
echo       cwd: './',
echo       env: {
echo         NODE_ENV: 'production'
echo       }
echo     }
echo   ]
echo };
) > deployment\ecosystem.config.js

REM Create nginx config template
(
echo server {
echo     listen 80;
echo     server_name yourdomain.com www.yourdomain.com;
echo.
echo     # Frontend ^(React app^)
echo     location / {
echo         root /path/to/your/deployment/dist;
echo         index index.html;
echo         try_files $uri $uri/ /index.html;
echo     }
echo.
echo     # Backend API
echo     location /api {
echo         proxy_pass http://localhost:3001;
echo         proxy_http_version 1.1;
echo         proxy_set_header Upgrade $http_upgrade;
echo         proxy_set_header Connection 'upgrade';
echo         proxy_set_header Host $host;
echo         proxy_set_header X-Real-IP $remote_addr;
echo         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
echo         proxy_set_header X-Forwarded-Proto $scheme;
echo         proxy_cache_bypass $http_upgrade;
echo     }
echo.
echo     # Enable gzip compression
echo     gzip on;
echo     gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
echo.
echo     # Cache static assets
echo     location ~* \.^(js^|css^|png^|jpg^|jpeg^|gif^|ico^|svg^)$ {
echo         expires 1y;
echo         add_header Cache-Control "public, immutable";
echo     }
echo }
) > deployment\nginx.conf

REM Create deployment instructions
(
echo # 🚀 Quick Deployment Instructions
echo.
echo ## 1. Upload Files
echo Upload the entire `deployment` folder to your Hostinger server.
echo.
echo ## 2. Install Dependencies
echo ```bash
echo cd deployment
echo npm install
echo cd server
echo npm install
echo ```
echo.
echo ## 3. Configure Environment
echo Edit `.env` file with your production settings:
echo - Update `CORS_ORIGIN` with your domain
echo - Verify all other settings
echo.
echo ## 4. Start Application
echo.
echo ### Option A: Using PM2 ^(Recommended^)
echo ```bash
echo npm install -g pm2
echo pm2 start ecosystem.config.js
echo pm2 save
echo pm2 startup
echo ```
echo.
echo ### Option B: Using start script
echo ```bash
echo chmod +x start.sh
echo ./start.sh
echo ```
echo.
echo ## 5. Configure Nginx ^(VPS only^)
echo - Copy `nginx.conf` to `/etc/nginx/sites-available/`
echo - Update paths in the config
echo - Enable the site and reload nginx
echo.
echo ## 6. Test
echo - Visit your domain
echo - Test login functionality
echo - Create a test job card
echo - Verify email notifications
echo.
echo ## 7. Monitor
echo ```bash
echo pm2 status
echo pm2 logs
echo ```
echo.
echo For detailed instructions, see HOSTINGER_DEPLOYMENT_GUIDE.md
) > deployment\DEPLOYMENT_INSTRUCTIONS.md

echo ✅ Production build completed!
echo.
echo 📁 Deployment package created in 'deployment' folder
echo 📋 Next steps:
echo    1. Upload 'deployment' folder to Hostinger
echo    2. Follow DEPLOYMENT_INSTRUCTIONS.md
echo    3. Configure your domain and SSL
echo.
echo 🎉 Your app is ready for production deployment!
pause
