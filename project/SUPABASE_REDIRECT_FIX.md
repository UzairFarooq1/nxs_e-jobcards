# 🔧 Supabase Redirect URL Fix

## Problem
Engineer invite emails redirect to `localhost:3000` instead of production URL `https://nxs-e-jobcards.vercel.app/`

## Root Cause
1. Supabase project configured with localhost URLs
2. Backend not specifying production redirect URL
3. Missing auth callback handler in frontend

## ✅ Complete Fix Applied

### 1. **Backend Code Updated**
- Added `redirectTo` option in invite link generation
- Now points to: `https://nxs-e-jobcards.vercel.app/auth/callback`

### 2. **Frontend Auth Callback Created**
- New `AuthCallback.tsx` component handles invite redirects
- Shows loading states and success/error messages
- Automatically redirects to login after password setup

### 3. **App Routing Updated**
- Detects auth callback URLs
- Routes to AuthCallback component appropriately

## 🚀 Deployment Steps

### Step 1: Update Supabase Dashboard Settings

Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**:

**Site URL:**
```
https://nxs-e-jobcards.vercel.app
```

**Redirect URLs (add these):**
```
https://nxs-e-jobcards.vercel.app/**
https://nxs-e-jobcards.vercel.app/auth/callback
```

### Step 2: Deploy Backend
```bash
cd backend
vercel --prod
```

### Step 3: Deploy Frontend  
```bash
vercel --prod
```

### Step 4: Test the Flow

1. **Create Engineer Account**
   - Login as admin
   - Add new engineer
   - Engineer receives email

2. **Engineer Sets Password**
   - Engineer clicks "Set Your Password" button
   - Should redirect to: `https://nxs-e-jobcards.vercel.app/auth/callback`
   - Shows password setup form
   - After setup, redirects to login page

3. **Engineer Logs In**
   - Engineer uses email + new password
   - Successfully accesses system

## 📧 Email Flow Now Works Like This:

```
1. Admin creates engineer account
   ↓
2. Engineer receives email with button:
   "Set Your Password" 
   ↓
3. Button links to:
   https://nxs-e-jobcards.vercel.app/auth/callback?type=invite&token=...
   ↓
4. AuthCallback component shows:
   "Setting up your account..."
   ↓
5. After password setup:
   "Account setup successful! Redirecting to login..."
   ↓
6. Redirects to main app login page
   ↓
7. Engineer logs in with email + password
```

## 🔍 Troubleshooting

### If Still Redirecting to Localhost:
1. **Check Supabase URL Configuration** (most common issue)
2. **Clear browser cache** and try again
3. **Redeploy backend** to ensure new redirect URL is active

### If AuthCallback Page Shows Error:
1. Check browser console for errors
2. Verify Supabase environment variables
3. Ensure invite link hasn't expired (24 hours)

### If Password Setup Doesn't Work:
1. Check Supabase Auth settings
2. Verify redirect URLs include wildcards
3. Try creating a new engineer account

## 📝 Files Modified

### Backend:
- `backend/index.js` - Added redirectTo option
- `server/server.js` - Added redirectTo option

### Frontend:
- `src/components/AuthCallback.tsx` - New auth callback handler
- `src/App.tsx` - Added auth callback routing

## 🎯 Expected Result

After this fix:
- ✅ Engineer invite emails redirect to production URL
- ✅ Password setup works on production site  
- ✅ Engineers can successfully set passwords
- ✅ Engineers can login after password setup
- ✅ Professional auth callback experience

The redirect issue should be completely resolved! 🎉
