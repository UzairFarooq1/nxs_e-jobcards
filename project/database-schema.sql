-- NXS E-JobCard System Database Schema
-- Run these queries in your Supabase SQL Editor

-- Create engineers table
CREATE TABLE IF NOT EXISTS engineers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    engineer_id VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create job_cards table
CREATE TABLE IF NOT EXISTS job_cards (
    id VARCHAR(100) PRIMARY KEY,
    hospital_name VARCHAR(255) NOT NULL,
    facility_signature TEXT,
    machine_type VARCHAR(255) NOT NULL,
    machine_model VARCHAR(255) NOT NULL,
    serial_number VARCHAR(255) NOT NULL,
    problem_reported TEXT NOT NULL,
    service_performed TEXT NOT NULL,
    engineer_name VARCHAR(255) NOT NULL,
    engineer_id VARCHAR(50) NOT NULL,
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'pending')),
    before_service_images TEXT[], -- Array of base64 image strings
    after_service_images TEXT[], -- Array of base64 image strings
    facility_stamp_image TEXT -- Base64 image string
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_engineers_email ON engineers(email);
CREATE INDEX IF NOT EXISTS idx_engineers_engineer_id ON engineers(engineer_id);
CREATE INDEX IF NOT EXISTS idx_job_cards_engineer_id ON job_cards(engineer_id);
CREATE INDEX IF NOT EXISTS idx_job_cards_created_at ON job_cards(created_at);
CREATE INDEX IF NOT EXISTS idx_job_cards_status ON job_cards(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for engineers table
CREATE TRIGGER update_engineers_updated_at 
    BEFORE UPDATE ON engineers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (you'll need to create this user in Supabase Auth first)
-- The admin user should be created through Supabase Auth with email: it@vanguard-group.org
-- Then you can insert a record here if needed for reference

-- Insert sample engineers (optional - for testing)
INSERT INTO engineers (name, email, engineer_id, password) VALUES
('John Kamau', 'john.kamau@nairobiXraySupplies.com', 'ENG-001', 'password123'),
('Mary Wanjiku', 'mary.wanjiku@nairobiXraySupplies.com', 'ENG-002', 'password123')
ON CONFLICT (email) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE engineers ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_cards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for engineers table
-- Allow engineers to read their own data
CREATE POLICY "Engineers can read own data" ON engineers
    FOR SELECT USING (auth.jwt() ->> 'email' = email);

-- Allow admins to read all engineers
CREATE POLICY "Admins can read all engineers" ON engineers
    FOR SELECT USING (auth.jwt() ->> 'email' = 'it@vanguard-group.org');

-- Allow admins to insert engineers
CREATE POLICY "Admins can insert engineers" ON engineers
    FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = 'it@vanguard-group.org');

-- Allow admins to update engineers
CREATE POLICY "Admins can update engineers" ON engineers
    FOR UPDATE USING (auth.jwt() ->> 'email' = 'it@vanguard-group.org');

-- Create RLS policies for job_cards table
-- Allow engineers to read their own job cards
CREATE POLICY "Engineers can read own job cards" ON job_cards
    FOR SELECT USING (auth.jwt() ->> 'email' IN (
        SELECT email FROM engineers WHERE engineer_id = job_cards.engineer_id
    ));

-- Allow admins to read all job cards
CREATE POLICY "Admins can read all job cards" ON job_cards
    FOR SELECT USING (auth.jwt() ->> 'email' = 'it@vanguard-group.org');

-- Allow engineers to insert their own job cards
CREATE POLICY "Engineers can insert own job cards" ON job_cards
    FOR INSERT WITH CHECK (auth.jwt() ->> 'email' IN (
        SELECT email FROM engineers WHERE engineer_id = job_cards.engineer_id
    ));

-- Allow admins to insert job cards
CREATE POLICY "Admins can insert job cards" ON job_cards
    FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = 'it@vanguard-group.org');

-- Allow engineers to update their own job cards
CREATE POLICY "Engineers can update own job cards" ON job_cards
    FOR UPDATE USING (auth.jwt() ->> 'email' IN (
        SELECT email FROM engineers WHERE engineer_id = job_cards.engineer_id
    ));

-- Allow admins to update all job cards
CREATE POLICY "Admins can update all job cards" ON job_cards
    FOR UPDATE USING (auth.jwt() ->> 'email' = 'it@vanguard-group.org');

-- Create a view for job cards with engineer details (optional)
CREATE OR REPLACE VIEW job_cards_with_engineer AS
SELECT 
    jc.*,
    e.name as engineer_full_name,
    e.email as engineer_email
FROM job_cards jc
LEFT JOIN engineers e ON jc.engineer_id = e.engineer_id;

-- Grant permissions on the view
GRANT SELECT ON job_cards_with_engineer TO authenticated;

-- Create a function to get job cards by engineer email
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
