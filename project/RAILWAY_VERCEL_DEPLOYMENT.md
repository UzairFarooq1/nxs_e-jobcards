# 🚀 Railway + Vercel Deployment Guide

## 🎯 **Deployment Strategy**

**Railway**: Backend only (`server` folder)
**Vercel**: Frontend only (root project without `server` folder)

## 📋 **Step-by-Step Deployment**

### **Step 1: Deploy Backend to Railway**

#### **1.1 Prepare Backend for Railway**
```bash
# Navigate to server folder
cd server

# Install dependencies
npm install

# Test locally first
node server.js
```

#### **1.2 Deploy to Railway**
1. **Go to Railway.app**
2. **Sign up** with GitHub
3. **New Project** → **Deploy from GitHub repo**
4. **Select your repository**
5. **Configure deployment**:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`

#### **1.3 Configure Environment Variables**
In Railway dashboard → **Variables**:
```
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-vercel-app.vercel.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=it@vanguard-group.org
SMTP_PASS=alebxmozexpbfzek
```

#### **1.4 Get Railway URL**
- Railway will provide a URL like: `https://your-backend.railway.app`
- **Note this URL** - you'll need it for Vercel

### **Step 2: Deploy Frontend to Vercel**

#### **2.1 Prepare Frontend for Vercel**
```bash
# Go back to project root
cd ..

# Update API URL in your code
# Edit src/utils/gmailEmailService.ts
```

Update `src/utils/gmailEmailService.ts`:
```typescript
// Change this line:
const API_BASE_URL = "http://localhost:3001/api";

// To this (replace with your Railway URL):
const API_BASE_URL = "https://your-backend.railway.app/api";
```

#### **2.2 Deploy to Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (run from project root)
vercel --prod

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name: nxs-e-jobcards
# - Directory: ./
# - Override settings? N
```

#### **2.3 Configure Environment Variables**
In Vercel dashboard → **Settings** → **Environment Variables**:
```
VITE_SUPABASE_URL=https://uqpankjtcuqoknaimdcb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxcGFua2p0Y3Vxb2tuYWltZGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczOTIwNjYsImV4cCI6MjA3Mjk2ODA2Nn0.UFtvh1FywX7FFmRRp9TnA1i1XNJep-t2SwUbdVSjrKU
VITE_API_URL=https://your-backend.railway.app
```

### **Step 3: Update CORS Configuration**

#### **3.1 Update Railway Backend CORS**
In Railway dashboard → **Variables**:
```
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

#### **3.2 Update Vercel Frontend API URL**
In Vercel dashboard → **Environment Variables**:
```
VITE_API_URL=https://your-backend.railway.app
```

## 🔧 **Configuration Files**

### **vercel.json** (for Vercel)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_SUPABASE_URL": "https://uqpankjtcuqoknaimdcb.supabase.co",
    "VITE_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxcGFua2p0Y3Vxb2tuYWltZGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczOTIwNjYsImV4cCI6MjA3Mjk2ODA2Nn0.UFtvh1FywX7FFmRRp9TnA1i1XNJep-t2SwUbdVSjrKU"
  }
}
```

### **server/railway.json** (for Railway)
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## 📁 **Project Structure for Deployment**

```
nxs-e-jobcards/
├── src/                    # Frontend code (goes to Vercel)
├── public/                 # Static assets (goes to Vercel)
├── dist/                   # Built frontend (goes to Vercel)
├── package.json            # Frontend dependencies (goes to Vercel)
├── vercel.json             # Vercel configuration
├── server/                 # Backend code (goes to Railway)
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   └── railway.json        # Railway configuration
└── README.md
```

## 🔄 **Deployment Process**

### **1. Deploy Backend First**
```bash
# 1. Go to Railway.app
# 2. Connect GitHub repo
# 3. Select 'server' folder as root
# 4. Add environment variables
# 5. Deploy and get URL
```

### **2. Update Frontend Code**
```bash
# Update API URL in gmailEmailService.ts
# Replace localhost:3001 with Railway URL
```

### **3. Deploy Frontend**
```bash
# 1. Go to Vercel
# 2. Connect GitHub repo
# 3. Deploy root folder (not server)
# 4. Add environment variables
# 5. Deploy
```

## 🌐 **Access Your Application**

- **Frontend**: `https://your-app.vercel.app`
- **Backend API**: `https://your-backend.railway.app`
- **API Endpoints**: `https://your-backend.railway.app/api/*`

## 🔧 **Troubleshooting**

### **Common Issues:**

#### **1. CORS Errors**
- **Problem**: Frontend can't access backend
- **Solution**: Update `CORS_ORIGIN` in Railway to match Vercel URL

#### **2. API Not Found**
- **Problem**: Frontend can't find API endpoints
- **Solution**: Check `VITE_API_URL` in Vercel environment variables

#### **3. Environment Variables Not Working**
- **Problem**: Variables not loaded in frontend
- **Solution**: Ensure variables start with `VITE_` prefix

#### **4. Build Failures**
- **Problem**: Vercel build fails
- **Solution**: Check `vercel.json` configuration and build command

## 📊 **Cost Breakdown**

### **Railway (Backend)**
- **Free tier**: $5 credit monthly
- **Usage**: ~$2-3/month for small app
- **Total**: $0-3/month

### **Vercel (Frontend)**
- **Free tier**: Unlimited static sites
- **Usage**: $0/month
- **Total**: $0/month

### **Total Cost**: $0-3/month

## ✅ **Deployment Checklist**

- [ ] **Deploy backend to Railway** (server folder only)
- [ ] **Get Railway URL** and note it down
- [ ] **Update frontend API URL** to use Railway URL
- [ ] **Deploy frontend to Vercel** (root folder without server)
- [ ] **Configure environment variables** in both platforms
- [ ] **Test API connectivity** between frontend and backend
- [ ] **Test all functionality** (login, job cards, email)
- [ ] **Configure custom domain** (optional)

## 🎉 **You're Ready to Deploy!**

This setup gives you:
- ✅ **Global CDN** for frontend (Vercel)
- ✅ **Reliable backend** hosting (Railway)
- ✅ **Automatic deployments** from GitHub
- ✅ **Environment management** for both platforms
- ✅ **Cost-effective** solution ($0-3/month)

**Need help with any step?** I can guide you through the entire process!
