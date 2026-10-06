import { supabase } from "@/lib/supabase";
import type { AdminCandidate, LookupStatus } from "../types";

interface RawCandidateAdminRow {
  id: string;
  election_id: string;
  position_id: string;
  student_id: string;
  candidate_status_id: string;
  created_at: string;
  updated_at: string;
  elections?: { id: string; name: string } | null;
  positions?: { id: string; name: string } | null;
  candidate_statuses?: { id: string; name: string } | null;
  candidate_details?: {
    id: string;
    manifesto: string | null;
    campaign_slogan: string | null;
    photo_path: string | null;
    approval_remarks: string | null;
    withdrawal_reason: string | null;
  }[] | {
    id: string;
    manifesto: string | null;
    campaign_slogan: string | null;
    photo_path: string | null;
    approval_remarks: string | null;
    withdrawal_reason: string | null;
  } | null;
  students?: {
    id: string;
    matriculation_number: string;
    department_id: string | null;
    departments?: { name?: string | null } | null;
  } | null;
}

/**
 * Fetches all candidates for an authorized election (or all elections if electionId is omitted or "all")
 * with position, election, and student metadata.
 */
export async function getAdminCandidates(electionId?: string): Promise<AdminCandidate[]> {
  let query = supabase
    .from("candidates")
    .select(`
      id,
      election_id,
      position_id,
      student_id,
      candidate_status_id,
      created_at,
      updated_at,
      elections ( id, name ),
      positions ( id, name ),
      candidate_statuses ( id, name ),
      candidate_details ( id, manifesto, campaign_slogan, photo_path, approval_remarks, withdrawal_reason ),
      students ( id, matriculation_number, department_id, departments ( name ) )
    `);

  if (electionId && electionId !== "all") {
    query = query.eq("election_id", electionId);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load candidates: ${error.message}`);
  }

  const rawRows = (data as unknown as RawCandidateAdminRow[]) || [];

  // Enriched candidates with student names from student_register or students table
  const candidates: AdminCandidate[] = await Promise.all(
    rawRows.map(async (row) => {
      const matric = row.students?.matriculation_number || "";
      let fullName = "Candidate Student";
      let deptName = row.students?.departments?.name || "Student Body";

      if (matric) {
        const { data: regData } = await supabase
          .from("student_register")
          .select("full_name, departments ( name )")
          .eq("matriculation_number", matric)
          .maybeSingle();

        if (regData?.full_name) {
          fullName = regData.full_name;
        }
        const regDept = (regData as unknown as { departments?: { name?: string } | { name?: string }[] })?.departments;
        if (regDept) {
          deptName = Array.isArray(regDept) ? regDept[0]?.name || deptName : regDept.name || deptName;
        }
      }

      const manifestoDetail = Array.isArray(row.candidate_details)
        ? row.candidate_details[0]
        : row.candidate_details;

      return {
        id: row.id,
        election_id: row.election_id,
        election_name: row.elections?.name || "Election",
        position_id: row.position_id,
        position_name: row.positions?.name || "Unassigned Position",
        student_id: row.student_id,
        matriculation_number: matric || "N/A",
        full_name: fullName,
        department: deptName,
        candidate_status_id: row.candidate_status_id,
        status_name: row.candidate_statuses?.name || "Pending",
        manifesto: manifestoDetail?.manifesto || null,
        campaign_slogan: manifestoDetail?.campaign_slogan || null,
        photo_path: manifestoDetail?.photo_path || null,
        approval_remarks: manifestoDetail?.approval_remarks || null,
        withdrawal_reason: manifestoDetail?.withdrawal_reason || null,
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    })
  );

  return candidates;
}

/**
 * Updates a candidate's vetting/approval status (e.g. Approved, Rejected, Withdrawn).
 * Supports optional remarks/reasons which are stored in candidate_details.
 */
export async function updateCandidateStatus(
  candidateId: string,
  newStatusId: string,
  remarks?: string
): Promise<void> {
  // 1. Update candidate status
  const { error: statusError } = await supabase
    .from("candidates")
    .update({
      candidate_status_id: newStatusId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", candidateId);

  if (statusError) {
    throw new Error(`Failed to update candidate status: ${statusError.message}`);
  }

  // 2. Fetch status name to correctly route remarks
  const { data: statusData } = await supabase
    .from("candidate_statuses")
    .select("name")
    .eq("id", newStatusId)
    .single();

  const statusName = statusData?.name?.toLowerCase() || "";
  const updateObj: {
    updated_at: string;
    approval_remarks?: string | null;
    withdrawal_reason?: string | null;
  } = { updated_at: new Date().toISOString() };

  if (statusName === "rejected") {
    updateObj.approval_remarks = remarks || null;
  } else if (statusName === "withdrawn") {
    updateObj.withdrawal_reason = remarks || null;
  } else if (statusName === "approved") {
    updateObj.approval_remarks = remarks || null;
  } else if (statusName.includes("pending")) {
    updateObj.approval_remarks = null;
    updateObj.withdrawal_reason = null;
  }

  // 3. Upsert into candidate_details so remarks are persisted cleanly
  const { error: detailError } = await supabase
    .from("candidate_details")
    .upsert(
      {
        candidate_id: candidateId,
        ...updateObj,
      },
      { onConflict: "candidate_id" }
    );

  if (detailError) {
    console.error("Failed to update candidate remarks:", detailError.message);
  }
}

/**
 * Fetches available candidate statuses.
 */
export async function getCandidateStatuses(): Promise<LookupStatus[]> {
  const { data, error } = await supabase
    .from("candidate_statuses")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    console.warn("Could not query candidate_statuses lookup:", error.message);
    return [];
  }

  return data || [];
}

/**
 * Registers a new candidate for a position in the election.
 */
export async function createAdminCandidate(params: {
  election_id: string;
  position_id: string;
  student_id: string;
  candidate_status_id: string;
  manifesto?: string;
}): Promise<void> {
  const { data: candData, error: candError } = await supabase
    .from("candidates")
    .insert({
      election_id: params.election_id,
      position_id: params.position_id,
      student_id: params.student_id,
      candidate_status_id: params.candidate_status_id,
    })
    .select("id")
    .single();

  if (candError) {
    throw new Error(`Failed to add candidate: ${candError.message}`);
  }

  if (params.manifesto?.trim() && candData?.id) {
    await supabase.from("candidate_details").insert({
      candidate_id: candData.id,
      manifesto: params.manifesto.trim(),
    });
  }
}
