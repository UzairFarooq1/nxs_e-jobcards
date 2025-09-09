@echo off
echo 🚀 Deploying NXS Backend to Vercel...
echo.

echo 📁 Navigating to backend directory...
cd backend

echo 📦 Installing dependencies...
npm install

echo 🔧 Backend is ready for deployment!
echo.
echo 📋 Next steps:
echo 1. Go to https://vercel.com
echo 2. Create new project
echo 3. Import your GitHub repository
echo 4. Set Root Directory to: project/backend
echo 5. Add environment variables:
echo    - SMTP_HOST=smtp.gmail.com
echo    - SMTP_PORT=465
echo    - SMTP_SECURE=true
echo    - SMTP_USER=it@vanguard-group.org
echo    - SMTP_PASS=alebxmozexpbfzek
echo    - ADMIN_EMAIL=it@vanguard-group.org
echo    - NODE_ENV=production
echo 6. Deploy!
echo.
echo 🎯 After deployment, update your frontend VITE_API_URL
echo.
pause
