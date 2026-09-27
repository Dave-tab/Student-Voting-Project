import { supabase } from "@/lib/supabase";
import type { Database, Json } from "@/types/database.types";
import type { AdminElection, LookupStatus } from "../types";

type ElectionUpdate = Database["public"]["Tables"]["elections"]["Update"];

export interface LookupAcademicSession {
  id: string;
  name: string;
}

export interface CreateElectionInput {
  name: string;
  description?: string;
  start_datetime: string;
  end_datetime: string;
  election_status_id: string;
  academic_session_id: string;
}

export interface UpdateElectionInput {
  name?: string;
  description?: string;
  start_datetime?: string;
  end_datetime?: string;
  election_status_id?: string;
}

/**
 * Fetches all elections for administrative management.
 * Joins status, positions count, and candidates count.
 */
export async function getAdminElections(): Promise<AdminElection[]> {
  const { data, error } = await supabase
    .from("elections")
    .select(`
      id,
      name,
      description,
      start_datetime,
      end_datetime,
      election_status_id,
      academic_session_id,
      created_at,
      updated_at,
      election_statuses ( id, name )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load administrative elections: ${error.message}`);
  }

  const elections = data || [];

  // Concurrently fetch counts for each election
  const enriched = await Promise.all(
    elections.map(async (row) => {
      // 1. Position count
      const { count: posCount } = await supabase
        .from("positions")
        .select("id", { count: "exact", head: true })
        .eq("election_id", row.id);

      // 2. Candidate count
      const { count: candCount } = await supabase
        .from("candidates")
        .select("id", { count: "exact", head: true })
        .eq("election_id", row.id);

      // 3. Voter register count
      const { count: voterCount } = await supabase
        .from("student_register")
        .select("id", { count: "exact", head: true })
        .eq("election_id", row.id);

      const statusObj = Array.isArray(row.election_statuses)
        ? row.election_statuses[0]
        : row.election_statuses;

      return {
        id: row.id,
        name: row.name,
        title: row.name,
        description: row.description,
        start_datetime: row.start_datetime,
        end_datetime: row.end_datetime,
        election_status_id: row.election_status_id,
        academic_session_id: row.academic_session_id,
        status_name: statusObj?.name || "Draft",
        created_at: row.created_at,
        updated_at: row.updated_at,
        position_count: posCount ?? 0,
        candidate_count: candCount ?? 0,
        voter_count: voterCount ?? 0,
      };
    })
  );

  return enriched;
}

/**
 * Fetches a single election by ID for administrative operations.
 */
export async function getAdminElectionById(electionId: string): Promise<AdminElection | null> {
  const { data, error } = await supabase
    .from("elections")
    .select(`
      id,
      name,
      description,
      start_datetime,
      end_datetime,
      election_status_id,
      academic_session_id,
      created_at,
      updated_at,
      election_statuses ( id, name )
    `)
    .eq("id", electionId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load election details: ${error.message}`);
  }

  if (!data) return null;

  // Counts
  const { count: posCount } = await supabase
    .from("positions")
    .select("id", { count: "exact", head: true })
    .eq("election_id", electionId);

  const { count: candCount } = await supabase
    .from("candidates")
    .select("id", { count: "exact", head: true })
    .eq("election_id", electionId);

  const { count: voterCount } = await supabase
    .from("student_register")
    .select("id", { count: "exact", head: true })
    .eq("election_id", electionId);

  const statusObj = Array.isArray(data.election_statuses)
    ? data.election_statuses[0]
    : data.election_statuses;

  return {
    id: data.id,
    name: data.name,
    title: data.name,
    description: data.description,
    start_datetime: data.start_datetime,
    end_datetime: data.end_datetime,
    election_status_id: data.election_status_id,
    academic_session_id: data.academic_session_id,
    status_name: statusObj?.name || "Draft",
    created_at: data.created_at,
    updated_at: data.updated_at,
    position_count: posCount ?? 0,
    candidate_count: candCount ?? 0,
    voter_count: voterCount ?? 0,
  };
}

/**
 * Creates a new election with authorized database columns.
 */
export async function createAdminElection(input: CreateElectionInput): Promise<{ id: string }> {
  if (!input.academic_session_id || !input.academic_session_id.trim()) {
    throw new Error("Academic session is required to create an election.");
  }

  const { data, error } = await supabase
    .from("elections")
    .insert({
      name: input.name.trim(),
      description: input.description?.trim() || null,
      start_datetime: input.start_datetime,
      end_datetime: input.end_datetime,
      election_status_id: input.election_status_id,
      academic_session_id: input.academic_session_id.trim(),
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to create election: ${error.message}`);
  }

  return { id: data.id };
}

/**
 * Updates election metadata.
 */
export async function updateAdminElection(
  electionId: string,
  input: UpdateElectionInput
): Promise<void> {
  const updatePayload: ElectionUpdate = {
    updated_at: new Date().toISOString(),
  };

  if (input.name !== undefined) updatePayload.name = input.name.trim();
  if (input.description !== undefined) updatePayload.description = input.description.trim() || null;
  if (input.start_datetime !== undefined) updatePayload.start_datetime = input.start_datetime;
  if (input.end_datetime !== undefined) updatePayload.end_datetime = input.end_datetime;
  if (input.election_status_id !== undefined) updatePayload.election_status_id = input.election_status_id;

  const { error } = await supabase
    .from("elections")
    .update(updatePayload)
    .eq("id", electionId);

  if (error) {
    throw new Error(`Failed to update election: ${error.message}`);
  }
}

