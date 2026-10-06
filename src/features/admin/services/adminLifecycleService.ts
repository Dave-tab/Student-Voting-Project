import { supabase } from "@/lib/supabase";
import type { LookupStatus } from "../types";
import type { ElectionResultsData } from "@/features/results/types";

export interface ReadinessCheckResult {
  ready: boolean;
  issues: string[];
  positionCount: number;
  candidateCount: number;
  approvedCandidateCount: number;
  voterCount: number;
}

/**
 * Fetches available election lifecycle statuses from the database.
 */
export async function getLifecycleStatuses(): Promise<LookupStatus[]> {
  const { data, error } = await supabase
    .from("election_statuses")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    console.warn("Could not query election_statuses:", error.message);
    return [];
  }

  const approvedOrder = [
    "Draft",
    "Scheduled",
    "Open",
    "Results Pending",
    "Results Available",
  ];

  return (data || [])
    .filter((s) => approvedOrder.includes(s.name))
    .sort((a, b) => approvedOrder.indexOf(a.name) - approvedOrder.indexOf(b.name));
}

/**
 * Evaluates election readiness prior to scheduling (OD-10.2 & B82).
 * Verifies metadata, date ordering, position count, Approved candidate count, and voter register size.
 */
export async function checkElectionReadiness(electionId: string): Promise<ReadinessCheckResult> {
  const issues: string[] = [];

  // 1. Query election metadata
  const { data: election, error: electError } = await supabase
    .from("elections")
    .select("id, name, start_datetime, end_datetime, election_status_id, election_statuses(name)")
    .eq("id", electionId)
    .single();

  if (electError || !election) {
    return {
      ready: false,
      issues: ["Election record not found."],
      positionCount: 0,
      candidateCount: 0,
      approvedCandidateCount: 0,
      voterCount: 0,
    };
  }

  if (!election.name || !election.name.trim()) {
    issues.push("Election title is required.");
  }

  const startTime = new Date(election.start_datetime).getTime();
  const endTime = new Date(election.end_datetime).getTime();

  if (isNaN(startTime) || isNaN(endTime) || endTime <= startTime) {
    issues.push("Election end date/time must be strictly after the start date/time.");
  }

  // 2. Query position count
  const { count: posCount } = await supabase
    .from("positions")
    .select("id", { count: "exact", head: true })
    .eq("election_id", electionId);

  const positionCount = posCount ?? 0;
  if (positionCount < 1) {
    issues.push("At least one elective position must be configured for the election.");
  }

  // 3. Query total candidate count & Approved candidate count (OD-10.2)
  const { count: candCount } = await supabase
    .from("candidates")
    .select("id", { count: "exact", head: true })
    .eq("election_id", electionId);

  const candidateCount = candCount ?? 0;

  // Query status ID for "Approved"
  const { data: approvedStatus } = await supabase
    .from("candidate_statuses")
    .select("id")
    .eq("name", "Approved")
    .maybeSingle();

  let approvedCandidateCount = 0;
  if (approvedStatus?.id) {
    const { count: appCount } = await supabase
      .from("candidates")
      .select("id", { count: "exact", head: true })
      .eq("election_id", electionId)
      .eq("candidate_status_id", approvedStatus.id);

    approvedCandidateCount = appCount ?? 0;
  }

  if (approvedCandidateCount < 1) {
    issues.push("At least one candidate with 'Approved' status is required for the election (OD-10.2).");
  }

  // 4. Query voter register count
  const { count: regCount } = await supabase
    .from("student_register")
    .select("id", { count: "exact", head: true })
    .eq("election_id", electionId);

  const voterCount = regCount ?? 0;
  if (voterCount < 1) {
    issues.push("The election voter register (student_register) must contain at least one eligible student.");
  }

  return {
    ready: issues.length === 0,
    issues,
    positionCount,
    candidateCount,
    approvedCandidateCount,
    voterCount,
  };
}

/**
 * Transitions an election to a new lifecycle status with strict forward state governance (OD-10.1).
 * Permitted forward path: Draft -> Scheduled -> Open -> Closed -> Published.
 * Draft remains fully editable prior to scheduling. Backward transitions are strictly blocked.
 */
