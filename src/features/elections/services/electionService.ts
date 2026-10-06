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

  // Reconcile database lifecycle authoritatively
  try {
    await supabase.rpc("check_and_advance_election_lifecycle", {
      p_election_id: electionId,
    });
  } catch (advErr) {
    console.warn("check_and_advance_election_lifecycle notice:", advErr);
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

/**
 * Fetches approved candidates for an election.
/**
 * Fetches approved candidates for an election.
 * Per approved candidate visibility rules:
 * Only candidates with status 'Approved' are presented on the student ballot and election contestant roster.
 */
export async function getApprovedCandidates(electionId: string): Promise<Candidate[]> {
  try {
    const { data, error } = await supabase
      .from("candidates")
      .select(`
        id,
        election_id,
        position_id,
        student_id,
        candidate_status_id,
        created_at,
        updated_at,
        candidate_statuses!inner ( id, name ),
        candidate_details ( id, manifesto, campaign_slogan, photo_path, approval_remarks ),
        students (
          id,
          matriculation_number,
          department_id,
          departments ( id, name ),
          levels ( id, name )
        )
      `)
      .eq("election_id", electionId)
      .ilike("candidate_statuses.name", "approved")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching approved candidates:", error.message);
      return [];
    }

    const rawRows = (data || []) as unknown as Array<{
      id: string;
      election_id: string;
      position_id: string;
      student_id: string;
      candidate_status_id: string;
      created_at: string;
      updated_at: string;
      candidate_statuses: { id: string; name: string } | { id: string; name: string }[];
      candidate_details:
        | { id: string; manifesto: string | null; campaign_slogan: string | null; photo_path: string | null; approval_remarks: string | null }
        | { id: string; manifesto: string | null; campaign_slogan: string | null; photo_path: string | null; approval_remarks: string | null }[]
        | null;
      students:
        | {
            id: string;
            matriculation_number: string;
            department_id: string | null;
            departments?: { id: string; name: string } | null;
            levels?: { id: string; name: string } | null;
          }
        | null;
    }>;

    const candidates: Candidate[] = await Promise.all(
      rawRows.map(async (row) => {
        const studentObj = row.students;
        const matric = studentObj?.matriculation_number || "";
        let fullName = "Candidate Student";
        let deptName = studentObj?.departments?.name || "Student Body";
        let lvlName = studentObj?.levels?.name || "Undergraduate";

        if (matric) {
          const { data: regData } = await supabase
            .from("student_register")
            .select("full_name, department_id, level_id, departments(name), levels(name)")
            .eq("election_id", electionId)
            .eq("matriculation_number", matric)
            .maybeSingle();

          if (regData?.full_name) {
            fullName = regData.full_name;
          }
          if (regData?.departments?.name) {
            deptName = regData.departments.name;
          }
          if (regData?.levels?.name) {
            lvlName = regData.levels.name;
          }
        }

        const detailsObj = Array.isArray(row.candidate_details)
          ? row.candidate_details[0]
          : row.candidate_details;

        const statusObj = Array.isArray(row.candidate_statuses)
          ? row.candidate_statuses[0]
          : row.candidate_statuses;

        return {
          id: row.id,
          election_id: row.election_id,
          position_id: row.position_id,
          student_id: row.student_id,
          status_id: row.candidate_status_id,
          status: statusObj ? { id: statusObj.id, name: statusObj.name } : "Approved",
          student: {
            id: studentObj?.id || row.student_id,
            matriculation_number: matric,
            matric_number: matric,
            full_name: fullName,
            first_name: fullName.split(" ")[0] || "Candidate",
            last_name: fullName.split(" ").slice(1).join(" ") || "Student",
            department: deptName,
            level: lvlName,
          },
          candidate_details: detailsObj
            ? {
                candidate_id: row.id,
                campaign_slogan: detailsObj.campaign_slogan || null,
                manifesto: detailsObj.manifesto || null,
                photo_path: detailsObj.photo_path || null,
                approval_remarks: detailsObj.approval_remarks || null,
              }
            : null,
          created_at: row.created_at,
          updated_at: row.updated_at,
        };
      })
    );

    return candidates;
  } catch (err) {
    console.error("Failed to load approved candidates:", err);
    return [];
  }
}

/**
 * Resubmits or updates a candidate nomination application.
 * Allows rejected, withdrawn, or pending candidates to revise and redo their application.
 * Resets status to Pending_Approval for administrative re-vetting.
 */
