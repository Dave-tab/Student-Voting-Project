import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://tmjpjrtxajrqxodmrbqq.supabase.co';
const legacyServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtanBqcnR4YWpycXhvZG1yYnFxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDg5NzgxNCwiZXhwIjoyMTAwNDczODE0fQ.eH3ZCrp3a7nPRhtj10VN96IffbaQ7pWVEsAhvovKMmk";

const supabase = createClient(supabaseUrl, legacyServiceRoleKey);

async function run() {
  const email = 'sundayifeoluwarichard@gmail.com';
  
  console.log(`=== AUDIT FOR ${email} ===`);
  
  // 1. Get User
  const { data: userData } = await supabase
    .from('users')
    .select('id, email, full_name')
    .eq('email', email)
    .maybeSingle();
  console.log("User Row:", JSON.stringify(userData, null, 2));

  if (userData) {
    // 2. Get Student profile
    const { data: studentData } = await supabase
      .from('students')
      .select('*')
      .eq('user_id', userData.id)
      .maybeSingle();
    console.log("Student Profile:", JSON.stringify(studentData, null, 2));
  }

  // 3. Get Student Register entries by email
  const { data: regByEmail } = await supabase
    .from('student_register')
    .select('*')
    .eq('email', email);
  console.log("Register Entries (by email):", JSON.stringify(regByEmail, null, 2));

  // 4. Get Student Register entries by matriculation number (if found)
  const matric = '2024235020401';
  const { data: regByMatric } = await supabase
    .from('student_register')
    .select('*')
    .eq('matriculation_number', matric);
  console.log(`Register Entries (by matric ${matric}):`, JSON.stringify(regByMatric, null, 2));

  // 5. Check if another user has this matric
  const { data: otherStudent } = await supabase
    .from('students')
    .select('*, users(email)')
    .eq('matriculation_number', matric);
  console.log(`Other Students with matric ${matric}:`, JSON.stringify(otherStudent, null, 2));
}

run();
