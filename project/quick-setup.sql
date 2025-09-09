-- Quick Setup SQL for NXS E-JobCard System
-- Run this in your Supabase SQL Editor for basic setup

-- Create engineers table
CREATE TABLE engineers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    engineer_id VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create job_cards table
CREATE TABLE job_cards (
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
    status VARCHAR(20) DEFAULT 'completed',
    before_service_images TEXT[],
    after_service_images TEXT[],
    facility_stamp_image TEXT
);

-- Insert sample data
INSERT INTO engineers (name, email, engineer_id, password) VALUES
('John Kamau', 'john.kamau@nairobiXraySupplies.com', 'ENG-001', 'password123'),
('Mary Wanjiku', 'mary.wanjiku@nairobiXraySupplies.com', 'ENG-002', 'password123');

-- Enable RLS
ALTER TABLE engineers ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_cards ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY "Allow all for authenticated users" ON engineers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON job_cards FOR ALL USING (auth.role() = 'authenticated');
