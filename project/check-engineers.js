// Quick script to check engineers in database
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://uqpankjtcuqoknaimdcb.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxcGFua2p0Y3Vxb2tuYWltZGNiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM5MjA2NiwiZXhwIjoyMDcyOTY4MDY2fQ.8QZ9QmjkQZ9QmjkQZ9QmjO'
);

async function checkEngineers() {
  try {
    const { data, error } = await supabase
      .from('engineers')
      .select('*');
    
    if (error) {
      console.error('Error fetching engineers:', error);
      return;
    }
    
    console.log('Engineers in database:');
    data.forEach(engineer => {
      console.log(`- ${engineer.name} (${engineer.engineer_id}): ${engineer.email}`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

checkEngineers();
