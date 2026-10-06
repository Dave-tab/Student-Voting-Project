/**
 * Results Service (B94–B100, ODR-002, OD-12.1)
 * Project: Student Online Voting Platform
 * 
 * ARCHITECTURAL GOVERNANCE RULES:
 * 1. Consumes official published results via read-only RPC `get_published_election_results`.
 * 2. Anonymity: Zero student_id, user_id, or ballot reference in result aggregates.
 * 3. Percentage Rule (Decision H): Denominator = total valid candidate selections for each position.
 * 4. Winner / Tie Rule (Decision G): Handled authoritatively by backend (Winner = null if Tied).
 * 5. Publication boundary: Calculated authoritatively by system once election ends.
 * 6. NO MOCK DATA: Never fabricates candidate votes, percentages, or winners.
 */

import { supabase } from "@/lib/supabase";
import { getElectionById, getApprovedCandidates } from "@/features/elections/services/electionService";
import { getElectionStatus } from "@/features/elections/utils/electionUtils";
import type {
  ElectionResultResponse,
  ElectionResultsData,
  PositionResultItem,
  CandidateResultItem,
} from "../types";
import type { Candidate } from "@/features/elections/types";

interface RawRpcResponse {
  election_id: string;
  calculated_at: string;
  positions: Array<{
    position_id: string;
    position_name: string;
    total_valid_selections: number;
    status: "Decided" | "Tied" | "No Selections";
    winner_candidate_id: string | null;
    candidates: Array<{
      candidate_id: string;
      candidate_name?: string;
      department?: string;
      matriculation_number?: string;
      photo_path?: string;
      votes: number;
      percentage: number | null;
      is_winner: boolean;
    }>;
  }>;
}

/**
 * Retrieves aggregate election results using authoritative backend read-only RPC.
 * Respects election lifecycle state and least-privilege security boundaries.
 */
export async function getElectionResults(electionId: string): Promise<ElectionResultResponse> {
  if (!electionId) {
    return {
      state: "error",
      election: null,
      results: null,
      error: "Invalid election identifier provided.",
    };
  }

  try {
    // 1. Authoritative Database Lifecycle Reconciliation
    try {
      await supabase.rpc("check_and_advance_election_lifecycle", {
        p_election_id: electionId,
      });
    } catch (e) {
      console.warn("check_and_advance_election_lifecycle notice:", e);
    }

    // 2. Fetch Election Metadata
    const election = await getElectionById(electionId, null);
    if (!election) {
      return {
        state: "error",
        election: null,
        results: null,
        error: "The specified election could not be found.",
      };
    }

    const lifecycleStatus = getElectionStatus(election);

    // 3. Lifecycle Checks
    if (
      lifecycleStatus === "Scheduled" ||
      lifecycleStatus === "Upcoming" ||
      lifecycleStatus === "Draft" ||
      lifecycleStatus === "Planning"
    ) {
      return {
        state: "not_yet_published",
        election,
        results: null,
        message:
          "Voting for this election has not yet commenced. Official results will be automatically available after voting closes.",
      };
    }

    // Active Voting Window: strictly NO candidate tallies exposed to public or students
    if (lifecycleStatus === "Open" || lifecycleStatus === "Active") {
      return {
        state: "voting_ongoing",
        election,
        results: null,
        message:
          "Voting is currently in progress. Candidate tallies and official results are strictly confidential during active voting and will be automatically available once the election concludes.",
      };
    }

    if (lifecycleStatus === "Results Pending") {
      return {
        state: "not_yet_published",
        election,
        results: null,
        message:
          "Voting has concluded. Official results are currently being calculated automatically.",
      };
    }

    if (lifecycleStatus !== "Published" && lifecycleStatus !== "Results Available") {
      return {
        state: "not_yet_published",
        election,
        results: null,
        message:
          "Official results are not available until voting concludes and automatic calculation is complete.",
      };
    }

    // 4. Concluded Election: Query Authoritative get_published_election_results RPC
    const { data: rpcData, error: rpcError } = await supabase.rpc("get_published_election_results", {
      p_election_id: electionId,
    });

    if (rpcError) {
      const errorMsg = rpcError.message || "";

      if (
        errorMsg.toLowerCase().includes("not yet published") ||
        errorMsg.toLowerCase().includes("not available") ||
        errorMsg.toLowerCase().includes("being calculated")
      ) {
        return {
          state: "not_yet_published",
          election,
          results: null,
          message: errorMsg,
        };
      }

      console.error("RPC get_published_election_results error:", rpcError);
      return {
        state: "error",
        election,
        results: null,
        error: "Unable to compile election results at this time. Please check back shortly.",
      };
    }

    if (!rpcData) {
      return {
        state: "no_results",
        election,
        results: null,
        message: "No election results recorded for this election.",
      };
    }

    const typedRpc = rpcData as unknown as RawRpcResponse;

    if (!typedRpc.positions || typedRpc.positions.length === 0) {
      return {
        state: "no_results",
        election,
        results: null,
        message: "No positions or candidate selections were recorded for this election.",
      };
    }

    const resultsData = await enrichResults(typedRpc, electionId, election.title);

    return {
      state: "available",
      election,
      results: resultsData,
    };
  } catch (err) {
    console.error("Unexpected error in getElectionResults:", err);
    return {
      state: "error",
      election: null,
      results: null,
      error: err instanceof Error ? err.message : "An unexpected error occurred while loading election results.",
    };
  }
}

