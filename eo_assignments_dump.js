import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://tmjpjrtxajrqxodmrbqq.supabase.co';
const legacyServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtanBqcnR4YWpycXhvZG1yYnFxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDg5NzgxNCwiZXhwIjoyMTAwNDczODE0fQ.eH3ZCrp3a7nPRhtj10VN96IffbaQ7pWVEsAhvovKMmk";

const supabase = createClient(supabaseUrl, legacyServiceRoleKey);

async function run() {
  console.log("=== EO ASSIGNMENTS FULL DUMP ===");
  const { data, error } = await supabase.from('election_officer_assignments').select('*');
  if (error) console.error("Error:", error);
  console.log("Data:", JSON.stringify(data, null, 2));
}

run();
