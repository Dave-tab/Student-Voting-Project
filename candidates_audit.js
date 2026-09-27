import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://tmjpjrtxajrqxodmrbqq.supabase.co';
const legacyServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtanBqcnR4YWpycXhvZG1yYnFxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDg5NzgxNCwiZXhwIjoyMTAwNDczODE0fQ.eH3ZCrp3a7nPRhtj10VN96IffbaQ7pWVEsAhvovKMmk";

const supabase = createClient(supabaseUrl, legacyServiceRoleKey);

async function run() {
  console.log("=== CANDIDATES AUDIT ===");
  const { data: candidates, error: cErr } = await supabase.from('candidates').select('*, candidate_statuses(name), students(matriculation_number)');
  if (cErr) console.error("Candidates Error:", cErr);
  console.log("Candidates:", JSON.stringify(candidates, null, 2));

  console.log("\n=== CANDIDATE DETAILS AUDIT ===");
  const { data: details, error: dErr } = await supabase.from('candidate_details').select('*');
  if (dErr) console.error("Details Error:", dErr);
  console.log("Candidate Details:", JSON.stringify(details, null, 2));

  console.log("\n=== CANDIDATE STATUSES AUDIT ===");
  const { data: statuses, error: sErr } = await supabase.from('candidate_statuses').select('*');
  if (sErr) console.error("Statuses Error:", sErr);
  console.log("Statuses:", JSON.stringify(statuses, null, 2));
}

run();
