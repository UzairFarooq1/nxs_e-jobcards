# 🔧 Fix: Supabase Localhost Redirect Issue

## 🎯 **Problem Identified**

The engineer invite link is redirecting to:
```
http://localhost:3000/#access_token=eyJhbGciOiJIUzI1NiIsImtpZCI6IkVDa1VsYmN2NzNTQTZWZDUiLCJ0eXAiOiJKV1QifQ...
```

Instead of:
```
https://nxs-e-jobcards.vercel.app/#access_token=eyJhbGciOiJIUzI1NiIsImtpZCI6IkVDa1VsYmN2NzNTQTZWZDUiLCJ0eXAiOiJKV1QifQ...
```

## 🔧 **Root Cause**

**Supabase project is still configured with localhost URLs** instead of production URLs.

## ✅ **CRITICAL FIX REQUIRED**

### 1. **Update Supabase Dashboard Settings** (MOST IMPORTANT)

**Go to Supabase Dashboard:**
1. Visit [supabase.com](https://supabase.com)
2. Go to your project: `uqpankjtcuqoknaimdcb`
3. Navigate to **Authentication** → **URL Configuration**

**Update these settings:**

**Site URL:**
```
https://nxs-e-jobcards.vercel.app
```

**Redirect URLs (add all of these):**
```
https://nxs-e-jobcards.vercel.app/**
https://nxs-e-jobcards.vercel.app/auth/callback
https://nxs-e-jobcards.vercel.app
https://nxs-e-jobcards.vercel.app/#**
```

**Additional redirect URLs (optional):**
```
https://nxs-e-jobcards.vercel.app/auth/callback#**
https://nxs-e-jobcards.vercel.app/?**
```

### 2. **Frontend Code Updates** (Already Applied)

✅ Updated `AuthCallback.tsx` to handle hash-based auth tokens  
✅ Updated `App.tsx` to detect hash-based auth callbacks  
✅ Added comprehensive logging for debugging  

## 🔍 **How to Verify the Fix**

### Step 1: Update Supabase Settings
After updating the Supabase dashboard settings, wait 1-2 minutes for changes to propagate.

### Step 2: Test Engineer Creation
1. **Admin creates new engineer account**
2. **Engineer receives email with "Set Your Password" button**
3. **Engineer clicks button - should now redirect to:**
   ```
   https://nxs-e-jobcards.vercel.app/#access_token=...&type=invite
   ```

### Step 3: Verify Auth Flow
1. **AuthCallback component should detect the tokens**
2. **Engineer should be able to set password**
3. **Engineer should be redirected to login**

## 📋 **Supabase Dashboard Screenshots Guide**

### Navigation Path:
```
Supabase Dashboard → Your Project → Authentication → URL Configuration
```

### Settings to Update:
```
┌─────────────────────────────────────────────────┐
│ Site URL                                        │
│ https://nxs-e-jobcards.vercel.app              │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Redirect URLs (one per line)                    │
│ https://nxs-e-jobcards.vercel.app/**           │
│ https://nxs-e-jobcards.vercel.app/auth/callback│
│ https://nxs-e-jobcards.vercel.app              │
│ https://nxs-e-jobcards.vercel.app/#**          │
└─────────────────────────────────────────────────┘
```

## 🚨 **If Still Getting Localhost**

### 1. **Double-check Supabase Settings**
- Make sure you saved the changes
- Try refreshing the Supabase dashboard
- Verify you're editing the correct project

### 2. **Clear Supabase Cache**
- Wait 2-3 minutes after making changes
- Try creating a new engineer account (don't reuse old invite links)

### 3. **Check Environment Variables**
Make sure your backend is using the correct Supabase project:
```bash
# Backend should use:
SUPABASE_URL=https://uqpankjtcuqoknaimdcb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🔧 **Debug Information**

After the fix, you should see in browser console:
```
🔍 Checking auth callback...
  window.location: Location {...}
  pathname: /
  search: 
  href: https://nxs-e-jobcards.vercel.app/#access_token=...
  isAuthCallback result: true

Auth callback - search params: 
Auth callback - hash params: #access_token=...&type=invite
Auth callback - type: null
Auth callback - token type: invite
Auth callback - has access token: true
```

## 🎯 **Expected Result**

After updating Supabase settings:
- ✅ Invite emails redirect to production URL
- ✅ Engineers can set passwords on production site
- ✅ Hash-based auth tokens are handled properly
- ✅ Engineers are redirected to login after setup

## ⚠️ **Important Notes**

1. **The fix is primarily in Supabase Dashboard settings**, not code
2. **Changes may take 1-2 minutes to propagate**
3. **Old invite links will still use old settings** - create new engineer accounts to test
4. **Make sure to save settings in Supabase Dashboard**

The localhost redirect should be completely resolved once the Supabase settings are updated! 🎉
