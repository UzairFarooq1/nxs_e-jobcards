-- Add Juliet Timpiyian to the engineers table
-- This user exists in Supabase Auth but not in the engineers table

-- First, let's check if she already exists
SELECT * FROM engineers WHERE email = 'juliet.timpiyian@nxsltd.com';

-- If not found, add her to the engineers table
-- Note: You'll need to get her actual user ID from Supabase Auth
-- Go to Supabase Dashboard > Authentication > Users > Find juliet.timpiyian@nxsltd.com
-- Copy the user ID and replace 'USER_ID_FROM_AUTH' below

INSERT INTO engineers (id, name, email, engineer_id)
VALUES (
  'USER_ID_FROM_AUTH', -- Replace with actual user ID from Supabase Auth
  'Juliet Timpiyian',
  'juliet.timpiyian@nxsltd.com',
  'ENG-002'
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  engineer_id = EXCLUDED.engineer_id;

-- Verify the insertion
SELECT * FROM engineers WHERE email = 'juliet.timpiyian@nxsltd.com';
