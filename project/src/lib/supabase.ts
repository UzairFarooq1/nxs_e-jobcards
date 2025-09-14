import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate URL format before creating client
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('VITE_SUPABASE_URL:', supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '[REDACTED]' : 'undefined');
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Validate URL format
if (!supabaseUrl.startsWith('https://')) {
  console.error('❌ Invalid Supabase URL format:', supabaseUrl);
  throw new Error('Invalid Supabase URL format. URL must start with https://');
}

console.log('✅ Creating Supabase client with URL:', supabaseUrl);
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      engineers: {
        Row: {
          id: string;
          name: string;
          email: string;
          password_hash: string;
          engineer_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          password_hash: string;
          engineer_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          password_hash?: string;
          engineer_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      job_cards: {
        Row: {
          id: string;
          job_card_id: string;
          hospital_name: string;
          machine_type: string;
          machine_model: string;
          serial_number: string;
          problem_reported: string;
          service_performed: string;
          engineer_id: string;
          facility_signature: string | null;
          date_time: string;
          created_at: string;
          drive_file_id: string | null;
          email_sent: boolean;
        };
        Insert: {
          id?: string;
          job_card_id: string;
          hospital_name: string;
          machine_type: string;
          machine_model: string;
          serial_number: string;
          problem_reported: string;
          service_performed: string;
          engineer_id: string;
          facility_signature?: string | null;
          date_time: string;
          created_at?: string;
          drive_file_id?: string | null;
          email_sent?: boolean;
        };
        Update: {
          id?: string;
          job_card_id?: string;
          hospital_name?: string;
          machine_type?: string;
          machine_model?: string;
          serial_number?: string;
          problem_reported?: string;
          service_performed?: string;
          engineer_id?: string;
          facility_signature?: string | null;
          date_time?: string;
          created_at?: string;
          drive_file_id?: string | null;
          email_sent?: boolean;
        };
      };
    };
  };
};