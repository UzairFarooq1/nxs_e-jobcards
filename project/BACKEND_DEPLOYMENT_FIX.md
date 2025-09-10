# 🔧 Backend Deployment Fix

## Issue Fixed
- ✅ Updated backend to export default app for Vercel
- ✅ Simplified Vercel configuration
- ✅ Fixed ES module compatibility

## Deploy Now

### Step 1: Deploy to Vercel
```bash
# Make sure you're in the backend directory
cd backend

# Deploy to Vercel
vercel --prod
```

### Step 2: Set Environment Variables
In your Vercel backend project settings, add:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ADMIN_API_KEY=your_secure_random_string
```

### Step 3: Test the Endpoint
After deployment, test with:

```bash
curl -X POST https://nxs-e-jobcards-backend.vercel.app/api/admin/create-engineer \
  -H "Content-Type: application/json" \
  -H "x-admin-api-key: your_secure_random_string" \
  -d '{"name":"Test","email":"test@example.com"}'
```

## What Changed

1. **Backend (`index.js`):**
   - Added `export default app` for Vercel
   - Server only starts in development mode
   - Proper ES module export

2. **Vercel Config (`vercel.json`):**
   - Simplified routing configuration
   - Removed unnecessary headers that might cause issues

## Expected Result

After deployment:
- ✅ `/api/admin/create-engineer` endpoint will exist
- ✅ Frontend will successfully create engineers
- ✅ Engineers will be added to Supabase Auth
- ✅ Engineers will be added to the `engineers` table

## Troubleshooting

**If still getting 404:**
- Check Vercel function logs
- Verify the deployment was successful
- Try redeploying with `vercel --prod --force`

**If getting 500 error:**
- Check environment variables are set
- Verify Supabase credentials are correct