/**
 * Enriches raw RPC results with candidate metadata (names, departments, photos).
 */
async function enrichResults(
  typedRpc: RawRpcResponse,
  electionId: string,
  electionTitle: string
): Promise<ElectionResultsData> {
  let approvedCandidates: Candidate[] = [];
  try {
    approvedCandidates = await getApprovedCandidates(electionId);
  } catch (e) {
    console.warn("Could not fetch candidate details for enrichment:", e);
  }

  const candidateMap = new Map<string, Candidate>();
  for (const cand of approvedCandidates) {
    candidateMap.set(cand.id, cand);
  }

  const enrichedPositions: PositionResultItem[] = typedRpc.positions.map((pos) => {
    const enrichedCandidates: CandidateResultItem[] = (pos.candidates || []).map((c) => {
      const candidateMeta = candidateMap.get(c.candidate_id);
      const studentInfo = candidateMeta?.student;
      
      let candidateName = c.candidate_name;
      if (!candidateName) {
        if (studentInfo) {
          if (studentInfo.full_name) {
            candidateName = studentInfo.full_name;
          } else {
            const names = [studentInfo.first_name, studentInfo.last_name].filter(Boolean);
            if (names.length > 0) {
              candidateName = names.join(" ");
            } else if (studentInfo.matriculation_number) {
              candidateName = `Candidate (${studentInfo.matriculation_number})`;
            }
          }
        }
      }
      if (!candidateName) {
        candidateName = `Candidate (${c.candidate_id.slice(0, 8)})`;
      }

      return {
        candidate_id: c.candidate_id,
        candidate_name: candidateName,
        department: c.department || studentInfo?.department || null,
        matriculation_number: c.matriculation_number || studentInfo?.matriculation_number || null,
        photo_path: c.photo_path || candidateMeta?.candidate_details?.photo_path || null,
        votes: c.votes,
        percentage: c.percentage,
        is_winner: c.is_winner,
      };
    });

    return {
      position_id: pos.position_id,
      position_name: pos.position_name,
      total_valid_selections: pos.total_valid_selections,
      status: pos.status,
      winner_candidate_id: pos.winner_candidate_id,
      candidates: enrichedCandidates,
    };
  });

  return {
    election_id: typedRpc.election_id || electionId,
    election_title: electionTitle,
    calculated_at: typedRpc.calculated_at || new Date().toISOString(),
    positions: enrichedPositions,
  };
}

/**
 * Invokes the authoritative publish_election_results RPC to finalize election results (OD-12.1).
 * Requires caller to be the assigned Electoral Officer for the specific election.
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
