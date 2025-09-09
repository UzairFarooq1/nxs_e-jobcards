-- URGENT FIX: Disable RLS temporarily for testing
-- Run this in your Supabase SQL Editor

-- Temporarily disable RLS on job_cards table
ALTER TABLE job_cards DISABLE ROW LEVEL SECURITY;

-- Check if RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'job_cards';

-- This will allow all operations on job_cards table
-- WARNING: This is not secure for production!
-- Re-enable RLS later with proper policies
