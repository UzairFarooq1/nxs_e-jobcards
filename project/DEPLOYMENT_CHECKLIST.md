# Backend Deployment Checklist

## ✅ Current Status
- ✅ Frontend code updated (calling backend endpoint)
- ✅ Backend code updated (`backend/index.js` has new endpoint)
- ✅ Backend dependencies updated (`backend/package.json` has Supabase)
- ❌ Backend NOT deployed yet (endpoint doesn't exist)

## 🚀 Deployment Steps

### 1. Deploy Backend to Vercel
```bash
# Navigate to backend folder
cd backend

# Install dependencies (if not already done)
npm install

# Deploy to Vercel
vercel --prod
```

### 2. Set Backend Environment Variables in Vercel
Go to your Vercel backend project dashboard and add:
```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ADMIN_API_KEY=your_secure_random_string
```

### 3. Set Frontend Environment Variables in Vercel
Go to your Vercel frontend project dashboard and add:
```bash
VITE_API_URL=https://your-backend-project.vercel.app
VITE_ADMIN_API_KEY=your_secure_random_string
```

### 4. Test the Deployment
After deployment, test the endpoint:
```bash
curl -X POST https://your-backend-project.vercel.app/api/admin/create-engineer \
  -H "Content-Type: application/json" \
  -H "x-admin-api-key: your_secure_random_string" \
  -d '{"name":"Test","email":"test@example.com"}'
```

## 🔍 Troubleshooting

### If you get "Cannot POST /api/admin/create-engineer":
1. ✅ Backend not deployed with new code
2. ✅ Check Vercel deployment logs
3. ✅ Verify environment variables are set

### If you get "403 Forbidden":
1. ✅ Check ADMIN_API_KEY matches between frontend and backend
2. ✅ Verify the API key is being sent in the request header

### If you get "500 Internal Server Error":
1. ✅ Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set
2. ✅ Verify Supabase service role key has correct permissions

## 📝 Quick Test Commands

### Test locally first:
```bash
# Start backend locally
cd backend && npm start

# In another terminal, test it
node test-backend-local.js
```

### Test deployed backend:
```bash
# Replace with your actual backend URL
curl -X GET https://your-backend.vercel.app/api/health
```
