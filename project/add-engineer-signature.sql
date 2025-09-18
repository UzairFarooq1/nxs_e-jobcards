-- Add engineer signature column to job_cards table
-- Run this in your Supabase SQL Editor

-- Add engineer_signature column to job_cards table
ALTER TABLE job_cards 
ADD COLUMN IF NOT EXISTS engineer_signature TEXT;

-- Update existing records to have empty engineer signature
UPDATE job_cards 
SET engineer_signature = '' 
WHERE engineer_signature IS NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'job_cards' 
AND column_name = 'engineer_signature';

-- Show sample data
SELECT job_card_id, hospital_name, engineer_name, 
       CASE 
         WHEN facility_signature IS NOT NULL AND facility_signature != '' THEN 'Facility: ✓'
         ELSE 'Facility: ✗'
       END as facility_sig_status,
       CASE 
         WHEN engineer_signature IS NOT NULL AND engineer_signature != '' THEN 'Engineer: ✓'
         ELSE 'Engineer: ✗'
       END as engineer_sig_status
FROM job_cards 
ORDER BY created_at DESC 
LIMIT 5;