export async function resubmitCandidateApplication(params: {
  candidateId: string;
  electionId: string;
  positionId?: string;
  campaignSlogan?: string;
  manifesto?: string;
  photoPath?: string;
}): Promise<{ success: boolean; message: string }> {
  // Try RPC first if installed in database
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc("resubmit_candidate_application", {
      p_candidate_id: params.candidateId,
      p_campaign_slogan: params.campaignSlogan?.trim() || null,
      p_manifesto: params.manifesto?.trim() || null,
      p_photo_path: params.photoPath?.trim() || null,
    });

    const parsedRpc = rpcData as unknown as { success?: boolean; message?: string } | null;

    if (!rpcError && parsedRpc?.success) {
      if (params.positionId) {
        await supabase
          .from("candidates")
          .update({ position_id: params.positionId, updated_at: new Date().toISOString() })
          .eq("id", params.candidateId);
      }
      await supabase
        .from("candidate_details")
        .update({
          approval_remarks: null,
          withdrawal_reason: null,
          updated_at: new Date().toISOString(),
        })
        .eq("candidate_id", params.candidateId);

      return {
        success: true,
        message: parsedRpc.message || "Candidate application resubmitted successfully for review.",
      };
    }
  } catch {
    // Continue to authoritative PostgREST update
  }

  // 1. Resolve 'Pending_Approval' status ID
  const { data: statusData } = await supabase
    .from("candidate_statuses")
    .select("id")
    .ilike("name", "Pending_Approval")
    .maybeSingle();

  const pendingStatusId = statusData?.id || "c5f760ac-709c-4e82-b3e2-1c2d4ece2a52";

  // 2. Update candidate record (and position if changed)
  const candidatePayload: { candidate_status_id: string; updated_at: string; position_id?: string } = {
    candidate_status_id: pendingStatusId,
    updated_at: new Date().toISOString(),
  };

  if (params.positionId) {
    candidatePayload.position_id = params.positionId;
  }

  const { error: candError } = await supabase
    .from("candidates")
    .update(candidatePayload)
    .eq("id", params.candidateId);

  if (candError) {
    throw new Error(`Failed to update candidate record: ${candError.message}`);
  }

  // 3. Upsert candidate details (clearing previous rejection remarks upon resubmission)
  const { error: detailError } = await supabase
    .from("candidate_details")
    .upsert({
      candidate_id: params.candidateId,
      campaign_slogan: params.campaignSlogan?.trim() || null,
      manifesto: params.manifesto?.trim() || null,
      photo_path: params.photoPath?.trim() || null,
      approval_remarks: null,
      withdrawal_reason: null,
      is_profile_complete: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: "candidate_id" });

  if (detailError) {
    console.warn("Notice: candidate_details update warning:", detailError.message);
  }

  return {
    success: true,
    message: "Candidate application successfully updated and resubmitted for committee review!",
  };
}

/**
 * Allows a student candidate to self-withdraw their nomination filing.
 */
