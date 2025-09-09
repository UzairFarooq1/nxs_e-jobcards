# NXS E-JobCard Backend API

This is the backend API for the NXS E-JobCard system, designed to be deployed separately on Vercel.

## 🚀 **Deployment to Vercel**

### **Step 1: Create New Vercel Project**
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. **Set Root Directory** to `project/backend`
5. Deploy

### **Step 2: Set Environment Variables**
In your Vercel project settings, add:
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
In your frontend Vercel project, set:
```
VITE_API_URL=https://your-backend-project.vercel.app/api
```

## 📋 **API Endpoints**

### **Health Check**
- **URL**: `/api/health`
- **Method**: GET
- **Response**: Server status and SMTP configuration

### **Send Job Card Email**
- **URL**: `/api/send-jobcard-email`
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Body**: 
  - `jobCardData`: JSON string of job card data
  - `pdf`: PDF file attachment

## 🔧 **Local Development**

```bash
# Install dependencies
npm install

# Set environment variables
cp env.example .env
# Edit .env with your actual values

# Start development server
npm run dev
```

## 🎯 **Expected Result**

After deployment:
- ✅ Backend API available at `https://your-backend.vercel.app/api/health`
- ✅ Gmail SMTP configured and working
- ✅ Email sending with PDF attachments
- ✅ Frontend can connect to backend successfully
