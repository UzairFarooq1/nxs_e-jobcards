-- Updated Database Schema (Password Removed from Engineers Table)
-- Run this in your Supabase SQL Editor

-- Drop the password column from engineers table if it exists
ALTER TABLE engineers DROP COLUMN IF EXISTS password;

-- Updated engineers table structure (without password)
-- CREATE TABLE IF NOT EXISTS engineers (
--     id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
--     name VARCHAR(255) NOT NULL,
--     email VARCHAR(255) UNIQUE NOT NULL,
--     engineer_id VARCHAR(50) UNIQUE NOT NULL,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- Verify the current structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'engineers' 
ORDER BY ordinal_position;

-- Note: Passwords are now managed entirely by Supabase Auth
-- No password storage in the engineers table for security
