-- Fix RLS Policies for Job Cards
-- Run this in your Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Engineers can insert own job cards" ON job_cards;
DROP POLICY IF EXISTS "Admins can insert job cards" ON job_cards;

-- Create a simpler policy that allows all authenticated users to insert job cards
CREATE POLICY "Authenticated users can insert job cards" ON job_cards
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Also allow all authenticated users to read job cards (for now)
DROP POLICY IF EXISTS "Engineers can read own job cards" ON job_cards;
DROP POLICY IF EXISTS "Admins can read all job cards" ON job_cards;

CREATE POLICY "Authenticated users can read job cards" ON job_cards
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow all authenticated users to update job cards
DROP POLICY IF EXISTS "Engineers can update own job cards" ON job_cards;
DROP POLICY IF EXISTS "Admins can update all job cards" ON job_cards;

CREATE POLICY "Authenticated users can update job cards" ON job_cards
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'job_cards';
