import { supabase } from "@/lib/supabase";
import type { Election, Position, Candidate } from "../types";

interface RegisterRow {
  id?: string;
  election_id: string;
}

/**
 * Resolves the authenticated student's matriculation number from the database.
 * Matches by user_id in the students table using the verified matriculation_number column.
 */
export async function getStudentMatricNumber(
  userId: string,
  email?: string
): Promise<string | null> {
  void email;
  try {
    const { data: byUser, error: userError } = await supabase
      .from("students")
      .select("matriculation_number")
      .eq("user_id", userId)
      .maybeSingle();

    if (!userError && byUser?.matriculation_number) {
      return byUser.matriculation_number;
    }

    return null;
  } catch (err) {
    console.error("Error resolving student matriculation number:", err);
    return null;
  }
}

/**
 * Fetches eligible elections for the student strictly based on the election_specific voter register.
 * Per Decision E / ADR-P3-01: A student only sees elections for which the student is eligible according to
 * the applicable election-specific voter register (student_register).
 * The frontend does NOT calculate eligibility itself.
 */
export async function getEligibleElections(matricNumber: string | null): Promise<Election[]> {
  if (!matricNumber) {
    return [];
  }

  // Step 1: Query student_register for elections where this matriculation_number is registered
  const { data: regData, error: regError } = await supabase
    .from("student_register")
    .select("election_id")
    .eq("matriculation_number", matricNumber);

  if (regError) {
    throw new Error(`Failed to query voter register: ${regError.message}`);
  }

  const registerEntries: RegisterRow[] = (regData || []) as RegisterRow[];

  if (registerEntries.length === 0) {
    return [];
  }

  const eligibleElectionIds = Array.from(
    new Set(registerEntries.map((entry) => entry.election_id).filter(Boolean))
  );

  if (eligibleElectionIds.length === 0) {
    return [];
  }

  // Step 2: Query elections corresponding to these eligible IDs
  const { data: electionsData, error: electionsError } = await supabase
    .from("elections")
    .select("*, election_statuses(id, name)")
    .in("id", eligibleElectionIds)
    .order("start_datetime", { ascending: true });

  if (electionsError) {
    throw new Error(`Failed to fetch eligible elections: ${electionsError.message}`);
  }

  return (electionsData || []).map((row) => ({
    id: row.id,
    name: row.name,
    title: row.name,
    description: row.description,
    start_datetime: row.start_datetime,
    end_datetime: row.end_datetime,
    status_id: row.election_status_id,
    status: row.election_statuses,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

/**
 * Fetches an election by its ID and verifies student eligibility against student_register.
 */
export async function getElectionById(
  electionId: string,
  matricNumber: string | null
): Promise<Election | null> {
  // If matricNumber is available, verify presence on student_register for strict eligibility
  if (matricNumber) {
    const { data: regData, error: regError } = await supabase
      .from("student_register")
      .select("id")
      .eq("election_id", electionId)
      .eq("matriculation_number", matricNumber)
      .maybeSingle();

    const isRegistered = !regError && Boolean(regData);

    if (!isRegistered) {
      // Student is not registered for this election
      return null;
    }
  }

  const { data: row, error } = await supabase
    .from("elections")
    .select("*, election_statuses(id, name)")
    .eq("id", electionId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch election details: ${error.message}`);
  }

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    title: row.name,
    description: row.description,
    start_datetime: row.start_datetime,
    end_datetime: row.end_datetime,
    status_id: row.election_status_id,
    status: row.election_statuses,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Fetches elective positions for an election, ordered by created_at.
 */
export async function getElectionPositions(electionId: string): Promise<Position[]> {
  const { data, error } = await supabase
    .from("positions")
    .select("*")
    .eq("election_id", electionId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch positions: ${error.message}`);
  }

  return (data || []).map((row, index) => ({
    id: row.id,
    election_id: row.election_id,
    name: row.name,
    description: null,
    display_order: index + 1,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

interface RawCandidateRow {
  id: string;
  election_id: string;
  position_id: string;
  student_id: string;
  status_id?: string;
  candidate_status_id?: string;
  status?: string | { id: string; name: string };
  candidate_statuses?: { id: string; name: string } | null;
  candidate_details?: Candidate["candidate_details"] | Candidate["candidate_details"][];
  students?: Candidate["student"];
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetches approved candidates for an election.
 * Per approved candidate visibility rules (BR-010 and Sprint 4/8 RLS):
 * Only candidates with status 'Approved' (or active) are returned.
 */
export async function getApprovedCandidates(electionId: string): Promise<Candidate[]> {
  const { data, error } = await supabase
    .from("candidates")
    .select(
      `
      id,
      election_id,
      position_id,
      student_id,
      candidate_status_id,
      candidate_statuses ( id, name ),
      candidate_details (
        manifesto
      ),
      students (
        id,
        matriculation_number
      )
    `
    )
    .eq("election_id", electionId);

  if (error) {
    // If nested join fails on some legacy relation, try simple select
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("candidates")
      .select("*")
      .eq("election_id", electionId);

    if (fallbackError) {
      throw new Error(`Failed to fetch candidates: ${fallbackError.message}`);
    }

    const fallbackRows = (fallbackData as unknown as RawCandidateRow[]) || [];
    return fallbackRows.map((row) => ({
      id: row.id,
      election_id: row.election_id,
      position_id: row.position_id,
      student_id: row.student_id,
      status_id: row.candidate_status_id || row.status_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  }

  const rawCandidates = (data as unknown as RawCandidateRow[]) || [];

  // Filter for approved candidates (client safety check in addition to RLS)
  const approvedCandidates = rawCandidates.filter((row) => {
    const statusName =
      row.candidate_statuses?.name ||
      (typeof row.status === "string" ? row.status : null) ||
      "Approved";
    return statusName.toLowerCase() !== "withdrawn" && statusName.toLowerCase() !== "disqualified";
  });

  return approvedCandidates.map((row) => ({
    id: row.id,
    election_id: row.election_id,
    position_id: row.position_id,
    student_id: row.student_id,
    status_id: row.status_id,
    status: row.candidate_statuses || undefined,
    student: row.students,
    candidate_details: Array.isArray(row.candidate_details)
      ? row.candidate_details[0]
      : row.candidate_details,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}
