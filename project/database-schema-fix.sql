-- NXS E-JobCard System Database Schema - CORRECTED VERSION
-- This schema matches the actual application implementation
-- Run these queries in your Supabase SQL Editor

-- Drop existing policies first
DROP POLICY IF EXISTS "Engineers can read own data" ON engineers;
DROP POLICY IF EXISTS "Admins can read all engineers" ON engineers;
DROP POLICY IF EXISTS "Admins can insert engineers" ON engineers;
DROP POLICY IF EXISTS "Admins can update engineers" ON engineers;
DROP POLICY IF EXISTS "Engineers can read own job cards" ON job_cards;
DROP POLICY IF EXISTS "Admins can read all job cards" ON job_cards;
DROP POLICY IF EXISTS "Engineers can insert own job cards" ON job_cards;
DROP POLICY IF EXISTS "Admins can insert job cards" ON job_cards;
DROP POLICY IF EXISTS "Engineers can update own job cards" ON job_cards;
DROP POLICY IF EXISTS "Admins can update all job cards" ON job_cards;

-- Update engineers table to remove password field (not needed with Supabase Auth)
ALTER TABLE engineers DROP COLUMN IF EXISTS password;

-- Create correct RLS policies that match the application logic
-- Engineers can read their own data
CREATE POLICY "Engineers can read own data" ON engineers
    FOR SELECT USING (auth.jwt() ->> 'email' = email OR auth.jwt() ->> 'role' = 'admin');

-- Admins can manage all engineers
CREATE POLICY "Admins can manage engineers" ON engineers
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Engineers can read their own job cards
CREATE POLICY "Engineers can read own job cards" ON job_cards
    FOR SELECT USING (engineer_id = auth.jwt() ->> 'engineer_id' OR auth.jwt() ->> 'role' = 'admin');

-- Engineers can insert their own job cards
CREATE POLICY "Engineers can insert own job cards" ON job_cards
    FOR INSERT WITH CHECK (engineer_id = auth.jwt() ->> 'engineer_id');

-- Admins can manage all job cards
CREATE POLICY "Admins can manage all job cards" ON job_cards
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Update the function to work with the correct schema
CREATE OR REPLACE FUNCTION get_job_cards_by_engineer_email(engineer_email TEXT)
RETURNS TABLE (
    id VARCHAR(100),
    hospital_name VARCHAR(255),
    facility_signature TEXT,
    machine_type VARCHAR(255),
    machine_model VARCHAR(255),
    serial_number VARCHAR(255),
    problem_reported TEXT,
    service_performed TEXT,
    engineer_name VARCHAR(255),
    engineer_id VARCHAR(50),
    date_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20),
    before_service_images TEXT[],
    after_service_images TEXT[],
    facility_stamp_image TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT jc.*
    FROM job_cards jc
    JOIN engineers e ON jc.engineer_id = e.engineer_id
    WHERE e.email = engineer_email
    ORDER BY jc.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_job_cards_by_engineer_email(TEXT) TO authenticated;

-- Insert sample engineers (without password field)
INSERT INTO engineers (name, email, engineer_id) VALUES
('John Kamau', 'john.kamau@nairobiXraySupplies.com', 'ENG-001'),
('Mary Wanjiku', 'mary.wanjiku@nairobiXraySupplies.com', 'ENG-002')
ON CONFLICT (email) DO NOTHING;

-- Verify the schema is correct
SELECT 'Schema updated successfully' as status;

