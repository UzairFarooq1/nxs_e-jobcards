#!/bin/bash

# NXS E-JobCard System - Production Build Script
# This script prepares the application for Hostinger deployment

echo "🚀 Building NXS E-JobCard System for Production..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build frontend
echo "🏗️ Building frontend..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Error: Frontend build failed"
    exit 1
fi

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install --production
cd ..

# Create production environment file
echo "⚙️ Creating production environment file..."
cat > .env.production << EOF
# Production Environment Variables
VITE_SUPABASE_URL=https://uqpankjtcuqoknaimdcb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxcGFua2p0Y3Vxb2tuYWltZGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczOTIwNjYsImV4cCI6MjA3Mjk2ODA2Nn0.UFtvh1FywX7FFmRRp9TnA1i1XNJep-t2SwUbdVSjrKU

# Backend Server Configuration
PORT=3001
CORS_ORIGIN=https://yourdomain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=it@vanguard-group.org
SMTP_PASS=alebxmozexpbfzek
EOF

# Create deployment package
echo "📦 Creating deployment package..."
mkdir -p deployment
cp -r dist deployment/
cp -r server deployment/
cp package.json deployment/
cp .env.production deployment/.env
cp HOSTINGER_DEPLOYMENT_GUIDE.md deployment/

# Create start script
cat > deployment/start.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting NXS E-JobCard System..."

# Start backend server
cd server
npm start &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend (if using a simple server)
cd ../dist
npx serve -s . -l 3000 &
FRONTEND_PID=$!

echo "✅ Application started!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:3001"

# Keep script running
wait
EOF

chmod +x deployment/start.sh

# Create PM2 ecosystem file
cat > deployment/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'nxs-backend',
      script: './server/server.js',
      cwd: './',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'nxs-frontend',
      script: 'npx',
      args: 'serve -s dist -l 3000',
      cwd: './',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
EOF

# Create nginx config template
cat > deployment/nginx.conf << 'EOF'
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend (React app)
    location / {
        root /path/to/your/deployment/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Create deployment instructions
cat > deployment/DEPLOYMENT_INSTRUCTIONS.md << 'EOF'
# 🚀 Quick Deployment Instructions

## 1. Upload Files
Upload the entire `deployment` folder to your Hostinger server.

## 2. Install Dependencies
```bash
cd deployment
npm install
cd server
npm install
```

## 3. Configure Environment
Edit `.env` file with your production settings:
- Update `CORS_ORIGIN` with your domain
- Verify all other settings

## 4. Start Application

### Option A: Using PM2 (Recommended)
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Option B: Using start script
```bash
chmod +x start.sh
./start.sh
```

## 5. Configure Nginx (VPS only)
- Copy `nginx.conf` to `/etc/nginx/sites-available/`
- Update paths in the config
- Enable the site and reload nginx

## 6. Test
- Visit your domain
- Test login functionality
- Create a test job card
- Verify email notifications

## 7. Monitor
```bash
pm2 status
pm2 logs
```

For detailed instructions, see HOSTINGER_DEPLOYMENT_GUIDE.md
EOF

echo "✅ Production build completed!"
echo ""
echo "📁 Deployment package created in 'deployment' folder"
echo "📋 Next steps:"
echo "   1. Upload 'deployment' folder to Hostinger"
echo "   2. Follow DEPLOYMENT_INSTRUCTIONS.md"
echo "   3. Configure your domain and SSL"
echo ""
echo "🎉 Your app is ready for production deployment!"
