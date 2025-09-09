/*
  # Initial Schema Setup for E-JobCard System

  1. New Tables
    - `engineers`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `password_hash` (text)
      - `engineer_id` (text, unique)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `job_cards`
      - `id` (uuid, primary key)
      - `job_card_id` (text, unique)
      - `hospital_name` (text)
      - `machine_type` (text)
      - `machine_model` (text)
      - `serial_number` (text)
      - `problem_reported` (text)
      - `service_performed` (text)
      - `engineer_id` (text, foreign key)
      - `facility_signature` (text)
      - `date_time` (timestamp)
      - `created_at` (timestamp)
      - `drive_file_id` (text, nullable)
      - `email_sent` (boolean, default false)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Engineers can only access their own job cards
    - Admins can access all data
*/

-- Create engineers table
CREATE TABLE IF NOT EXISTS engineers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  engineer_id text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create job_cards table
CREATE TABLE IF NOT EXISTS job_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_card_id text UNIQUE NOT NULL,
  hospital_name text NOT NULL,
  machine_type text NOT NULL,
  machine_model text NOT NULL,
  serial_number text NOT NULL,
  problem_reported text NOT NULL,
  service_performed text NOT NULL,
  engineer_id text NOT NULL REFERENCES engineers(engineer_id),
  facility_signature text,
  date_time timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  drive_file_id text,
  email_sent boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE engineers ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_cards ENABLE ROW LEVEL SECURITY;

-- Policies for engineers table
CREATE POLICY "Engineers can read own data"
  ON engineers
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = email OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage engineers"
  ON engineers
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Policies for job_cards table
CREATE POLICY "Engineers can read own job cards"
  ON job_cards
  FOR SELECT
  TO authenticated
  USING (engineer_id = auth.jwt() ->> 'engineer_id' OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Engineers can insert own job cards"
  ON job_cards
  FOR INSERT
  TO authenticated
  WITH CHECK (engineer_id = auth.jwt() ->> 'engineer_id');

CREATE POLICY "Admins can manage all job cards"
  ON job_cards
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Insert default engineers
INSERT INTO engineers (name, email, password_hash, engineer_id) VALUES
  ('John Kamau', 'john.kamau@nairobiXraySupplies.com', '$2b$10$rQZ9QmjkQZ9QmjkQZ9QmjO', 'ENG-001'),
  ('Mary Wanjiku', 'mary.wanjiku@nairobiXraySupplies.com', '$2b$10$rQZ9QmjkQZ9QmjkQZ9QmjO', 'ENG-002')
ON CONFLICT (email) DO NOTHING;