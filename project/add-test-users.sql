-- Add Test Users to Engineers Table
-- Run this in your Supabase SQL Editor

-- First, you need to create users in Supabase Auth, then get their UUIDs
-- Go to Authentication > Users > Add User
-- Create these users:
-- 1. charles.wanjohi@nxsltd.com (password: password123)
-- 2. john.doe@nxsltd.com (password: password123)
-- 3. jane.smith@nxsltd.com (password: password123)

-- After creating users in Auth, get their UUIDs and run these INSERTs:

-- Replace these UUIDs with actual ones from Supabase Auth
INSERT INTO engineers (id, name, email, engineer_id, password) VALUES 
('REPLACE_WITH_CHARLES_UUID', 'Charles Wanjohi', 'charles.wanjohi@nxsltd.com', 'ENG-001', 'password123'),
('REPLACE_WITH_JOHN_UUID', 'John Doe', 'john.doe@nxsltd.com', 'ENG-002', 'password123'),
('REPLACE_WITH_JANE_UUID', 'Jane Smith', 'jane.smith@nxsltd.com', 'ENG-003', 'password123');

-- Verify users were added
SELECT id, name, email, engineer_id FROM engineers ORDER BY name;
