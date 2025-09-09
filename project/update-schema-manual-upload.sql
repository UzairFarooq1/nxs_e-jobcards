-- Update database schema to support manual job card uploads
-- Run this in Supabase SQL Editor

-- Add manual upload columns to job_cards table
ALTER TABLE job_cards 
ADD COLUMN IF NOT EXISTS manual_upload BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS manual_file TEXT,
ADD COLUMN IF NOT EXISTS manual_reason TEXT;

-- Create index for manual uploads (optional, for better performance)
CREATE INDEX IF NOT EXISTS idx_job_cards_manual_upload 
ON job_cards(manual_upload) 
WHERE manual_upload = TRUE;

-- Update RLS policies to allow manual uploads
-- (Assuming you have existing RLS policies)

-- Check current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'job_cards';

-- If you need to update RLS policies for manual uploads, uncomment below:
-- DROP POLICY IF EXISTS "Users can insert job cards" ON job_cards;
-- CREATE POLICY "Users can insert job cards" ON job_cards
--     FOR INSERT WITH CHECK (
--         auth.uid() IS NOT NULL AND (
--             manual_upload = TRUE OR 
--             (manual_upload = FALSE AND hospital_name IS NOT NULL)
--         )
--     );

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'job_cards' 
AND column_name IN ('manual_upload', 'manual_file', 'manual_reason')
ORDER BY ordinal_position;

-- Test insert (optional - remove after testing)
-- INSERT INTO job_cards (
--     id, hospital_name, facility_signature, machine_type, machine_model,
--     serial_number, problem_reported, service_performed, engineer_name,
--     engineer_id, date_time, created_at, status, manual_upload, manual_file, manual_reason
-- ) VALUES (
--     'test-manual-' || extract(epoch from now())::text,
--     'Manual Upload',
--     '',
--     'Manual Upload',
--     'Manual Upload',
--     'Manual Upload',
--     'Test manual upload',
--     'Test manual upload',
--     'Test Engineer',
--     'ENG-TEST',
--     now()::text,
--     now(),
--     'completed',
--     true,
--     'test-manual-jobcard.pdf',
--     'Testing manual upload functionality'
-- );

-- Clean up test data (uncomment if you ran the test insert)
-- DELETE FROM job_cards WHERE id LIKE 'test-manual-%';

COMMIT;
