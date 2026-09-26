import { supabase } from "@/lib/supabase";

export interface ElectionOfficerAssignment {
  id: string;
  election_id: string;
  user_id: string;
  user_email: string;
  assigned_at: string;
  assigned_by: string;
}

/**
 * Fetches Electoral Officers assigned to a specific election (B83).
 */
export async function getElectionOfficerAssignments(
  electionId: string
): Promise<ElectionOfficerAssignment[]> {
  const { data, error } = await supabase
    .from("election_officer_assignments")
    .select(`
      id,
      election_id,
      user_id,
      assigned_at,
      assigned_by,
      users!election_officer_assignments_user_id_fkey ( email )
    `)
    .eq("election_id", electionId)
    .order("assigned_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load Electoral Officer assignments: ${error.message}`);
  }

  const raw = data || [];
  return raw.map((row) => {
    const userObj = Array.isArray(row.users) ? row.users[0] : row.users;
    return {
      id: row.id,
      election_id: row.election_id,
      user_id: row.user_id,
      user_email: userObj?.email || "Unknown User",
      assigned_at: row.assigned_at,
      assigned_by: row.assigned_by,
    };
  });
}

/**
 * Assigns an Electoral Officer to an election (B83).
 * Triggers database trigger 'trg_enforce_electoral_officer_role' to ensure user possesses the electoral_officer role.
 */
export async function assignElectoralOfficer(
  electionId: string,
  userId: string
): Promise<ElectionOfficerAssignment> {
  const { data: sessionData } = await supabase.auth.getSession();
  const currentUserId = sessionData.session?.user?.id;

  if (!currentUserId) {
    throw new Error("Authentication required to assign Electoral Officers.");
  }

  const { data, error } = await supabase
    .from("election_officer_assignments")
    .insert({
      election_id: electionId,
      user_id: userId,
      assigned_by: currentUserId,
    })
    .select("id, election_id, user_id, assigned_at, assigned_by")
    .single();

  if (error) {
    throw new Error(`Failed to assign Electoral Officer: ${error.message}`);
  }

  // Query user email
  const { data: userData } = await supabase
    .from("users")
    .select("email")
    .eq("id", userId)
    .single();

  return {
    id: data.id,
    election_id: data.election_id,
    user_id: data.user_id,
    user_email: userData?.email || "Electoral Officer",
    assigned_at: data.assigned_at,
    assigned_by: data.assigned_by,
  };
}

/**
 * Revokes an Electoral Officer's assignment for an election (B83).
 */
export async function removeElectoralOfficer(assignmentId: string): Promise<void> {
  const { error } = await supabase
    .from("election_officer_assignments")
    .delete()
    .eq("id", assignmentId);

  if (error) {
    throw new Error(`Failed to remove Electoral Officer assignment: ${error.message}`);
  }
}
