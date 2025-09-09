# 🔒 Security Guide - Protecting Your Sensitive Data

## ⚠️ **CRITICAL: Remove Sensitive Data from GitHub**

Your project currently contains sensitive information that should NOT be public. Follow these steps immediately:

### **Step 1: Remove Sensitive Data from Files**

The following files contain sensitive information and need to be cleaned:

1. **`vercel.json`** - Contains Supabase credentials
2. **`src/config/email.ts`** - Contains EmailJS credentials
3. **`src/lib/supabase.ts`** - Contains Supabase credentials
4. **All deployment guides** - Contain example credentials

### **Step 2: Create Environment Variables**

1. **Create `.env` file** (this file is already in `.gitignore`):
```bash
# Copy env.example to .env
cp env.example .env
```

2. **Fill in your actual values in `.env`**:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://uqpankjtcuqoknaimdcb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxcGFua2p0Y3Vxb2tuYWltZGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczOTIwNjYsImV4cCI6MjA3Mjk2ODA2Nn0.UFtvh1FywX7FFmRRp9TnA1i1XNJep-t2SwUbdVSjrKU

# Email Configuration
VITE_ADMIN_EMAIL=it@vanguard-group.org
VITE_EMAILJS_SERVICE_ID=service_3zya3on
VITE_EMAILJS_TEMPLATE_ID=template_ur5rvkh
VITE_EMAILJS_PUBLIC_KEY=JMhuvm_lxCrEhXP_I

# API Configuration
VITE_API_URL=https://your-backend-url.vercel.app
```

### **Step 3: Clean Up Sensitive Files**

Run these commands to remove sensitive data:

```bash
# Remove sensitive data from vercel.json
echo '{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}' > vercel.json

# Remove sensitive data from deployment guides
find . -name "*.md" -exec sed -i 's/VITE_SUPABASE_URL=.*/VITE_SUPABASE_URL=your_supabase_url_here/g' {} \;
find . -name "*.md" -exec sed -i 's/VITE_SUPABASE_ANON_KEY=.*/VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here/g' {} \;
```

### **Step 4: Set Up Vercel Environment Variables**

1. **Go to your Vercel dashboard**
2. **Select your project**
3. **Go to Settings → Environment Variables**
4. **Add these variables**:
   - `VITE_SUPABASE_URL` = `https://uqpankjtcuqoknaimdcb.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxcGFua2p0Y3Vxb2tuYWltZGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczOTIwNjYsImV4cCI6MjA3Mjk2ODA2Nn0.UFtvh1FywX7FFmRRp9TnA1i1XNJep-t2SwUbdVSjrKU`
   - `VITE_ADMIN_EMAIL` = `it@vanguard-group.org`
   - `VITE_EMAILJS_SERVICE_ID` = `service_3zya3on`
   - `VITE_EMAILJS_TEMPLATE_ID` = `template_ur5rvkh`
   - `VITE_EMAILJS_PUBLIC_KEY` = `JMhuvm_lxCrEhXP_I`

### **Step 5: Redeploy**

After setting up environment variables:

```bash
# Redeploy to Vercel
vercel --prod
```

## 🛡️ **Security Best Practices**

### **1. Never Commit Sensitive Data**
- ✅ Use `.env` files for local development
- ✅ Use environment variables in production
- ✅ Keep `.env` in `.gitignore`
- ❌ Never commit API keys, passwords, or tokens

### **2. Use Environment Variables**
- ✅ All sensitive data should be in environment variables
- ✅ Use `import.meta.env.VITE_*` for Vite projects
- ✅ Provide fallback values for development

### **3. Regular Security Audits**
- ✅ Review your code for hardcoded secrets
- ✅ Use tools like `git-secrets` to prevent accidental commits
- ✅ Regularly rotate API keys and passwords

### **4. Database Security**
- ✅ Use Row Level Security (RLS) in Supabase
- ✅ Implement proper authentication
- ✅ Use environment variables for database credentials

## 🚨 **Immediate Actions Required**

1. **Create `.env` file** with your actual credentials
2. **Remove sensitive data** from all files
3. **Set up Vercel environment variables**
4. **Redeploy your application**
5. **Review your GitHub repository** for any remaining sensitive data

## 📋 **Checklist**

- [ ] Created `.env` file with actual credentials
- [ ] Removed sensitive data from `vercel.json`
- [ ] Updated all configuration files to use environment variables
- [ ] Set up Vercel environment variables
- [ ] Redeployed application
- [ ] Verified no sensitive data in GitHub repository
- [ ] Tested application functionality

## 🔍 **Verification Commands**

```bash
# Check for sensitive data in your codebase
grep -r "VITE_SUPABASE_URL" . --exclude-dir=node_modules --exclude=".env"
grep -r "VITE_SUPABASE_ANON_KEY" . --exclude-dir=node_modules --exclude=".env"
grep -r "service_3zya3on" . --exclude-dir=node_modules --exclude=".env"
grep -r "template_ur5rvkh" . --exclude-dir=node_modules --exclude=".env"
```

If any of these commands return results, you still have sensitive data in your codebase that needs to be removed.

## 📞 **Need Help?**

If you need assistance with any of these steps, I'm here to help! The most important thing is to get your sensitive data out of your public GitHub repository as soon as possible.
