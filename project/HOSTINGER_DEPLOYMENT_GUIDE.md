# 🚀 Hostinger Deployment Guide

## ✅ **Yes, you can host this on Hostinger!**

This React + Node.js application can be deployed on Hostinger using their **VPS hosting** or **Shared hosting with Node.js support**.

## 🎯 **Deployment Options**

### **Option 1: VPS Hosting (Recommended)**
- **Full control** over server environment
- **Node.js support** out of the box
- **Better performance** for production use
- **Cost**: ~$3.99-7.99/month

### **Option 2: Shared Hosting with Node.js**
- **Budget-friendly** option
- **Limited resources** but sufficient for small apps
- **Cost**: ~$1.99-3.99/month

## 📋 **Pre-Deployment Checklist**

### **1. Prepare Your Application**
```bash
# Build the React app for production
npm run build

# Install production dependencies
npm install --production
```

### **2. Environment Variables**
Create `.env` file for production:
```env
# Supabase Configuration
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
```

## 🛠️ **Deployment Steps**

### **Step 1: Choose Hostinger Plan**
1. **Go to Hostinger.com**
2. **Select VPS Hosting** (recommended) or **Shared Hosting**
3. **Choose your plan** and complete purchase
4. **Note your server details** (IP, username, password)

### **Step 2: Connect to Your Server**
```bash
# Connect via SSH (VPS) or File Manager (Shared)
ssh root@your-server-ip

# Or use Hostinger's File Manager
# Navigate to public_html or your domain folder
```

### **Step 3: Install Required Software**

#### **For VPS Hosting:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (LTS version)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx (optional, for reverse proxy)
sudo apt install nginx -y
```

#### **For Shared Hosting:**
- **Node.js** is usually pre-installed
- **Check with Hostinger support** for Node.js version
- **Use their control panel** to manage Node.js apps

### **Step 4: Upload Your Application**

#### **Method 1: Git Clone (VPS)**
```bash
# Clone your repository
git clone https://github.com/yourusername/nxs-e-jobcards.git
cd nxs-e-jobcards

# Install dependencies
npm install
```

#### **Method 2: File Upload (Shared Hosting)**
1. **Zip your project folder**
2. **Upload via Hostinger File Manager**
3. **Extract in public_html**
4. **Install dependencies** via terminal

### **Step 5: Configure Your Application**

#### **Frontend Configuration:**
```bash
# Build for production
npm run build

# The build folder contains your static files
# Upload build/ contents to public_html
```

#### **Backend Configuration:**
```bash
# Navigate to server folder
cd server

# Install dependencies
npm install

# Create production .env file
nano .env
# Add your production environment variables
```

### **Step 6: Start Your Application**

#### **For VPS (using PM2):**
```bash
# Start backend server
cd server
pm2 start server.js --name "nxs-backend"

# Start frontend (if serving from Node.js)
cd ..
pm2 start "npm run preview" --name "nxs-frontend"

# Save PM2 configuration
pm2 save
pm2 startup
```

#### **For Shared Hosting:**
1. **Use Hostinger's Node.js app manager**
2. **Set entry point** to `server/server.js`
3. **Configure environment variables**
4. **Start the application**

### **Step 7: Configure Domain & SSL**

#### **Domain Setup:**
1. **Point your domain** to Hostinger's nameservers
2. **Add domain** in Hostinger control panel
3. **Configure DNS** records

#### **SSL Certificate:**
1. **Enable SSL** in Hostinger control panel
2. **Let's Encrypt** certificates are free
3. **Force HTTPS** redirect

## 🔧 **Nginx Configuration (VPS Only)**

Create `/etc/nginx/sites-available/nxs-e-jobcards`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend (React app)
    location / {
        root /path/to/your/build;
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
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/nxs-e-jobcards /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 📊 **Performance Optimization**

### **1. Enable Gzip Compression**
```nginx
# Add to Nginx config
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

### **2. Set Up Caching**
```nginx
# Add to Nginx config
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### **3. Database Optimization**
- **Enable connection pooling** in Supabase
- **Set up database indexes** for better performance
- **Monitor query performance**

## 🔒 **Security Considerations**

### **1. Environment Variables**
- **Never commit** `.env` files to Git
- **Use strong passwords** for production
- **Rotate API keys** regularly

### **2. Server Security**
```bash
# Update system regularly
sudo apt update && sudo apt upgrade -y

# Configure firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Disable root login (optional)
sudo nano /etc/ssh/sshd_config
# Set PermitRootLogin no
```

### **3. Application Security**
- **Enable HTTPS** everywhere
- **Validate all inputs** on backend
- **Use rate limiting** for API endpoints
- **Regular security updates**

## 🚨 **Troubleshooting**

### **Common Issues:**

#### **1. "Cannot find module" errors**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### **2. Port already in use**
```bash
# Find process using port
sudo lsof -i :3001
# Kill process
sudo kill -9 PID
```

#### **3. Permission denied**
```bash
# Fix file permissions
sudo chown -R $USER:$USER /path/to/your/app
chmod -R 755 /path/to/your/app
```

#### **4. Database connection issues**
- **Check Supabase URL and key**
- **Verify network connectivity**
- **Check RLS policies**

## 📈 **Monitoring & Maintenance**

### **1. Application Monitoring**
```bash
# Check PM2 status
pm2 status
pm2 logs

# Monitor system resources
htop
df -h
```

### **2. Regular Backups**
- **Database backups** (Supabase handles this)
- **Application code backups** (Git repository)
- **File uploads backups** (if storing locally)

### **3. Updates**
```bash
# Update application
git pull origin main
npm install
npm run build
pm2 restart all
```

## 💰 **Cost Breakdown**

### **VPS Hosting:**
- **VPS Plan**: $3.99-7.99/month
- **Domain**: $0.99-2.99/year
- **SSL Certificate**: Free (Let's Encrypt)
- **Total**: ~$4-8/month

### **Shared Hosting:**
- **Shared Plan**: $1.99-3.99/month
- **Domain**: $0.99-2.99/year
- **SSL Certificate**: Free
- **Total**: ~$2-4/month

## ✅ **Deployment Checklist**

- [ ] **Choose hosting plan** (VPS recommended)
- [ ] **Set up server** and install Node.js
- [ ] **Upload application** files
- [ ] **Configure environment** variables
- [ ] **Build frontend** for production
- [ ] **Start backend** server
- [ ] **Configure domain** and DNS
- [ ] **Enable SSL** certificate
- [ ] **Test all functionality**
- [ ] **Set up monitoring**
- [ ] **Configure backups**

## 🎉 **You're Ready to Deploy!**

Your NXS E-JobCard System is now ready for Hostinger deployment. The application will be accessible at your domain and fully functional with all features including:

- ✅ **User authentication**
- ✅ **Job card creation**
- ✅ **Manual job card uploads**
- ✅ **Email notifications**
- ✅ **PDF generation**
- ✅ **Admin dashboard**

**Need help?** Contact Hostinger support or check their documentation for specific hosting features.
