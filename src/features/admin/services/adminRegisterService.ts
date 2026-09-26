import { supabase } from "@/lib/supabase";
import type { Json } from "@/types/database.types";
import type { AdminVoterRegisterEntry } from "../types";

export interface CSVVoterInput {
  matriculation_number: string;
  email: string;
  full_name: string;
  department: string;
  level: string;
  year_of_admission: number;
}

/**
 * Fetches the election-specific voter roll (student_register).
 * Strictly filtered by election_id.
 */
export async function getAdminVoterRegister(
  electionId: string,
  searchQuery?: string
): Promise<AdminVoterRegisterEntry[]> {
  let query = supabase
    .from("student_register")
    .select("id, election_id, matriculation_number, email, full_name, year_of_admission, created_at")
    .eq("election_id", electionId)
    .order("created_at", { ascending: false });

  if (searchQuery && searchQuery.trim()) {
    const q = `%${searchQuery.trim()}%`;
    query = query.or(`matriculation_number.ilike.${q},full_name.ilike.${q},email.ilike.${q}`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load voter register: ${error.message}`);
  }

  return data || [];
}

/**
 * Adds an individual eligible student to the election-specific register.
 */
export async function addVoterToRegister(entry: {
  election_id: string;
  matriculation_number: string;
  email?: string;
  full_name?: string;
  department_id?: string;
  level_id?: string;
  year_of_admission?: number;
}): Promise<AdminVoterRegisterEntry> {
  const cleanMatric = entry.matriculation_number.trim().toUpperCase();
  if (!cleanMatric) {
    throw new Error("Matriculation number is required.");
  }

  const { data, error } = await supabase
    .from("student_register")
    .insert({
      election_id: entry.election_id,
      matriculation_number: cleanMatric,
      email: entry.email?.trim().toLowerCase() || "",
      full_name: entry.full_name?.trim() || "",
      department_id: entry.department_id || "00000000-0000-0000-0000-000000000000",
      level_id: entry.level_id || "00000000-0000-0000-0000-000000000000",
      year_of_admission: entry.year_of_admission || new Date().getFullYear(),
    })
    .select("id, election_id, matriculation_number, email, full_name, created_at")
    .single();

  if (error) {
    throw new Error(`Failed to add student to voter register: ${error.message}`);
  }

  return data;
}

/**
 * Bulk imports an election-specific voter register from CSV via the authoritative RPC boundary.
 * Enforces Draft/Scheduled election status check server-side.
 */
export async function bulkImportVoterRegister(
  electionId: string,
  voters: CSVVoterInput[]
): Promise<{ success: boolean; count: number; message: string }> {
  if (!voters || voters.length === 0) {
    throw new Error("No voter records provided for import.");
  }

  const { data, error } = await supabase.rpc("import_student_register", {
    p_election_id: electionId,
    p_students: voters as unknown as Json,
  });

  if (error) {
    throw new Error(`Register import failed: ${error.message}`);
  }

  return data as unknown as { success: boolean; count: number; message: string };
}

/**
 * Removes a student entry from the election-specific register.
 */
export async function removeVoterFromRegister(registerId: string): Promise<void> {
  const { error } = await supabase
    .from("student_register")
    .delete()
    .eq("id", registerId);

  if (error) {
    throw new Error(`Failed to remove student from voter register: ${error.message}`);
  }
}
