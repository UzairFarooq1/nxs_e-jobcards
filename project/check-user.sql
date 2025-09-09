-- Check if user exists in engineers table
-- Run this in your Supabase SQL Editor

-- Check if charles.wanjohi@nxsltd.com exists
SELECT * FROM engineers WHERE email = 'charles.wanjohi@nxsltd.com';

-- Check all engineers
SELECT id, name, email, engineer_id FROM engineers;

-- If the user doesn't exist, add them:
-- INSERT INTO engineers (id, name, email, engineer_id, password) 
-- VALUES (
--   'YOUR_UUID_HERE', -- Get this from Supabase Auth users
--   'Charles Wanjohi',
--   'charles.wanjohi@nxsltd.com',
--   'ENG-003',
--   'password123'
-- );
