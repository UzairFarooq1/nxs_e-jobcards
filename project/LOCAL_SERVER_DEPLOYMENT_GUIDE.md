# 🏠 Local Server Deployment Guide

## ✅ **Yes! You can host on your local server**

Hosting on your own local server gives you:
- **Complete control** over your environment
- **No monthly costs** (just electricity)
- **Full customization** options
- **No usage limits** or restrictions
- **Direct access** for maintenance

## 🎯 **Prerequisites**

### **Hardware Requirements:**
- **CPU**: 2+ cores (4+ recommended)
- **RAM**: 4GB+ (8GB+ recommended)
- **Storage**: 20GB+ free space
- **Network**: Stable internet connection
- **OS**: Windows Server, Linux, or macOS

### **Software Requirements:**
- **Node.js** (v16+ recommended)
- **Git** (for code updates)
- **PM2** (process management)
- **Nginx** (reverse proxy, optional)
- **SSL Certificate** (Let's Encrypt, optional)

## 🚀 **Deployment Options**

### **Option 1: Simple Local Hosting (Easiest)**

#### **Step 1: Prepare Your Server**
```bash
# Install Node.js (if not already installed)
# Download from https://nodejs.org or use package manager

# Install PM2 globally
npm install -g pm2

# Install Git (if not already installed)
# Download from https://git-scm.com
```

#### **Step 2: Deploy Application**
```bash
# Clone your repository
git clone https://github.com/yourusername/nxs-e-jobcards.git
cd nxs-e-jobcards

# Install dependencies
npm install
cd server
npm install
cd ..

# Build frontend
npm run build
```

#### **Step 3: Configure Environment**
Create `.env` file in project root:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://uqpankjtcuqoknaimdcb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxcGFua2p0Y3Vxb2tuYWltZGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczOTIwNjYsImV4cCI6MjA3Mjk2ODA2Nn0.UFtvh1FywX7FFmRRp9TnA1i1XNJep-t2SwUbdVSjrKU

# Backend Server Configuration
PORT=3001
CORS_ORIGIN=http://your-server-ip:3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=it@vanguard-group.org
SMTP_PASS=alebxmozexpbfzek
```

#### **Step 4: Start Application**
```bash
# Start backend with PM2
cd server
pm2 start server.js --name "nxs-backend"

# Start frontend with PM2
cd ../dist
pm2 start "npx serve -s . -l 3000" --name "nxs-frontend"

# Save PM2 configuration
pm2 save
pm2 startup
```

#### **Step 5: Access Your Application**
- **Frontend**: `http://your-server-ip:3000`
- **Backend API**: `http://your-server-ip:3001`

### **Option 2: Professional Setup with Nginx (Recommended)**

#### **Step 1: Install Nginx**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx

# Windows
# Download from http://nginx.org/en/download.html
```

#### **Step 2: Configure Nginx**
Create `/etc/nginx/sites-available/nxs-e-jobcards`:
```nginx
server {
    listen 80;
    server_name your-domain.com your-server-ip;

    # Frontend (React app)
    location / {
        root /path/to/your/nxs-e-jobcards/dist;
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
```

#### **Step 3: Enable Site**
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/nxs-e-jobcards /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### **Option 3: Docker Deployment (Advanced)**

#### **Step 1: Create Dockerfile**
Create `Dockerfile` in project root:
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm install
RUN cd server && npm install

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built frontend
COPY --from=builder /app/dist ./dist

# Copy server files
COPY --from=builder /app/server ./server

# Install production dependencies
RUN cd server && npm install --production

# Expose ports
EXPOSE 3000 3001

# Start script
COPY start.sh ./
RUN chmod +x start.sh

CMD ["./start.sh"]
```

#### **Step 2: Create start.sh**
```bash
#!/bin/bash
# Start both frontend and backend

# Start backend
cd server
node server.js &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
cd ../dist
npx serve -s . -l 3000 &
FRONTEND_PID=$!

# Keep container running
wait
```

#### **Step 3: Create docker-compose.yml**
```yaml
version: '3.8'
services:
  nxs-app:
    build: .
    ports:
      - "3000:3000"
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - CORS_ORIGIN=http://localhost:3000
      - SMTP_HOST=smtp.gmail.com
      - SMTP_PORT=465
      - SMTP_SECURE=true
      - SMTP_USER=it@vanguard-group.org
      - SMTP_PASS=alebxmozexpbfzek
    restart: unless-stopped
```

#### **Step 4: Deploy with Docker**
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## 🔒 **Security Configuration**

### **1. Firewall Setup**
```bash
# Ubuntu/Debian
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Windows
# Configure Windows Firewall to allow ports 80, 443, 3000, 3001
```

### **2. SSL Certificate (Let's Encrypt)**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### **3. Process Management**
```bash
# PM2 commands
pm2 status              # Check status
pm2 logs nxs-backend    # View backend logs
pm2 logs nxs-frontend   # View frontend logs
pm2 restart all         # Restart all processes
pm2 stop all           # Stop all processes
pm2 delete all         # Delete all processes
```

## 📊 **Monitoring & Maintenance**

### **1. System Monitoring**
```bash
# Check system resources
htop
df -h
free -h

# Check application status
pm2 status
pm2 logs

# Check Nginx status
sudo systemctl status nginx
```

### **2. Log Management**
```bash
# View application logs
pm2 logs --lines 100

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Rotate logs
pm2 install pm2-logrotate
```

### **3. Backup Strategy**
```bash
# Backup application
tar -czf nxs-backup-$(date +%Y%m%d).tar.gz /path/to/nxs-e-jobcards

# Backup PM2 configuration
pm2 save
cp ~/.pm2/dump.pm2 /backup/location/
```

## 🔧 **Troubleshooting**

### **Common Issues:**

#### **1. Port Already in Use**
```bash
# Find process using port
sudo lsof -i :3000
sudo lsof -i :3001

# Kill process
sudo kill -9 PID
```

#### **2. Permission Denied**
```bash
# Fix file permissions
sudo chown -R $USER:$USER /path/to/nxs-e-jobcards
chmod -R 755 /path/to/nxs-e-jobcards
```

#### **3. Nginx Configuration Error**
```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx
```

#### **4. PM2 Process Crashed**
```bash
# Check logs
pm2 logs nxs-backend

# Restart process
pm2 restart nxs-backend

# Check for errors
pm2 describe nxs-backend
```

## 🌐 **Network Configuration**

### **1. Router Configuration**
- **Port Forwarding**: Forward ports 80, 443 to your server
- **Dynamic DNS**: Use services like No-IP or DuckDNS
- **Static IP**: Configure static IP for your server

### **2. Domain Setup**
- **Purchase domain** (optional)
- **Point DNS** to your server IP
- **Configure subdomain** (e.g., nxs.yourdomain.com)

### **3. Access from Internet**
- **Local access**: `http://your-server-ip:3000`
- **Internet access**: `http://your-domain.com` (with domain setup)
- **HTTPS access**: `https://your-domain.com` (with SSL)

## 📈 **Performance Optimization**

### **1. Nginx Optimization**
```nginx
# Add to nginx.conf
worker_processes auto;
worker_connections 1024;

# Enable caching
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=10g inactive=60m;

# Gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

### **2. PM2 Optimization**
```bash
# Cluster mode for better performance
pm2 start server.js -i max --name "nxs-backend"

# Memory limit
pm2 start server.js --max-memory-restart 1G --name "nxs-backend"
```

### **3. System Optimization**
```bash
# Increase file limits
echo "* soft nofile 65536" >> /etc/security/limits.conf
echo "* hard nofile 65536" >> /etc/security/limits.conf

# Optimize kernel parameters
echo "net.core.somaxconn = 65536" >> /etc/sysctl.conf
sysctl -p
```

## 💰 **Cost Analysis**

### **Local Server Costs:**
- **Hardware**: One-time cost (if you already have a server)
- **Electricity**: ~$10-30/month (depending on server power)
- **Internet**: Existing connection
- **Domain**: ~$10-15/year (optional)
- **SSL Certificate**: Free (Let's Encrypt)
- **Total**: ~$10-30/month

### **vs Cloud Hosting:**
- **Vercel + Railway**: $0/month (free tiers)
- **Hostinger VPS**: $3.99-7.99/month
- **AWS/GCP**: $20-100+/month

## ✅ **Deployment Checklist**

- [ ] **Prepare server** (hardware, OS, software)
- [ ] **Install dependencies** (Node.js, PM2, Nginx)
- [ ] **Deploy application** (clone, build, configure)
- [ ] **Configure environment** variables
- [ ] **Start services** (PM2, Nginx)
- [ ] **Configure firewall** and ports
- [ ] **Set up SSL** certificate (optional)
- [ ] **Configure domain** and DNS (optional)
- [ ] **Test all functionality**
- [ ] **Set up monitoring** and backups
- [ ] **Configure auto-startup**

## 🎉 **You're Ready for Local Hosting!**

Your NXS E-JobCard System can run perfectly on your local server with:

- ✅ **Complete control** over your environment
- ✅ **No monthly hosting costs**
- ✅ **Full customization** options
- ✅ **Professional setup** with Nginx
- ✅ **SSL support** for secure access
- ✅ **Process management** with PM2

**Need help with any step?** I can guide you through the entire process!
