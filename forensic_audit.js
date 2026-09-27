import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://tmjpjrtxajrqxodmrbqq.supabase.co';
const legacyServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtanBqcnR4YWpycXhvZG1yYnFxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDg5NzgxNCwiZXhwIjoyMTAwNDczODE0fQ.eH3ZCrp3a7nPRhtj10VN96IffbaQ7pWVEsAhvovKMmk";

const supabase = createClient(supabaseUrl, legacyServiceRoleKey);

async function run() {
  console.log("=== SUNDAY DATA AUDIT ===");

  const email = 'sundayifeoluwarichard@gmail.com';

  const { data: userData, error: uErr } = await supabase.from('users').select('id, email').eq('email', email).maybeSingle();
  if (uErr) console.error("User Error:", uErr);
  console.log("User Data:", userData);

  if (userData) {
    const { data: studentData, error: sErr } = await supabase.from('students').select('*').eq('user_id', userData.id).maybeSingle();
    if (sErr) console.error("Student Error:", sErr);
    console.log("Student Data:", studentData);
  }

  const { data: registerData, error: rErr } = await supabase.from('student_register').select('*').eq('email', email);
  if (rErr) console.error("Register Error:", rErr);
  console.log("Register Data:", JSON.stringify(registerData, null, 2));

  console.log("\n=== TEST DATA AUDIT (POSITIONS) ===");
  const { data: positions, error: pErr } = await supabase.from('positions').select('id, name, election_id, created_at');
  if (pErr) console.error("Positions Error:", pErr);
  console.log("Positions:", JSON.stringify(positions, null, 2));
  
  console.log("\n=== ELECTION STATUS AUDIT ===");
  const { data: elections, error: eErr } = await supabase.from('elections').select('id, name, election_status_id, election_statuses(name)');
  if (eErr) console.error("Elections Error:", eErr);
  console.log("Elections:", JSON.stringify(elections, null, 2));
}

run();
