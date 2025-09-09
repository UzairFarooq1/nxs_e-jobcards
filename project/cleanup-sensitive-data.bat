@echo off
echo 🔒 Cleaning up sensitive data from your project...
echo.

echo 📝 Creating .env file...
if not exist .env (
    copy env.example .env
    echo ✅ Created .env file from template
) else (
    echo ⚠️  .env file already exists
)

echo.
echo 🧹 Cleaning up vercel.json...
echo {> vercel.json
echo   "version": 2,>> vercel.json
echo   "buildCommand": "npm run build",>> vercel.json
echo   "outputDirectory": "dist",>> vercel.json
echo   "routes": [>> vercel.json
echo     {>> vercel.json
echo       "src": "/assets/(.*)",>> vercel.json
echo       "headers": {>> vercel.json
echo         "cache-control": "public, max-age=31536000, immutable">> vercel.json
echo       }>> vercel.json
echo     },>> vercel.json
echo     {>> vercel.json
echo       "src": "/(.*)",>> vercel.json
echo       "dest": "/index.html">> vercel.json
echo     }>> vercel.json
echo   ]>> vercel.json
echo }>> vercel.json
echo ✅ Cleaned vercel.json

echo.
echo 🔍 Checking for remaining sensitive data...
echo.
echo Checking for Supabase URL...
findstr /s /i "uqpankjtcuqoknaimdcb" . --exclude-dir=node_modules --exclude=.env
if %errorlevel% equ 0 (
    echo ⚠️  Found Supabase URL in files - please remove manually
) else (
    echo ✅ No Supabase URL found in files
)

echo.
echo Checking for Supabase Anon Key...
findstr /s /i "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" . --exclude-dir=node_modules --exclude=.env
if %errorlevel% equ 0 (
    echo ⚠️  Found Supabase Anon Key in files - please remove manually
) else (
    echo ✅ No Supabase Anon Key found in files
)

echo.
echo Checking for EmailJS credentials...
findstr /s /i "service_3zya3on" . --exclude-dir=node_modules --exclude=.env
if %errorlevel% equ 0 (
    echo ⚠️  Found EmailJS Service ID in files - please remove manually
) else (
    echo ✅ No EmailJS Service ID found in files
)

echo.
echo 🎯 Next steps:
echo 1. Edit .env file with your actual credentials
echo 2. Set up Vercel environment variables
echo 3. Redeploy your application
echo 4. Review your GitHub repository
echo.
echo 📖 See SECURITY_GUIDE.md for detailed instructions
echo.
pause