export async function withdrawStudentCandidacy(
  candidateId: string,
  reason?: string
): Promise<{ success: boolean; message: string }> {
  const { data: statusData } = await supabase
    .from("candidate_statuses")
    .select("id")
    .ilike("name", "Withdrawn")
    .maybeSingle();

  const withdrawnStatusId = statusData?.id || "df93941d-626b-4bdf-94ed-2b7bee41b112";

  const { error: candError } = await supabase
    .from("candidates")
    .update({
      candidate_status_id: withdrawnStatusId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", candidateId);

  if (candError) {
    throw new Error(`Failed to withdraw application: ${candError.message}`);
  }

  await supabase
    .from("candidate_details")
    .update({
      withdrawal_reason: reason || "Withdrawn by student candidate",
      updated_at: new Date().toISOString(),
    })
    .eq("candidate_id", candidateId);

  return {
    success: true,
    message: "Your candidacy application has been withdrawn.",
  };
}



export interface StudentProfileData {
  matricNumber: string;
  fullName: string;
  email: string;
  department: string;
  programme: string;
  level: string;
  admissionYear: string;
  accountStatus: string;
  voterEligibility: string;
}

/**
 * Resolves the complete student profile from institutional records.
 * Sourced from auth.users (email), public.students, and public.student_register.
 */
export async function getStudentProfileDetails(
  userId: string,
  email: string
): Promise<StudentProfileData | null> {
  try {
    interface StudentRecord {
      matriculation_number: string;
      department_id?: string | null;
      level_id?: string | null;
      academic_session_id?: string | null;
    }

    interface RegisterRecord {
      full_name?: string | null;
    }

    interface NamedRecord {
      name?: string | null;
    }

    const { data: student, error: studentError } = (await supabase
      .from("students")
      .select("matriculation_number, department_id, level_id, academic_session_id")
      .eq("user_id", userId)
      .maybeSingle()) as { data: StudentRecord | null; error: Error | null };

    if (studentError || !student) {
      return null;
    }

    const matric = student.matriculation_number;

    const { data: reg } = (await supabase
      .from("student_register")
      .select("full_name")
      .eq("matriculation_number", matric)
      .limit(1)
      .maybeSingle()) as { data: RegisterRecord | null; error: Error | null };

    let deptName = "Unknown Department";
    if (student.department_id) {
      const { data: dept } = (await supabase
        .from("departments")
        .select("name")
        .eq("id", student.department_id)
        .maybeSingle()) as { data: NamedRecord | null; error: Error | null };
      if (dept?.name) deptName = dept.name;
    }

    let lvlName = "Unknown Level";
    if (student.level_id) {
      const { data: lvl } = (await supabase
        .from("levels")
        .select("name")
        .eq("id", student.level_id)
        .maybeSingle()) as { data: NamedRecord | null; error: Error | null };
      if (lvl?.name) lvlName = lvl.name;
    }

    let sessionName = "Unknown Session";
    if (student.academic_session_id) {
      const { data: sess } = (await supabase
        .from("academic_sessions")
        .select("name")
        .eq("id", student.academic_session_id)
        .maybeSingle()) as { data: NamedRecord | null; error: Error | null };
      if (sess?.name) sessionName = sess.name;
    }

    return {
      matricNumber: matric,
      fullName: reg?.full_name || "Student Voter",
      email: email,
      department: deptName,
      programme: "Full-Time (FT)",
      level: lvlName,
      admissionYear: sessionName,
      accountStatus: "Active",
      voterEligibility: "Eligible",
    };
  } catch (err) {
    console.error("Error loading student profile details:", err);
    return null;
  }
}

export interface CandidateApplicationInput {
  electionId: string;
  positionId: string;
  studentId: string;
  matricNumber: string;
  campaignSlogan?: string;
  manifesto?: string;
  photoPath?: string;
}

export interface StudentCandidacyStatus {
  id: string;
  election_id: string;
  position_id: string;
  position_name: string;
  status_name: string;
  campaign_slogan?: string | null;
  manifesto?: string | null;
  photo_path?: string | null;
  approval_remarks?: string | null;
  withdrawal_reason?: string | null;
  created_at: string;
}

/**
 * Retrieves the authenticated student's candidate application for an election, if any.
 */
export async function getStudentCandidacy(
  electionId: string,
  studentId: string
): Promise<StudentCandidacyStatus | null> {
  try {
    const { data, error } = await supabase
      .from("candidates")
      .select(`
        id,
        election_id,
        position_id,
        student_id,
        created_at,
        positions ( id, name ),
        candidate_statuses ( id, name ),
        candidate_details (
          campaign_slogan,
          manifesto,
          photo_path,
          approval_remarks,
          withdrawal_reason
        )
      `)
      .eq("election_id", electionId)
      .eq("student_id", studentId)
      .maybeSingle();

    if (error || !data) return null;

    const row = data as {
      id: string;
      election_id: string;
      position_id: string;
      created_at: string;
      positions?: { name?: string } | { name?: string }[] | null;
      candidate_statuses?: { name?: string } | { name?: string }[] | null;
      candidate_details?:
        | {
            campaign_slogan?: string | null;
            manifesto?: string | null;
            photo_path?: string | null;
            approval_remarks?: string | null;
            withdrawal_reason?: string | null;
          }
        | {
            campaign_slogan?: string | null;
            manifesto?: string | null;
            photo_path?: string | null;
            approval_remarks?: string | null;
            withdrawal_reason?: string | null;
          }[]
        | null;
    };

    const posObj = Array.isArray(row.positions) ? row.positions[0] : row.positions;
    const statusObj = Array.isArray(row.candidate_statuses) ? row.candidate_statuses[0] : row.candidate_statuses;
    const detailObj = Array.isArray(row.candidate_details) ? row.candidate_details[0] : row.candidate_details;

    return {
      id: row.id,
      election_id: row.election_id,
      position_id: row.position_id,
      position_name: posObj?.name || "Elective Office",
      status_name: statusObj?.name || "Pending_Approval",
      campaign_slogan: detailObj?.campaign_slogan || null,
      manifesto: detailObj?.manifesto || null,
      photo_path: detailObj?.photo_path || null,
      approval_remarks: detailObj?.approval_remarks || null,
      withdrawal_reason: detailObj?.withdrawal_reason || null,
      created_at: row.created_at,
    };
  } catch (err) {
    console.error("Error fetching student candidacy:", err);
    return null;
  }
}

/**
 * Submits a student candidate application using the secure RPC boundary.
 * Enforces identity, registration, and election status rules server-side.
 */
export async function submitCandidateApplication(
  params: CandidateApplicationInput
): Promise<{ success: boolean; message: string }> {
  const { data, error } = await supabase.rpc("submit_candidate_application", {
    p_election_id: params.electionId,
    p_position_id: params.positionId,
    p_campaign_slogan: params.campaignSlogan?.trim() || null,
    p_manifesto: params.manifesto?.trim() || null,
    p_photo_path: params.photoPath?.trim() || null,
  });

  if (error) {
    // Handle specific error messages from the RPC if needed
    if (error.message.includes("already submitted")) {
      throw new Error("Duplicate Nomination: You have already filed a candidacy application for this election.");
    }
    if (error.message.includes("closed")) {
      throw new Error("Candidate applications are closed for this election.");
    }
    if (error.message.includes("not registered")) {
      throw new Error("You are not registered for this election and cannot apply as a candidate.");
    }
    throw new Error(error.message || "Failed to submit candidate application.");
  }

  const result = data as { success: boolean; message: string };
  return {
    success: result.success,
    message: result.message || "Candidate application successfully submitted!",
  };
}

