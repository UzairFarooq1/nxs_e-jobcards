-- Fix User Issue for charles.wanjohi@nxsltd.com
-- Run this in your Supabase SQL Editor

-- Step 1: Check if user exists in engineers table
SELECT * FROM engineers WHERE email = 'charles.wanjohi@nxsltd.com';

-- Step 2: Check all engineers
SELECT id, name, email, engineer_id FROM engineers ORDER BY name;

-- Step 3: If user doesn't exist, add them
-- First, get the UUID from Supabase Auth (go to Authentication > Users)
-- Then run this INSERT (replace YOUR_UUID_HERE with actual UUID):

-- INSERT INTO engineers (id, name, email, engineer_id, password) 
-- VALUES (
--   'YOUR_UUID_HERE', -- Get this from Supabase Auth users
--   'Charles Wanjohi',
--   'charles.wanjohi@nxsltd.com',
--   'ENG-003',
--   'password123'
-- );

-- Step 4: Verify the user was added
-- SELECT * FROM engineers WHERE email = 'charles.wanjohi@nxsltd.com';
