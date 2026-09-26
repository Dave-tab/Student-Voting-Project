import { supabase } from "@/lib/supabase";
import type { AdminPosition } from "../types";

/**
 * Fetches positions for a specific election.
 * CRITICAL RULE: public.positions does not have a display_order column.
 * Order strictly by created_at, name.
 */
export async function getAdminPositions(electionId: string): Promise<AdminPosition[]> {
  const { data, error } = await supabase
    .from("positions")
    .select("id, name, election_id, created_at, updated_at")
    .eq("election_id", electionId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to load elective positions: ${error.message}`);
  }

  const positions = data || [];

  // Fetch candidate counts for each position
  const withCounts = await Promise.all(
    positions.map(async (pos) => {
      const { count } = await supabase
        .from("candidates")
        .select("id", { count: "exact", head: true })
        .eq("position_id", pos.id);

      return {
        ...pos,
        candidate_count: count ?? 0,
      };
    })
  );

  return withCounts;
}

/**
 * Creates an elective position for the specified election.
 */
export async function createAdminPosition(
  electionId: string,
  name: string
): Promise<AdminPosition> {
  const cleanName = name.trim();
  if (!cleanName) {
    throw new Error("Position title is required.");
  }

  const { data, error } = await supabase
    .from("positions")
    .insert({
      election_id: electionId,
      name: cleanName,
    })
    .select("id, name, election_id, created_at, updated_at")
    .single();

  if (error) {
    throw new Error(`Failed to create position: ${error.message}`);
  }

  return {
    ...data,
    candidate_count: 0,
  };
}

/**
 * Updates a position's title.
 */
export async function updateAdminPosition(
  positionId: string,
  name: string
): Promise<void> {
  const cleanName = name.trim();
  if (!cleanName) {
    throw new Error("Position title is required.");
  }

  const { error } = await supabase
    .from("positions")
    .update({
      name: cleanName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", positionId);

  if (error) {
    throw new Error(`Failed to update position: ${error.message}`);
  }
}

/**
 * Deletes an elective position.
 */
export async function deleteAdminPosition(positionId: string): Promise<void> {
  const { error } = await supabase
    .from("positions")
    .delete()
    .eq("id", positionId);

  if (error) {
    throw new Error(`Failed to delete position: ${error.message}`);
  }
}
