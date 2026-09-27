import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://tmjpjrtxajrqxodmrbqq.supabase.co';
const legacyServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtanBqcnR4YWpycXhvZG1yYnFxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDg5NzgxNCwiZXhwIjoyMTAwNDczODE0fQ.eH3ZCrp3a7nPRhtj10VN96IffbaQ7pWVEsAhvovKMmk";

const supabase = createClient(supabaseUrl, legacyServiceRoleKey);

async function run() {
  console.log("=== ADMINS AUDIT ===");
  const { data: admins } = await supabase.from('administrators').select('*, users(email, roles(name))');
  console.log("Administrators:", JSON.stringify(admins, null, 2));

  console.log("\n=== ELECTION OFFICERS AUDIT ===");
  const { data: assignments } = await supabase.from('election_officer_assignments').select('*, users(email, roles(name))');
  console.log("EO Assignments:", JSON.stringify(assignments, null, 2));

  console.log("\n=== USERS BY ROLE ===");
  const { data: users } = await supabase.from('users').select('email, roles(name)');
  console.log("Users:", JSON.stringify(users, null, 2));
}

run();