export async function transitionElectionStatus(
  electionId: string,
  newStatusId: string
): Promise<void> {
  // 1. Fetch current status and target status names
  const { data: election } = await supabase
    .from("elections")
    .select("id, start_datetime, end_datetime, election_statuses(name)")
    .eq("id", electionId)
    .single();

  const currentStatusObj = Array.isArray(election?.election_statuses)
    ? election?.election_statuses[0]
    : election?.election_statuses;
  const currentStatusName = currentStatusObj?.name || "Draft";

  const { data: targetStatus } = await supabase
    .from("election_statuses")
    .select("name")
    .eq("id", newStatusId)
    .single();

  const targetStatusName = targetStatus?.name;

  if (!targetStatusName) {
    throw new Error("Invalid target status specified.");
  }

  if (currentStatusName === targetStatusName) {
    return; // No-op
  }

  // Block any transition out of terminal state (Immutability rule)
  if (currentStatusName === "Results Available" || currentStatusName === "Published") {
    throw new Error("Concluded elections with official results are immutable and cannot transition to another status.");
  }

  // Canonical lifecycle state progression
  const canonicalStages = [
    "Draft",
    "Scheduled",
    "Open",
    "Results Pending",
    "Results Available",
  ];

  const mapToCanonical = (name: string): string => {
    const norm = name.trim().toLowerCase();
    if (norm.includes("draft") || norm.includes("plan")) return "Draft";
    if (norm.includes("sched") || norm.includes("upcom")) return "Scheduled";
    if (norm === "open" || norm === "active") return "Open";
    if (norm.includes("pending") || norm.includes("close") || norm.includes("review")) return "Results Pending";
    if (norm.includes("available") || norm === "published") return "Results Available";
    return name;
  };

  const canonicalCurrent = mapToCanonical(currentStatusName);
  const canonicalTarget = mapToCanonical(targetStatusName);
  const currentIndex = canonicalStages.indexOf(canonicalCurrent);
  const targetIndex = canonicalStages.indexOf(canonicalTarget);

  if (currentIndex !== -1 && targetIndex !== -1) {
    if (targetIndex < currentIndex) {
      throw new Error(`Backward lifecycle transition from ${currentStatusName} to ${targetStatusName} is strictly prohibited.`);
    }
    if (targetIndex > currentIndex + 1) {
      throw new Error(`Arbitrary lifecycle skip from ${currentStatusName} to ${targetStatusName} is prohibited. Lifecycle must follow: Draft -> Scheduled -> Open -> Results Pending -> Results Available.`);
    }
  }

  // If transitioning to Results Available, execute authoritative calculation
  if (canonicalTarget === "Results Available") {
    const { error: calcErr } = await supabase.rpc("calculate_election_results", {
      p_election_id: electionId,
    });
    if (calcErr) {
      throw new Error(`Authoritative results calculation failed: ${calcErr.message}`);
    }
    return;
  }

  // Enforce readiness check when transitioning into Scheduled or Open (OD-10.2, Package Sec 17)
  if (targetStatusName === "Scheduled" || targetStatusName === "Open") {
    const readiness = await checkElectionReadiness(electionId);
    if (!readiness.ready) {
      throw new Error(`Cannot advance election to ${targetStatusName} due to readiness issues: ${readiness.issues.join(" ")}`);
    }
  }

  // Validate Open timing
  if (targetStatusName === "Open") {
    const now = new Date();
    const startTime = new Date(election?.start_datetime || "");
    if (now < startTime) {
      throw new Error(`Election cannot be opened before its scheduled start time (${startTime.toLocaleString()}).`);
    }
  }

  // Execute database transition
  const { error } = await supabase
    .from("elections")
    .update({
      election_status_id: newStatusId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", electionId);

  if (error) {
    throw new Error(`Failed to transition election lifecycle status: ${error.message}`);
  }
}

/**
 * Executes the authoritative database calculation RPC for administrative calculation.
 * Strictly read-only calculation derived from anonymous ballot_selections.
 * Automatically persists results and advances lifecycle to Results Available.
 */
export async function reviewElectionResults(
  electionId: string
): Promise<ElectionResultsData> {
  const { data, error } = await supabase.rpc("calculate_election_results", {
    p_election_id: electionId,
  });

  if (error) {
    throw new Error(`Authoritative results calculation failed: ${error.message}`);
  }

  const raw = data as Record<string, unknown>;
  const rawPositions = (raw.positions as unknown as unknown[]) || [];

  return {
    election_id: (raw.election_id as string) || electionId,
    election_title: (raw.election_name as string) || (raw.election_title as string) || "Election Results",
    calculated_at: (raw.calculated_at as string) || new Date().toISOString(),
    positions: rawPositions.map((p) => {
      const posObj = p as Record<string, unknown>;
      const rawCandidates = (posObj.candidates as unknown as unknown[]) || [];
      const winnerId = (posObj.winner_candidate_id as string) || null;
      return {
        position_id: posObj.position_id as string,
        position_name: posObj.position_name as string,
        total_valid_selections: Number(posObj.total_valid_selections || 0),
        status: (posObj.status as "Decided" | "Tied" | "No Selections") || "Decided",
        winner_candidate_id: winnerId,
        candidates: rawCandidates.map((c) => {
          const cObj = c as Record<string, unknown>;
          const candId = cObj.candidate_id as string;
          return {
            candidate_id: candId,
            candidate_name: cObj.candidate_name as string | undefined,
            votes: Number(cObj.votes || 0),
            percentage: Number(cObj.percentage || 0),
            is_winner: Boolean(cObj.is_winner ?? (winnerId && winnerId === candId)),
          };
        }),
      };
    }),
  };
}

/**
 * Invokes the authoritative publish_election_results RPC (OD-12.1).
 * Enforces election-specific Electoral Officer assignment authorization.
 */
export async function publishElectionResults(
  electionId: string
): Promise<{ success: boolean; message: string }> {
  const { data, error } = await supabase.rpc("publish_election_results", {
    p_election_id: electionId,
  });

  if (error) {
    throw new Error(error.message || "Failed to publish election results.");
  }

  const res = data as Record<string, unknown>;
  return {
    success: Boolean(res?.success ?? true),
    message: String(res?.message || "Election results successfully published."),
  };
}
