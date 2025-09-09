# 🔧 Vercel Logo & SMTP Connection Fixes

## 🚨 **Current Issues**
1. **Logo not displaying** on Vercel deployment
2. **Gmail SMTP showing disconnected** despite environment variables being set

## 🔧 **Fix 1: Logo Display Issue**

### **Problem Analysis**
The logo `/logo_main.png` is not displaying because Vercel's build process may be handling static assets differently.

### **Solutions Applied**
1. **Updated `vite.config.ts`** to ensure logo is kept in root directory
2. **Created `LogoTest` component** to test different logo paths
3. **Added proper asset handling** in Vite configuration

### **Testing Steps**
1. **Deploy the updated code** to Vercel
2. **Go to Admin Dashboard** and check the "Logo Display Test" section
3. **Check browser console** for which logo path works
4. **Update components** to use the working path

### **Alternative Logo Paths to Try**
If the current fix doesn't work, try these paths in your components:
```tsx
// Option 1: Root path
<img src="/logo_main.png" alt="NXS Logo" />

// Option 2: Relative path
<img src="./logo_main.png" alt="NXS Logo" />

// Option 3: Public folder path
<img src="/public/logo_main.png" alt="NXS Logo" />

// Option 4: Direct filename
<img src="logo_main.png" alt="NXS Logo" />
```

## 🔧 **Fix 2: Gmail SMTP Connection Issue**

### **Problem Analysis**
The frontend is trying to connect to the backend, but there might be:
1. **Backend not properly deployed** on Vercel
2. **Environment variables not set** correctly
3. **API URL mismatch** between frontend and backend

### **Solutions Applied**
1. **Fixed API configuration** to use correct backend URL
2. **Updated health check logic** to look for 'configured' instead of 'connected'
3. **Added better error logging** and debugging information
4. **Created proper Vercel serverless functions**

### **Backend Deployment Steps**

#### **Step 1: Deploy Backend to Vercel**
1. **Go to [vercel.com](https://vercel.com)**
2. **Click "New Project"**
3. **Import your GitHub repository**
4. **Set Root Directory** to `project` (not `project/backend`)
5. **Deploy**

#### **Step 2: Set Backend Environment Variables**
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

#### **Step 3: Update Frontend Environment Variables**
In your frontend Vercel project, add:
```
VITE_API_URL=https://nxs-e-jobcards-backend.vercel.app/api
VITE_SUPABASE_URL=https://uqpankjtcuqoknaimdcb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxcGFua2p0Y3Vxb2tuYWltZGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczOTIwNjYsImV4cCI6MjA3Mjk2ODA2Nn0.UFtvh1FywX7FFmRRp9TnA1i1XNJep-t2SwUbdVSjrKU
VITE_ADMIN_EMAIL=it@vanguard-group.org
VITE_EMAILJS_SERVICE_ID=service_3zya3on
VITE_EMAILJS_TEMPLATE_ID=template_ur5rvkh
VITE_EMAILJS_PUBLIC_KEY=JMhuvm_lxCrEhXP_I
```

### **Testing Steps**
1. **Deploy both frontend and backend**
2. **Go to Admin Dashboard** → "Gmail SMTP Test"
3. **Click "Test Connection"** - should show "✅ Connected"
4. **Click "Test Email"** - should send a test email

## 🔍 **Debugging Commands**

### **Test Backend Health Endpoint**
```bash
# Test if backend is running
curl https://nxs-e-jobcards-backend.vercel.app/api/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2024-01-XX...",
  "smtp": "configured",
  "environment": "production",
  "version": "1.0.0"
}
```

### **Test Logo Paths**
1. **Open browser console** on your Vercel site
2. **Go to Admin Dashboard** → "Logo Display Test"
3. **Check console logs** for which paths work
4. **Update components** with working path

## 📋 **Checklist**

### **Logo Fix Checklist**
- [ ] Deploy updated code to Vercel
- [ ] Check Logo Display Test component
- [ ] Verify logo shows in header and login form
- [ ] Check browser console for errors
- [ ] Update components with working path if needed

### **SMTP Fix Checklist**
- [ ] Deploy backend to Vercel
- [ ] Set all backend environment variables
- [ ] Set frontend environment variables
- [ ] Test backend health endpoint
- [ ] Test Gmail SMTP connection in admin dashboard
- [ ] Test email sending functionality

## 🚨 **Common Issues & Solutions**

### **Logo Still Not Showing?**
1. **Check if file exists**: Visit `https://nxs-e-jobcards.vercel.app/logo_main.png`
2. **Try different paths**: Use the LogoTest component to find working path
3. **Check Vercel build logs**: Look for asset processing errors
4. **Verify file is committed**: Make sure `public/logo_main.png` is in Git

### **SMTP Still Disconnected?**
1. **Check backend URL**: Verify `https://nxs-e-jobcards-backend.vercel.app/api/health` works
2. **Check environment variables**: Verify all are set in Vercel dashboard
3. **Check backend logs**: Look for errors in Vercel function logs
4. **Test manually**: Use curl to test the health endpoint

### **Email Not Sending?**
1. **Check Gmail credentials**: Verify app password is correct
2. **Check admin email**: Verify `ADMIN_EMAIL` is set correctly
3. **Check PDF generation**: Verify PDF is being created
4. **Check backend logs**: Look for SMTP errors

## 🎯 **Expected Results**

After applying these fixes:
- ✅ **Logo displays** in header and login form
- ✅ **Gmail SMTP shows "Connected"** in admin dashboard
- ✅ **Email sending works** with PDF attachments
- ✅ **Job cards load quickly** with proper loading states

## 📞 **Need Help?**

If issues persist:
1. **Check Vercel deployment logs** for errors
2. **Check browser console** for JavaScript errors
3. **Test backend endpoints** manually with curl
4. **Verify environment variables** are set correctly

The fixes should resolve both the logo display and SMTP connection issues! 🚀
