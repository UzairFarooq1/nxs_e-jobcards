# URGENT: Setup User in Supabase Auth

The job card creation is failing because the user is not properly authenticated with Supabase Auth.

## Quick Fix (Temporary)
1. Run the SQL in `URGENT_FIX_RLS.sql` to disable RLS temporarily
2. This will allow job cards to be created immediately

## Proper Fix (Recommended)
1. Go to your Supabase Dashboard
2. Navigate to **Authentication > Users**
3. Click **"Add User"**
4. Create user with:
   - **Email**: `charles.wanjohi@nxsltd.com`
   - **Password**: `password123`
   - **Email Confirmed**: ✅ (check this)
5. Copy the **User ID** (UUID)
6. Run this SQL in Supabase SQL Editor:

```sql
-- Replace YOUR_UUID_HERE with the actual UUID from Supabase Auth
INSERT INTO engineers (id, name, email, engineer_id, password) 
VALUES (
  'YOUR_UUID_HERE',
  'Charles Wanjohi',
  'charles.wanjohi@nxsltd.com',
  'ENG-001',
  'password123'
);
```

7. Re-enable RLS with proper policies:

```sql
-- Re-enable RLS
ALTER TABLE job_cards ENABLE ROW LEVEL SECURITY;

-- Create proper policies
CREATE POLICY "Authenticated users can insert job cards" ON job_cards
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read job cards" ON job_cards
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update job cards" ON job_cards
    FOR UPDATE USING (auth.role() = 'authenticated');
```

## Test
After setup, try creating a job card again. It should save to the database successfully.
