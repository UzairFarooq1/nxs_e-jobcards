# 🚀 Quick Backend Deployment Guide

## Current Status
✅ Frontend is working correctly (debug logs show proper API call)  
❌ Backend endpoint `/api/admin/create-engineer` doesn't exist yet (404 error)

## Deploy Backend Now

### Step 1: Deploy to Vercel
```bash
# Navigate to backend folder
cd backend

# Deploy to Vercel
vercel --prod
```

### Step 2: Set Environment Variables in Vercel Dashboard
Go to your Vercel backend project settings and add:

**Backend Environment Variables:**
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ADMIN_API_KEY=your_secure_random_string
```

**Frontend Environment Variables:**
```
VITE_API_URL=https://nxs-e-jobcards-backend.vercel.app
VITE_ADMIN_API_KEY=your_secure_random_string
```

## Test After Deployment

1. **Test the endpoint directly:**
```bash
curl -X POST https://nxs-e-jobcards-backend.vercel.app/api/admin/create-engineer \
  -H "Content-Type: application/json" \
  -H "x-admin-api-key: your_secure_random_string" \
  -d '{"name":"Test","email":"test@example.com"}'
```

2. **Test in the app:** Try adding an engineer again

## What Will Happen After Deployment

✅ Backend will have the `/api/admin/create-engineer` endpoint  
✅ Frontend will successfully call the backend  
✅ Engineer will be created in Supabase Auth  
✅ Engineer will be added to the `engineers` table  
✅ Engineer will receive an invite link to set their password  

## Troubleshooting

**If still getting 404:**
- Check Vercel deployment logs
- Verify the endpoint exists in the deployed code
- Try redeploying

**If getting 403 Forbidden:**
- Check ADMIN_API_KEY matches between frontend and backend

**If getting 500 Internal Server Error:**
- Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set correctly
