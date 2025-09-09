# Fix Juliet Timpiyian User Issue

## 🚨 Problem
User `juliet.timpiyian@nxsltd.com` exists in Supabase Auth but not in the `engineers` table, causing login failures.

## ✅ Immediate Fix Applied
I've added Juliet to the fallback authentication list, so she can now login temporarily.

## 🔧 Permanent Fix Required

### Step 1: Get Juliet's User ID
1. **Go to Supabase Dashboard**
2. **Navigate to Authentication > Users**
3. **Find `juliet.timpiyian@nxsltd.com`**
4. **Copy her User ID** (looks like: `12345678-1234-1234-1234-123456789abc`)

### Step 2: Add to Engineers Table
1. **Go to Supabase Dashboard > SQL Editor**
2. **Run this query** (replace `USER_ID_FROM_AUTH` with actual ID):

```sql
INSERT INTO engineers (id, name, email, engineer_id)
VALUES (
  'USER_ID_FROM_AUTH', -- Replace with actual user ID
  'Juliet Timpiyian',
  'juliet.timpiyian@nxsltd.com',
  'ENG-002'
);
```

### Step 3: Verify Fix
```sql
SELECT * FROM engineers WHERE email = 'juliet.timpiyian@nxsltd.com';
```

## 🎯 What This Fixes

### Before Fix:
- ❌ Juliet can't login (database timeout)
- ❌ User gets logged out immediately
- ❌ "Unknown engineer" error

### After Fix:
- ✅ Juliet can login successfully
- ✅ No more database timeouts
- ✅ Full engineer functionality

## 📋 Files Updated

1. **`AuthContext.tsx`** - Added Juliet to fallback list
2. **`add-juliet-engineer.sql`** - SQL script to add Juliet
3. **`fix-juliet-user-issue.sql`** - Comprehensive fix script

## 🔍 Root Cause
This happens when:
1. User is created in Supabase Auth (via signup or admin)
2. User is NOT added to the `engineers` table
3. System tries to lookup user in `engineers` table
4. User not found → logout

## 🛡️ Prevention
To prevent this in the future:
1. **Always add users to both** Supabase Auth AND `engineers` table
2. **Use the admin dashboard** to create engineer accounts
3. **Check the `engineers` table** after user creation

## ✅ Status
- **Immediate fix**: ✅ Applied (Juliet can login now)
- **Permanent fix**: ⏳ Pending (add to database)
- **User experience**: ✅ Improved (no more logout)
