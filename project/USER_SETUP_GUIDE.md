# User Setup Guide for NXS E-JobCard System

## Step 1: Create Users in Supabase Authentication

**Important**: All login credentials are now managed by Supabase Auth. You must create users in Supabase Authentication first.

### Admin User
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Users**
3. Click **Add User**
4. Fill in the details:
   - **Email**: `it@vanguard-group.org`
   - **Password**: `Vgc@admin2025!`
   - **Confirm email**: ✅ (checked)
5. Click **Create User**
6. **Copy the User ID** (UUID) - you'll need this for the next step

### Engineer Users
Repeat the process for each engineer:

#### Engineer 1
- **Email**: `john.kamau@nairobiXraySupplies.com`
- **Password**: `password123`
- **Confirm email**: ✅ (checked)
- **Copy the User ID** (UUID)

#### Engineer 2
- **Email**: `mary.wanjiku@nairobiXraySupplies.com`
- **Password**: `password123`
- **Confirm email**: ✅ (checked)
- **Copy the User ID** (UUID)

## Step 2: Update the Database

1. Go to **SQL Editor** in your Supabase Dashboard
2. Run the following query, replacing the UUIDs with the actual ones from Step 1:

```sql
-- Insert admin user (replace with actual UUID from auth.users)
INSERT INTO engineers (id, name, email, engineer_id, password) 
VALUES (
  'YOUR_ADMIN_UUID_HERE', -- Replace with actual UUID
  'Admin User',
  'it@vanguard-group.org',
  'ADMIN-001',
  'Vgc@admin2025!'
) ON CONFLICT (email) DO NOTHING;

-- Insert engineer 1 (replace with actual UUID from auth.users)
INSERT INTO engineers (id, name, email, engineer_id, password) 
VALUES (
  'YOUR_ENGINEER1_UUID_HERE', -- Replace with actual UUID
  'John Kamau',
  'john.kamau@nairobiXraySupplies.com',
  'ENG-001',
  'password123'
) ON CONFLICT (email) DO NOTHING;

-- Insert engineer 2 (replace with actual UUID from auth.users)
INSERT INTO engineers (id, name, email, engineer_id, password) 
VALUES (
  'YOUR_ENGINEER2_UUID_HERE', -- Replace with actual UUID
  'Mary Wanjiku',
  'mary.wanjiku@nairobiXraySupplies.com',
  'ENG-002',
  'password123'
) ON CONFLICT (email) DO NOTHING;
```

## Step 3: Verify Setup

Run this query to verify all users are created:

```sql
SELECT id, name, email, engineer_id FROM engineers;
```

You should see 3 users:
- Admin User (it@vanguard-group.org)
- John Kamau (john.kamau@nairobiXraySupplies.com)
- Mary Wanjiku (mary.wanjiku@nairobiXraySupplies.com)

## Step 4: Test Login

1. Start your development server: `npm run dev`
2. Go to `http://localhost:5173`
3. Try logging in with:
   - **Admin**: `it@vanguard-group.org` / `Vgc@admin2025!`
   - **Engineer**: `john.kamau@nairobiXraySupplies.com` / `password123`

## Troubleshooting

### If login fails:
1. Check that the user exists in **Authentication** > **Users**
2. Verify the email is confirmed
3. Check that the user exists in the `engineers` table
4. Ensure the UUIDs match between auth.users and engineers table

### If you get permission errors:
1. Make sure you've run the RLS policies from `database-schema.sql`
2. Check that the user has the correct role in the engineers table

## Adding New Engineers

To add new engineers in the future:

1. **Create user in Supabase Auth** (Authentication > Users > Add User)
2. **Add to engineers table** using the admin dashboard in the app
3. The admin dashboard will handle the database insertion automatically

## Security Notes

- The admin user has full access to all job cards and engineer management
- Engineers can only see and manage their own job cards
- All passwords are stored securely in Supabase Auth
- The engineers table stores additional metadata for the application