/**
 * Fetches available election statuses for selection in creation/editing workflows.
 */
export async function getElectionStatuses(): Promise<LookupStatus[]> {
  const { data, error } = await supabase
    .from("election_statuses")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    console.warn("Could not query election_statuses lookup:", error.message);
    return [];
  }

  return data || [];
}

/**
 * Fetches available academic sessions from public.academic_sessions.
 */
export async function getAcademicSessions(): Promise<LookupAcademicSession[]> {
  const { data, error } = await supabase
    .from("academic_sessions")
    .select("id, name")
    .order("name", { ascending: false });

  if (error) {
    console.warn("Could not query academic_sessions lookup:", error.message);
    throw new Error(`Failed to load academic sessions: ${error.message}`);
  }

  return data || [];
}

export interface ParticipationRecord {
  id: string;
  election_id: string;
  participated_at: string;
}

/**
 * Fetches authoritative voter participation records without exposing student identity.
 */
export async function getVoterParticipation(): Promise<ParticipationRecord[]> {
  const { data, error } = await supabase
    .from("voter_participation")
    .select("id, election_id, participated_at")
    .order("participated_at", { ascending: true });

  if (error) {
    console.warn("Could not query voter_participation:", error.message);
    return [];
  }

  return data || [];
}

export interface AdminResultPreview {
  id: string;
  election_id: string;
  election_name: string;
  position_id: string;
  position_title: string;
  lifecycle_status: string;
  outcome_status: string;
  calculated_at: string | null;
  reviewed_at: string | null;
  published_at: string | null;
}

/**
 * Fetches election results across lifecycle states (calculated, reviewed, published).
 */
export async function getElectionResultsOverview(): Promise<AdminResultPreview[]> {
  const { data, error } = await supabase
    .from("election_results")
    .select(`
      id,
      election_id,
      position_id,
      lifecycle_status,
      outcome_status,
      calculated_at,
      reviewed_at,
      published_at,
      elections ( name ),
      positions ( title )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Could not query election_results overview:", error.message);
    return [];
  }

  type ResultJoinRow = {
    id: string;
    election_id: string;
    position_id: string;
    lifecycle_status: string;
    outcome_status: string;
    calculated_at: string | null;
    reviewed_at: string | null;
    published_at: string | null;
    elections?: { name: string } | { name: string }[] | null;
    positions?: { title: string } | { title: string }[] | null;
  };

  const rows = (data || []) as unknown as ResultJoinRow[];
  return rows.map((r) => {
    const elName = Array.isArray(r.elections)
      ? r.elections[0]?.name
      : r.elections?.name || "Election";
    const posTitle = Array.isArray(r.positions)
      ? r.positions[0]?.title
      : r.positions?.title || "Position";

    return {
      id: r.id,
      election_id: r.election_id,
      election_name: elName,
      position_id: r.position_id,
      position_title: posTitle,
      lifecycle_status: r.lifecycle_status,
      outcome_status: r.outcome_status,
      calculated_at: r.calculated_at,
      reviewed_at: r.reviewed_at,
      published_at: r.published_at,
    };
  });
}

export interface AdminRecentActivity {
  id: string;
  description: string;
  entity_type: string;
  created_at: string;
}

/**
 * Fetches recent activity from audit logs.
 */
export async function getRecentActivity(): Promise<AdminRecentActivity[]> {
  const { data, error } = await supabase
    .from("audit_logs")
    .select("id, description, entity_type, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.warn("Could not query audit_logs for recent activity:", error.message);
    return [];
  }

  return (data || []) as AdminRecentActivity[];
}

/**
 * Deletes an election if it is in Draft status.
 * Per Security Rules: Deletion is restricted to Draft elections only.
 */
export async function deleteAdminElection(electionId: string): Promise<void> {
  // First, verify that the election is in Draft status
  const { data: election, error: lookupError } = await supabase
    .from("elections")
    .select("election_status_id, election_statuses(name)")
    .eq("id", electionId)
    .maybeSingle();

  if (lookupError || !election) {
    throw new Error("Election not found.");
  }

  const statusObj = Array.isArray(election.election_statuses)
    ? election.election_statuses[0]
    : election.election_statuses;
  const statusName = statusObj?.name || "Draft";

  if (statusName.toLowerCase() !== "draft") {
    throw new Error("Prohibited: Only elections in 'Draft' status can be deleted.");
  }

  // Clean up configurations linked specifically to this draft election
  // 1. Clean up student_register via the import_student_register security definer RPC
  const { error: registerRpcError } = await supabase.rpc("import_student_register", {
    p_election_id: electionId,
    p_students: [] as unknown as Json,
  });

  if (registerRpcError) {
    throw new Error(`Failed to clear voter register: ${registerRpcError.message}`);
  }

  // 2. Clean up election officer assignments linked specifically to this draft election
  await supabase.from("election_officer_assignments").delete().eq("election_id", electionId);

  // 3. Clean up candidates and positions
  await supabase.from("candidates").delete().eq("election_id", electionId);
  await supabase.from("positions").delete().eq("election_id", electionId);

  // Delete the election itself
  const { error: deleteError } = await supabase
    .from("elections")
    .delete()
    .eq("id", electionId);

  if (deleteError) {
    throw new Error(`Failed to delete election: ${deleteError.message}`);
  }
}

