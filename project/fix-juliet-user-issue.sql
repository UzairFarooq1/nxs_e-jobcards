-- Fix Juliet Timpiyian user issue
-- This script will help resolve the authentication problem

-- Step 1: Check current engineers
SELECT 'Current engineers in database:' as info;
SELECT id, name, email, engineer_id, created_at 
FROM engineers 
ORDER BY created_at;

-- Step 2: Check if Juliet exists
SELECT 'Checking for Juliet Timpiyian:' as info;
SELECT * FROM engineers 
WHERE email = 'juliet.timpiyian@nxsltd.com';

-- Step 3: If Juliet doesn't exist, you need to:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Find juliet.timpiyian@nxsltd.com
-- 3. Copy her user ID
-- 4. Run the INSERT statement below with the correct ID

-- Step 4: Add Juliet (replace USER_ID_FROM_AUTH with actual ID)
-- INSERT INTO engineers (id, name, email, engineer_id)
-- VALUES (
--   'USER_ID_FROM_AUTH', -- Replace with actual user ID from Supabase Auth
--   'Juliet Timpiyian',
--   'juliet.timpiyian@nxsltd.com',
--   'ENG-002'
-- );

-- Step 5: Verify the fix
SELECT 'After adding Juliet:' as info;
SELECT * FROM engineers 
WHERE email = 'juliet.timpiyian@nxsltd.com';

-- Step 6: Check all engineers
SELECT 'All engineers after fix:' as info;
SELECT id, name, email, engineer_id, created_at 
FROM engineers 
ORDER BY created_at;
