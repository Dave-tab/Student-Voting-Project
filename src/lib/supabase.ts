import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://tmjpjrtxajrqxodmrbqq.supabase.co";
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_afAj-FNCMcNu8JeD9qXurQ_S_QCFw_C";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type { Database };

