# Engineer Creation Setup Guide

## Problem Fixed
- **Issue**: "User not allowed" error when admin tries to add engineers
- **Cause**: Frontend was calling Supabase Admin APIs directly (requires service role)
- **Solution**: Created secure backend endpoint that uses Supabase service role

## Environment Variables Required

### Backend (Vercel/Server)
Set these in your Vercel backend environment variables:

```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ADMIN_API_KEY=your_secure_random_string_here
```

### Frontend (Vercel)
Set these in your Vercel frontend environment variables:

```bash
VITE_API_URL=https://your-backend-project.vercel.app
VITE_ADMIN_API_KEY=your_secure_random_string_here
```

**Note**: `VITE_ADMIN_API_KEY` must match `ADMIN_API_KEY` from backend.

## How It Works

1. **Admin submits engineer form** (name, email, optional engineerId)
2. **Frontend calls backend** `/api/admin/create-engineer` with API key
3. **Backend verifies API key** and uses Supabase service role to:
   - Create Auth user (no password set)
   - Generate invite link for engineer to set password
   - Insert row in `engineers` table (no password stored)
4. **Engineer receives invite** and sets their own password
5. **Engineer can login** with their email and chosen password

## Security Features

- ✅ Passwords never stored in `engineers` table
- ✅ Engineers set their own passwords via invite link
- ✅ API key required for admin operations
- ✅ Service role only used on backend (not exposed to frontend)

## Testing

1. **Local testing**:
   ```bash
   # Set environment variables
   export SUPABASE_URL=your_url
   export SUPABASE_SERVICE_ROLE_KEY=your_key
   export ADMIN_API_KEY=test123
   export API_URL=http://localhost:3001
   
   # Start backend
   cd server && npm start
   
   # Test endpoint
   node test-engineer-endpoint.js
   ```

2. **Production testing**:
   - Deploy backend with environment variables
   - Deploy frontend with environment variables
   - Try adding engineer from admin dashboard

## Troubleshooting

- **404 Error**: Check `VITE_API_URL` doesn't have `/api` suffix
- **403 Forbidden**: Check `VITE_ADMIN_API_KEY` matches backend `ADMIN_API_KEY`
- **500 Error**: Check Supabase environment variables are set correctly
- **User not allowed**: This should be fixed with the new backend endpoint

## Files Modified

- `backend/index.js` - Added `/api/admin/create-engineer` endpoint
- `src/contexts/AuthContext.tsx` - Updated `addEngineer` to call backend
- `backend/package.json` - Added `@supabase/supabase-js` dependency
