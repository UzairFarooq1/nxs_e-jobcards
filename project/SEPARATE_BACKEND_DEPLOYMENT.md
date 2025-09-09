# 🚀 Separate Backend Deployment Guide

## 📁 **New Backend Structure**

I've created a dedicated `backend/` folder with:
- ✅ **Express.js server** (`index.js`)
- ✅ **Package.json** with proper dependencies
- ✅ **Vercel configuration** (`vercel.json`)
- ✅ **Environment variables template** (`env.example`)
- ✅ **Deployment script** (`deploy-backend.bat`)

## 🚀 **Deployment Steps**

### **Step 1: Deploy Backend to Vercel**

1. **Go to [vercel.com](https://vercel.com)**
2. **Click "New Project"**
3. **Import your GitHub repository**
4. **Set Root Directory** to `project/backend`
5. **Deploy**

### **Step 2: Set Backend Environment Variables**

In your backend Vercel project, go to Settings → Environment Variables and add:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=it@vanguard-group.org
SMTP_PASS=alebxmozexpbfzek
ADMIN_EMAIL=it@vanguard-group.org
NODE_ENV=production
```

### **Step 3: Update Frontend API URL**

In your frontend Vercel project, add this environment variable:
```
VITE_API_URL=https://your-backend-project-name.vercel.app/api
```

Replace `your-backend-project-name` with your actual Vercel backend project URL.

## 🔧 **Backend Features**

### **API Endpoints**
- **Health Check**: `GET /api/health`
- **Send Email**: `POST /api/send-jobcard-email`

### **Features**
- ✅ **Express.js server** with proper routing
- ✅ **CORS enabled** for frontend communication
- ✅ **Multer** for file uploads (PDF attachments)
- ✅ **Nodemailer** for Gmail SMTP
- ✅ **Error handling** and logging
- ✅ **Environment variable** configuration

## 🧪 **Testing the Backend**

### **Test Health Endpoint**
Visit: `https://your-backend-project.vercel.app/api/health`

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-XX...",
  "smtp": "configured",
  "environment": "production",
  "version": "1.0.0"
}
```

### **Test from Frontend**
1. **Go to Admin Dashboard**
2. **Click "Test Gmail SMTP Connection"**
3. **Should show "✅ Connected"**

## 📋 **Project Structure**

```
project/
├── backend/                 # Separate backend
│   ├── index.js            # Express server
│   ├── package.json        # Backend dependencies
│   ├── vercel.json         # Vercel configuration
│   ├── env.example         # Environment template
│   └── README.md           # Backend documentation
├── src/                    # Frontend (existing)
├── public/                 # Frontend assets
└── api/                    # Old API functions (can be removed)
```

## 🎯 **Benefits of Separate Backend**

- ✅ **Clean separation** of frontend and backend
- ✅ **Independent deployments** and scaling
- ✅ **Proper Express.js server** instead of serverless functions
- ✅ **Easier debugging** and maintenance
- ✅ **No Vercel configuration conflicts**

## 🔍 **Troubleshooting**

### **Backend Not Working?**
1. **Check Vercel deployment logs**
2. **Verify environment variables** are set
3. **Test health endpoint** directly in browser
4. **Check if root directory** is set to `project/backend`

### **Frontend Can't Connect?**
1. **Verify VITE_API_URL** is set correctly
2. **Check backend URL** is accessible
3. **Test health endpoint** from frontend
4. **Check browser console** for errors

## 🚀 **Quick Start**

1. **Run the deployment script**:
   ```bash
   deploy-backend.bat
   ```

2. **Follow the instructions** in the script output

3. **Update frontend** with new backend URL

4. **Test everything** works correctly

## 🎉 **Expected Result**

After deployment:
- ✅ **Backend API** running on Vercel
- ✅ **Gmail SMTP** connected and working
- ✅ **Email sending** with PDF attachments
- ✅ **Frontend** successfully connecting to backend
- ✅ **Logo** displaying correctly
- ✅ **Job cards** loading quickly

Your NXS E-JobCard system will be fully functional with a clean, separate backend! 🚀
