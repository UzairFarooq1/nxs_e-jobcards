-- Setup Users for NXS E-JobCard System
-- IMPORTANT: Create users in Supabase Authentication FIRST, then run this SQL

-- Step 1: Create users in Supabase Dashboard
-- Go to Authentication > Users > Add User and create these users:
-- 1. it@vanguard-group.org / Vgc@admin2025!
-- 2. john.kamau@nairobiXraySupplies.com / password123
-- 3. mary.wanjiku@nairobiXraySupplies.com / password123

-- Step 2: Get the UUIDs from Authentication > Users
-- Copy the UUID for each user from the Supabase Dashboard

-- Step 3: Run this SQL with the actual UUIDs
-- Replace the placeholder UUIDs below with the real ones from Step 2

-- Admin User (replace with actual UUID from auth.users)
INSERT INTO engineers (id, name, email, engineer_id) 
VALUES (
  'YOUR_ADMIN_UUID_HERE', -- Replace with actual UUID from auth.users
  'Admin User',
  'it@vanguard-group.org',
  'ADMIN-001'
) ON CONFLICT (email) DO NOTHING;

-- Engineer 1 (replace with actual UUID from auth.users)
INSERT INTO engineers (id, name, email, engineer_id) 
VALUES (
  'YOUR_ENGINEER1_UUID_HERE', -- Replace with actual UUID from auth.users
  'John Kamau',
  'john.kamau@nairobiXraySupplies.com',
  'ENG-001'
) ON CONFLICT (email) DO NOTHING;

-- Engineer 2 (replace with actual UUID from auth.users)
INSERT INTO engineers (id, name, email, engineer_id) 
VALUES (
  'YOUR_ENGINEER2_UUID_HERE', -- Replace with actual UUID from auth.users
  'Mary Wanjiku',
  'mary.wanjiku@nairobiXraySupplies.com',
  'ENG-002'
) ON CONFLICT (email) DO NOTHING;

-- Verify the users were created
SELECT id, name, email, engineer_id FROM engineers;

-- Note: Passwords are managed entirely by Supabase Auth
-- No password storage in the engineers table for security
-- Password changes should be done through Supabase Auth or the application
