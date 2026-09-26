/**
 * Types for Milestone 3 / Milestone 4 Results (B51–B53, B80, ODR-002)
 * Project: Student Online Voting Platform
 * 
 * Architectural Governance:
 * - Decision A: Anonymous ballot selections (zero voter identity in results)
 * - Decision G: Tie Handling (Winner = null, status = 'Tied')
 * - Decision H: Percentage Denominator = total valid candidate selections for that position
 * - Decision I: Results calculated after election closure
 */

import type { Election } from "@/features/elections/types";

export interface CandidateResultItem {
  candidate_id: string;
  candidate_name?: string;
  department?: string | null;
  matric_number?: string | null;
  photo_path?: string | null;
  votes: number;
  percentage: number | null;
  is_winner: boolean;
}

export type PositionResultStatus = "Decided" | "Tied" | "No Selections";

export interface PositionResultItem {
  position_id: string;
  position_name: string;
  total_valid_selections: number;
  status: PositionResultStatus;
  winner_candidate_id: string | null;
  candidates: CandidateResultItem[];
}

export interface ElectionResultsData {
  election_id: string;
  election_title?: string;
  calculated_at: string;
  positions: PositionResultItem[];
}

export type ResultAccessState =
  | "loading"
  | "available"
  | "voting_ongoing"
  | "not_yet_published"
  | "no_results"
  | "error";

export interface ElectionResultResponse {
  state: ResultAccessState;
  election: Election | null;
  results: ElectionResultsData | null;
  message?: string;
  error?: string | null;
}
