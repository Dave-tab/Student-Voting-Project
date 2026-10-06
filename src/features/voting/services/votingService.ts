import { supabase } from "@/lib/supabase";
import type { BallotSubmissionPayload, BallotSubmissionResult } from "../types";

interface RPCBallotResponse {
  success?: boolean;
  message?: string;
  error?: string;
  participated_at?: string;
}

/**
 * Authoritative Voting Service Submission Boundary (B87–B93).
 *
 * ARCHITECTURAL BOUNDARY:
 * Invokes the authoritative database RPC `submit_ballot` with SECURITY DEFINER.
 * 1. Derives voter identity strictly from server-side `auth.uid()`.
 * 2. Enforces election-specific voter register eligibility (Decision E).
 * 3. Enforces self-voting prohibition (ODR-003).
 * 4. Ensures atomic persistence across `voter_participation` and `ballot_selections`.
 * 5. Returns approved completion confirmation without any Vote Reference Code (Decision D).
 *
 * NO-MOCK GOVERNANCE RULE:
 * This service never simulates fake success, fake references, or fake receipts.
 * It directly integrates with the authoritative PostgreSQL database boundary.
 */
export async function submitBallot(
  payload: BallotSubmissionPayload
): Promise<BallotSubmissionResult> {
  if (!payload.electionId) {
    return {
      success: false,
      error: "Invalid ballot: Missing election identifier.",
    };
  }

  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return {
        success: false,
        error: "Authentication required: You must be logged in as an eligible student to cast your ballot.",
      };
    }

    // Normalize selections into the array structure expected by submit_ballot RPC
    const formattedSelections: Array<{ position_id: string; candidate_id: string }> = [];

    if (Array.isArray(payload.selections)) {
      for (const item of payload.selections as unknown as Array<{ position_id?: string; candidate_id?: string }>) {
        if (item && typeof item === "object" && item.position_id) {
          formattedSelections.push({
            position_id: String(item.position_id),
            candidate_id: item.candidate_id ? String(item.candidate_id) : "",
          });
        }
      }
    } else if (payload.selections && typeof payload.selections === "object") {
      for (const [posId, candId] of Object.entries(payload.selections)) {
        if (posId && candId) {
          formattedSelections.push({
            position_id: posId,
            candidate_id: candId,
          });
        }
      }
    }

    const { data, error } = await supabase.rpc("submit_ballot", {
      p_election_id: payload.electionId,
      p_selections: formattedSelections,
    });

    if (error) {
      return {
        success: false,
        error: error.message || "Vote submission was rejected by the authoritative voting engine.",
      };
    }

    const res = data as unknown as RPCBallotResponse;

    if (res && res.success) {
      return {
        success: true,
        message: res.message || "Vote submitted successfully. Your participation has been recorded.",
        participatedAt: res.participated_at || new Date().toISOString(),
      };
    }

    return {
      success: false,
      error: res?.error || "Unable to confirm ballot submission.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected network error occurred.";
    return {
      success: false,
      error: message,
    };
  }
}
